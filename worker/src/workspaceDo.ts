import { DurableObject } from 'cloudflare:workers';
import { createInitialSeed, DEFAULT_ROLE_PERMISSIONS } from '../../server/seed';
import {
  AqarDatabaseState,
  AuditLog,
  BackupCollectionDiff,
  BackupPreviewResult,
  BackupSnapshot,
  CustomRoleDefinition,
  Lead,
  Payment,
  PaymentAllocation,
  PermissionKey,
  PermissionLevel,
  PermissionModuleKey,
  RoleKey,
  StaffUser,
  SyncConflictRecord,
} from '../../src/types/aqar';
import {
  ALL_PROPERTIES_SCOPE,
  buildAllDefaultRoleModulePermissions,
  canUserAccessCompany,
  canUserAccessProperty,
  deriveLegacyPermissionsFromModules,
  filterStateForUser,
  getAccessiblePropertyIdsSet,
  getAllowedNavsForUser,
  getRecommendedLandingNav,
  isPropertyScopeShrink,
  isRoleDowngrade,
  isUserAccountActive,
  ROLE_TEMPLATES,
  sanitizeUserForClient,
  userHasAllPropertiesAccess,
  userHasLegacyPermission,
  userHasModuleAction,
} from '../../src/utils/rbac';
import {
  decryptBackupWeb,
  encryptBackupWeb,
  hashSecretWeb,
  signTokenWeb,
  verifySecretWeb,
  verifyTokenWeb,
  WebEncryptedEnvelope,
} from './cryptoWeb';

export interface WorkerEnv {
  ASSETS: Fetcher;
  WORKSPACE_DO: DurableObjectNamespace<AqarWorkspaceDO>;
  AQAR_SESSION_SECRET?: string;
  AQAR_DEMO_LOGIN?: string;
  AQAR_ALLOW_SEED_DEFAULTS?: string;
  AQAR_BOOTSTRAP_ADMIN_PASSWORD?: string;
  AQAR_BOOTSTRAP_ADMIN_EMAIL?: string;
  AQAR_BOOTSTRAP_ADMIN_PIN?: string;
  GEMINI_API_KEY?: string;
}

export class WorkerPermissionDeniedError extends Error {
  public readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'WorkerPermissionDeniedError';
  }
}

const SESSION_COOKIE_NAME = 'aqar_session';
const REFRESH_COOKIE_NAME = 'aqar_refresh';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60 * 4;
const SESSION_SHORT_TTL_MS = 1000 * 60 * 60 * 8;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

const ARRAY_COLLECTIONS: (keyof AqarDatabaseState)[] = [
  'companies',
  'users',
  'customRoles',
  'employeeInvitations',
  'properties',
  'units',
  'meterReadings',
  'owners',
  'ownerShares',
  'ownerTransfers',
  'vendors',
  'tenants',
  'leads',
  'leadEscalations',
  'contracts',
  'handovers',
  'installments',
  'payments',
  'accounts',
  'journals',
  'expenses',
  'supplierInvoices',
  'recurringExpenses',
  'propertyBudgets',
  'assets',
  'tickets',
  'tasks',
  'communications',
  'documents',
  'purchaseOrders',
  'decisions',
  'notifications',
  'reminderRules',
  'reminderLogs',
  'auditLogs',
  'backups',
  'savedArchiveFilters',
  'loginHistory',
  'syncConflicts',
  'scheduledReports',
  'favoriteReports',
  'sharedSearchFilters',
  'zatcaInvoices',
  'communicationTemplates',
];

const SINGLETON_KEYS: (keyof AqarDatabaseState)[] = [
  'settings',
  'rolePermissions',
  'roleModulePermissions',
  'counters',
  'processedIdempotencyKeys',
  'archiveLastNightlyRun',
  'archiveSeeded',
  'securityPolicy',
  'teamSeeded',
  'syncRevision',
  'entityRevisions',
  'lastUpdatedAt',
];

interface WsAttachment {
  sessionId: string;
  userId: string;
  workspaceId: string;
  authenticated: boolean;
  deviceName: string;
  connectedAt: string;
}

interface AuthedActor {
  userId: string;
  workspaceId: string;
  role: RoleKey;
  sessionId: string;
  rawToken: string;
  deviceName: string;
}

const PUBLIC_PATHS = new Set([
  '/api/health',
  '/api/workspaces/provision',
  '/api/auth/session',
  '/api/auth/login',
  '/api/auth/login-pin',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/public/prospect-context',
  '/api/public/leads',
]);

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function sha256HexWeb(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomHexWeb(byteLength = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(byteLength));
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(err: unknown, defaultStatus = 400): Response {
  if (err instanceof WorkerPermissionDeniedError) {
    return jsonResponse({ error: err.message, code: 'FORBIDDEN' }, 403);
  }
  const msg = (err as Error)?.message || 'تعذر تنفيذ الطلب';
  return jsonResponse({ error: msg }, defaultStatus);
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function isSecureRequest(req: Request): boolean {
  try {
    const fwd = req.headers.get('x-forwarded-proto');
    if (fwd && fwd.split(',')[0].trim().toLowerCase() === 'https') return true;
    return new URL(req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizePhone(raw: string): string {
  return (raw || '').replace(/[^\d]/g, '').slice(-9);
}

function resolveRequestWorkspace(request: Request): string {
  const hdr = (request.headers.get('x-resolved-workspace-id') || request.headers.get('x-workspace-id') || '')
    .trim()
    .toLowerCase();
  if (hdr && /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(hdr)) {
    return hdr;
  }
  return 'default';
}

export class AqarWorkspaceDO extends DurableObject<WorkerEnv> {
  private stateCache: AqarDatabaseState | null = null;
  private initialized = false;
  private sessionSecretCache: string | null = null;

  constructor(ctx: DurableObjectState, env: WorkerEnv) {
    super(ctx, env);
    this.initSchema();
  }

  private initSchema() {
    const sql = this.ctx.storage.sql;
    sql.exec(`
      CREATE TABLE IF NOT EXISTS kv_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS entities (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        company_id TEXT NOT NULL DEFAULT 'default',
        sort_order INTEGER NOT NULL DEFAULT 0,
        revision INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL,
        data TEXT NOT NULL,
        PRIMARY KEY (collection, id)
      );
      CREATE INDEX IF NOT EXISTS idx_do_entities_col ON entities (collection, sort_order);
      CREATE INDEX IF NOT EXISTS idx_do_entities_comp ON entities (company_id, collection);

      CREATE TABLE IF NOT EXISTS state_snapshots (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        sync_revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        state_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_credentials (
        user_id TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        pin_hash TEXT,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workspace_id TEXT NOT NULL DEFAULT 'default',
        device_name TEXT NOT NULL,
        app_type TEXT NOT NULL DEFAULT 'web',
        remember_me INTEGER NOT NULL DEFAULT 1,
        refresh_token_hash TEXT,
        refresh_expires_at TEXT,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        revoked INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS operations_log (
        operation_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        method TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        status TEXT NOT NULL,
        response_json TEXT,
        processed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS backups_store (
        id TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    const alterCols = [
      'ALTER TABLE user_credentials ADD COLUMN failed_attempts INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE user_credentials ADD COLUMN locked_until TEXT',
      "ALTER TABLE sessions ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'default'",
      "ALTER TABLE sessions ADD COLUMN app_type TEXT NOT NULL DEFAULT 'web'",
      'ALTER TABLE sessions ADD COLUMN remember_me INTEGER NOT NULL DEFAULT 1',
      'ALTER TABLE sessions ADD COLUMN refresh_token_hash TEXT',
      'ALTER TABLE sessions ADD COLUMN refresh_expires_at TEXT',
    ];
    for (const stmt of alterCols) {
      try {
        sql.exec(stmt);
      } catch {
        // column already exists
      }
    }
  }

  private normalizeLoadedState(rawState: AqarDatabaseState, workspaceId: string): AqarDatabaseState {
    const base = createInitialSeed();
    const defCompanyId = (rawState.companies || base.companies || [])[0]?.id || `comp-${workspaceId}`;
    const mergedRolePermissions: Record<RoleKey, PermissionKey[]> = {
      ...DEFAULT_ROLE_PERMISSIONS,
      ...(rawState.rolePermissions || {}),
    };
    const mergedRoleModulePermissions = {
      ...buildAllDefaultRoleModulePermissions(),
      ...(rawState.roleModulePermissions || {}),
    };
    const users: StaffUser[] = (rawState.users || []).map((u) => ({
      ...u,
      companyId: u.role === 'sys_owner' ? u.companyId : u.companyId || defCompanyId,
      accountStatus: u.accountStatus || (u.active ? 'نشط' : 'موقوف'),
    }));
    return {
      ...base,
      ...rawState,
      users,
      customRoles: Array.isArray(rawState.customRoles) ? rawState.customRoles : [],
      employeeInvitations: Array.isArray(rawState.employeeInvitations) ? rawState.employeeInvitations : [],
      rolePermissions: mergedRolePermissions,
      roleModulePermissions: mergedRoleModulePermissions,
      entityRevisions: rawState.entityRevisions || {},
    };
  }

  private loadNormalizedState(workspaceId: string): AqarDatabaseState | null {
    const sql = this.ctx.storage.sql;
    const settingsRow = sql
      .exec<{ value: string }>("SELECT value FROM kv_meta WHERE key = 'singleton:settings'")
      .toArray()[0];
    if (!settingsRow) return null;

    const base = createInitialSeed();
    const out: Record<string, unknown> = { ...base };

    const metaRows = sql
      .exec<{ key: string; value: string }>("SELECT key, value FROM kv_meta WHERE key LIKE 'singleton:%'")
      .toArray();
    for (const row of metaRows) {
      const k = row.key.slice('singleton:'.length);
      try {
        out[k] = JSON.parse(row.value);
      } catch {
        out[k] = row.value;
      }
    }

    for (const col of ARRAY_COLLECTIONS) {
      const rows = sql
        .exec<{ data: string }>('SELECT data FROM entities WHERE collection = ? ORDER BY sort_order ASC', String(col))
        .toArray();
      if (rows.length > 0 || col === 'customRoles' || col === 'employeeInvitations') {
        out[String(col)] = rows.map((r) => JSON.parse(r.data));
      } else {
        out[String(col)] = rows.map((r) => JSON.parse(r.data));
      }
    }

    return this.normalizeLoadedState(out as unknown as AqarDatabaseState, workspaceId);
  }

  private saveNormalizedState(state: AqarDatabaseState, workspaceId: string) {
    const sql = this.ctx.storage.sql;
    const now = state.lastUpdatedAt || new Date().toISOString();
    const revisions = state.entityRevisions || {};

    this.ctx.storage.transactionSync(() => {
      for (const key of SINGLETON_KEYS) {
        const val = state[key];
        if (val !== undefined) {
          sql.exec('INSERT OR REPLACE INTO kv_meta (key, value) VALUES (?, ?)', `singleton:${String(key)}`, JSON.stringify(val));
        }
      }

      for (const col of ARRAY_COLLECTIONS) {
        const list = (state[col] as unknown[] | undefined) || [];
        sql.exec('DELETE FROM entities WHERE collection = ?', String(col));
        for (let idx = 0; idx < list.length; idx++) {
          const item = list[idx] as Record<string, unknown>;
          const entityId = String(item?.id || `${String(col)}-${idx}`);
          const companyId = String(item?.companyId || workspaceId || 'default');
          const revKey = `${String(col)}:${entityId}`;
          const rev = revisions[revKey] || 1;
          sql.exec(
            'INSERT INTO entities (collection, id, company_id, sort_order, revision, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
            String(col),
            entityId,
            companyId,
            idx,
            rev,
            now,
            JSON.stringify(item)
          );
        }
      }
    });
  }

  private async ensureBootstrapped(workspaceId: string): Promise<AqarDatabaseState> {
    if (this.initialized && this.stateCache) return this.stateCache;

    const sql = this.ctx.storage.sql;
    const normalized = this.loadNormalizedState(workspaceId);
    if (normalized) {
      this.stateCache = normalized;
    } else {
      const legacyRows = sql.exec<{ state_json: string }>('SELECT state_json FROM state_snapshots WHERE id = 1').toArray();
      if (legacyRows.length > 0) {
        const parsed = this.normalizeLoadedState(JSON.parse(legacyRows[0].state_json) as AqarDatabaseState, workspaceId);
        this.stateCache = parsed;
        this.saveNormalizedState(parsed, workspaceId);
      } else if (workspaceId === 'default') {
        const seed = this.normalizeLoadedState(createInitialSeed(), workspaceId);
        this.stateCache = seed;
        this.saveNormalizedState(seed, workspaceId);
      } else {
        const emptySeed = this.createEmptyWorkspaceSeed(workspaceId);
        this.stateCache = emptySeed;
        this.saveNormalizedState(emptySeed, workspaceId);
      }
    }

    // Strict credential seeding policy:
    // Only seed default demo credentials ('Aqar@2026' / '1234') when explicitly enabled via env flags.
    const allowSeedDefaults =
      this.env.AQAR_ALLOW_SEED_DEFAULTS === 'true' || this.env.AQAR_DEMO_LOGIN === 'true';
    const bootstrapPassword = (this.env.AQAR_BOOTSTRAP_ADMIN_PASSWORD || '').trim();
    const bootstrapEmail = (this.env.AQAR_BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
    const bootstrapPin = (this.env.AQAR_BOOTSTRAP_ADMIN_PIN || '').trim();

    if (allowSeedDefaults) {
      const existingCreds = new Set(
        sql.exec<{ user_id: string }>('SELECT user_id FROM user_credentials').toArray().map((r) => r.user_id)
      );
      const defaultPwHash = await hashSecretWeb('Aqar@2026');
      const defaultPinHash = await hashSecretWeb('1234');
      const now = new Date().toISOString();
      for (const user of this.stateCache.users) {
        if (!existingCreds.has(user.id)) {
          sql.exec(
            'INSERT INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)',
            user.id,
            defaultPwHash,
            defaultPinHash,
            now
          );
        }
      }
    } else if (bootstrapPassword.length >= 8) {
      const existingCreds = new Set(
        sql.exec<{ user_id: string }>('SELECT user_id FROM user_credentials').toArray().map((r) => r.user_id)
      );
      const targetAdmin =
        this.stateCache.users.find((u) => bootstrapEmail && u.email.toLowerCase() === bootstrapEmail) ||
        this.stateCache.users.find((u) => u.role === 'sys_owner');
      if (targetAdmin && !existingCreds.has(targetAdmin.id)) {
        const pwHash = await hashSecretWeb(bootstrapPassword);
        const pinHash = /^\d{4,6}$/.test(bootstrapPin) ? await hashSecretWeb(bootstrapPin) : null;
        sql.exec(
          'INSERT INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)',
          targetAdmin.id,
          pwHash,
          pinHash,
          new Date().toISOString()
        );
      }
    }

    // Ensure persistent session HMAC secret
    if (this.env.AQAR_SESSION_SECRET && this.env.AQAR_SESSION_SECRET.length >= 16) {
      this.sessionSecretCache = this.env.AQAR_SESSION_SECRET;
    } else {
      const secretRow = sql.exec<{ value: string }>("SELECT value FROM kv_meta WHERE key = 'session_secret'").toArray();
      if (secretRow.length > 0) {
        this.sessionSecretCache = secretRow[0].value;
      } else {
        const hex = randomHexWeb(32);
        sql.exec("INSERT INTO kv_meta (key, value) VALUES ('session_secret', ?)", hex);
        this.sessionSecretCache = hex;
      }
    }

    this.initialized = true;
    return this.stateCache;
  }

  private createEmptyWorkspaceSeed(
    workspaceId: string,
    companyNameAr = 'منشأة عقارية جديدة',
    companyNameEn = 'New Real Estate Workspace'
  ): AqarDatabaseState {
    const base = createInitialSeed();
    const now = new Date().toISOString();
    return {
      ...base,
      settings: {
        ...base.settings,
        nameAr: companyNameAr,
        nameEn: companyNameEn,
      },
      companies: [
        {
          id: `comp-${workspaceId}`,
          nameAr: companyNameAr,
          nameEn: companyNameEn,
          city: base.settings.city,
          vatNumber: '',
          crNumber: '',
          address: base.settings.address || '',
          phone: base.settings.phone || '',
          email: base.settings.email || '',
          bankName: base.settings.bankAccounts?.[0]?.bankName || '',
          iban: base.settings.bankAccounts?.[0]?.iban || '',
          receiptFooterAr: '',
          isDefault: true,
        },
      ],
      users: [],
      customRoles: [],
      employeeInvitations: [],
      properties: [],
      units: [],
      meterReadings: [],
      owners: [],
      ownerShares: [],
      ownerTransfers: [],
      vendors: [],
      tenants: [],
      leads: [],
      leadEscalations: [],
      contracts: [],
      handovers: [],
      installments: [],
      payments: [],
      journals: [],
      expenses: [],
      supplierInvoices: [],
      recurringExpenses: [],
      propertyBudgets: [],
      assets: [],
      tickets: [],
      tasks: [],
      communications: [],
      documents: [],
      purchaseOrders: [],
      decisions: [],
      notifications: [],
      reminderLogs: [],
      auditLogs: [],
      backups: [],
      loginHistory: [],
      syncConflicts: [],
      zatcaInvoices: [],
      rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
      roleModulePermissions: buildAllDefaultRoleModulePermissions(),
      counters: {
        receipt: 0,
        expense: 0,
        ticket: 0,
        journal: 0,
        contract: 0,
      },
      processedIdempotencyKeys: [],
      entityRevisions: {},
      syncRevision: 1,
      lastUpdatedAt: now,
    };
  }

  private persistState(state: AqarDatabaseState, workspaceId: string) {
    state.lastUpdatedAt = new Date().toISOString();
    state.syncRevision = (state.syncRevision || 1) + 1;
    this.stateCache = state;
    this.saveNormalizedState(state, workspaceId);
  }

  private persistSecurityAuditImmediate(state: AqarDatabaseState, entry: AuditLog, workspaceId: string) {
    if (!state.auditLogs) state.auditLogs = [];
    state.auditLogs.unshift(entry);
    if (state.auditLogs.length > 500) {
      state.auditLogs = state.auditLogs.slice(0, 500);
    }
    const sql = this.ctx.storage.sql;
    this.ctx.storage.transactionSync(() => {
      sql.exec("DELETE FROM entities WHERE collection = 'auditLogs'");
      for (let idx = 0; idx < state.auditLogs.length; idx++) {
        const item = state.auditLogs[idx];
        sql.exec(
          'INSERT INTO entities (collection, id, company_id, sort_order, revision, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
          'auditLogs',
          item.id,
          workspaceId || 'default',
          idx,
          1,
          item.createdAt || new Date().toISOString(),
          JSON.stringify(item)
        );
      }
    });
  }

  private recordDeniedAccess(
    state: AqarDatabaseState,
    workspaceId: string,
    actor: StaffUser | undefined,
    action: string,
    entityType: string,
    entityId: string,
    reason: string,
    opts?: { propertyId?: string; deviceName?: string }
  ) {
    const entry: AuditLog = {
      id: uid('aud'),
      userId: actor?.id || 'anonymous',
      userName: actor?.nameAr || 'غير معروف',
      userRole: actor?.roleLabelAr || 'مستخدم',
      deviceName: opts?.deviceName || actor?.deviceName || 'Cloudflare Edge',
      action,
      entityType,
      entityId,
      propertyId: opts?.propertyId,
      summary: reason,
      createdAt: new Date().toISOString(),
    };
    this.persistSecurityAuditImmediate(state, entry, workspaceId);
  }

  private getActingUser(state: AqarDatabaseState, userId: string): StaffUser {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) {
      throw new WorkerPermissionDeniedError('المستخدم غير موجود أو تم تعطيل حسابه');
    }
    return user;
  }

  private hasPermission(state: AqarDatabaseState, userId: string, perm: PermissionKey): boolean {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) return false;
    return userHasLegacyPermission(state, user, perm);
  }

  private assertPermission(
    state: AqarDatabaseState,
    workspaceId: string,
    userId: string,
    perm: PermissionKey,
    ctx?: { entityType?: string; entityId?: string; propertyId?: string; deviceName?: string }
  ): StaffUser {
    const user = this.getActingUser(state, userId);
    if (!userHasLegacyPermission(state, user, perm)) {
      const msg = 'ليست لديك الصلاحية اللازمة لتنفيذ هذا الإجراء';
      this.recordDeniedAccess(
        state,
        workspaceId,
        user,
        'رفض محاولة إجراء غير مصرح به',
        ctx?.entityType || 'RBAC',
        ctx?.entityId || perm,
        `${msg} (${perm})`,
        { propertyId: ctx?.propertyId, deviceName: ctx?.deviceName }
      );
      throw new WorkerPermissionDeniedError(msg);
    }
    return user;
  }

  private assertModuleAction(
    state: AqarDatabaseState,
    workspaceId: string,
    userId: string,
    module: PermissionModuleKey,
    action: PermissionLevel,
    ctx?: { entityType?: string; entityId?: string; propertyId?: string; deviceName?: string }
  ): StaffUser {
    const user = this.getActingUser(state, userId);
    if (!userHasModuleAction(state, user, module, action)) {
      const msg = `لا تملك صلاحية (${action}) على قسم (${module})`;
      this.recordDeniedAccess(
        state,
        workspaceId,
        user,
        'رفض محاولة وصول أو إجراء غير مصرح به',
        ctx?.entityType || 'RBAC',
        ctx?.entityId || `${module}:${action}`,
        msg,
        { propertyId: ctx?.propertyId, deviceName: ctx?.deviceName }
      );
      throw new WorkerPermissionDeniedError(msg);
    }
    return user;
  }

  private assertPropertyAccess(
    state: AqarDatabaseState,
    workspaceId: string,
    user: StaffUser,
    propertyId: string | undefined,
    actionLabel: string,
    entityType = 'Property',
    entityId = propertyId || 'unscoped',
    deviceName?: string
  ): void {
    if (!propertyId) {
      if (userHasAllPropertiesAccess(state, user)) return;
      const msg = `رفض ${actionLabel}: الحساب مقيد بنطاق عقارات ولا يملك صلاحية الوصول الشامل`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض وصول بدون نطاق عقار', entityType, entityId, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    const prop = state.properties.find((p) => p.id === propertyId);
    if (prop && !canUserAccessCompany(state, user, prop.companyId)) {
      const msg = `رفض ${actionLabel}: العقار يتبع شركة أخرى خارج نطاق حسابك`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض وصول عبر الشركات', entityType, entityId, msg, { propertyId, deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    if (!canUserAccessProperty(state, user, propertyId)) {
      const msg = `رفض ${actionLabel}: العقار (${propertyId}) خارج نطاق العقارات المصرح لك بها`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض وصول خارج نطاق العقارات', entityType, entityId, msg, { propertyId, deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
  }

  private getTenantLinkedPropertyIds(state: AqarDatabaseState, tenantId: string): string[] {
    const set = new Set<string>();
    for (const c of state.contracts) {
      if (c.tenantId === tenantId && c.propertyId) set.add(c.propertyId);
    }
    for (const u of state.units) {
      if ((u.currentTenantId === tenantId || u.linkedTenantId === tenantId) && u.propertyId) set.add(u.propertyId);
    }
    for (const l of state.leads) {
      const tid = l.convertedToTenantId || l.convertedTenantId;
      if (tid === tenantId && l.propertyId) set.add(l.propertyId);
    }
    return Array.from(set);
  }

  private assertTenantAccess(
    state: AqarDatabaseState,
    workspaceId: string,
    user: StaffUser,
    tenantId: string,
    actionLabel: string,
    deviceName?: string
  ) {
    const tenant = state.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error('المستأجر غير موجود');
    if (user.role === 'owner') {
      const msg = `رفض ${actionLabel}: حساب المالك للقراءة فقط`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض تعديل لحساب مالك', 'Tenant', tenant.id, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    if (userHasAllPropertiesAccess(state, user)) return tenant;
    const accessible = getAccessiblePropertyIdsSet(state, user);
    if (accessible.size === 0) {
      const msg = `رفض ${actionLabel}: حسابك مقيد بـ 0 عقار ولا يسمح بالوصول إلى ملفات المستأجرين`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض وصول بمصفوفة عقارات فارغة', 'Tenant', tenant.id, msg, { deviceName });
      throw new WorkerPermissionDeniedError(msg);
    }
    const linkedProps = this.getTenantLinkedPropertyIds(state, tenant.id);
    if (linkedProps.length > 0 && !linkedProps.some((pid) => accessible.has(pid))) {
      const msg = `رفض ${actionLabel}: المستأجر يرتبط بعقارات خارج نطاق صلاحياتك`;
      this.recordDeniedAccess(state, workspaceId, user, 'رفض وصول لملف مستأجر خارج النطاق', 'Tenant', tenant.id, msg, {
        propertyId: linkedProps[0],
        deviceName,
      });
      throw new WorkerPermissionDeniedError(msg);
    }
    return tenant;
  }

  private bumpRevision(state: AqarDatabaseState, entityType: string, entityId: string) {
    if (!state.entityRevisions) state.entityRevisions = {};
    const key = `${entityType}:${entityId}`;
    state.entityRevisions[key] = (state.entityRevisions[key] || 0) + 1;
  }

  private appendAudit(
    state: AqarDatabaseState,
    userId: string,
    action: string,
    entityType: AqarDatabaseState['auditLogs'][number]['entityType'],
    entityId: string,
    summary: string,
    deviceName = 'Cloudflare Edge',
    propertyId?: string
  ) {
    const actor = state.users.find((u) => u.id === userId);
    state.auditLogs.unshift({
      id: uid('aud'),
      userId,
      userName: actor?.nameAr || 'مستخدم',
      userRole: actor?.roleLabelAr || '',
      deviceName,
      action,
      entityType,
      entityId,
      propertyId,
      summary,
      createdAt: new Date().toISOString(),
    });
    if (state.auditLogs.length > 500) {
      state.auditLogs.length = 500;
    }
  }

  private getStateForUser(state: AqarDatabaseState, userId: string, workspaceId = 'default'): AqarDatabaseState {
    const user = state.users.find((u) => u.id === userId && isUserAccountActive(u));
    if (!user) {
      throw new WorkerPermissionDeniedError('المستخدم غير موجود أو تم تعطيل حسابه');
    }
    return filterStateForUser(state, user, { workspaceId });
  }

  private revokeUserSessions(userId: string, workspaceId: string, reason: string, keepSessionId?: string): number {
    if (keepSessionId) {
      this.ctx.storage.sql.exec(
        'UPDATE sessions SET revoked = 1 WHERE user_id = ? AND token_id != ?',
        userId,
        keepSessionId
      );
    } else {
      this.ctx.storage.sql.exec('UPDATE sessions SET revoked = 1 WHERE user_id = ?', userId);
    }
    return this.disconnectUserWebSockets(userId, workspaceId, reason, undefined, keepSessionId);
  }

  private disconnectUserWebSockets(
    userId: string,
    workspaceId: string,
    reason: string,
    targetSessionId?: string,
    excludeSessionId?: string
  ): number {
    let closed = 0;
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment() as WsAttachment | null;
      if (!meta || !meta.authenticated) continue;
      if (meta.workspaceId !== workspaceId || meta.userId !== userId) continue;
      if (targetSessionId && meta.sessionId !== targetSessionId) continue;
      if (excludeSessionId && meta.sessionId === excludeSessionId) continue;
      try {
        ws.send(
          JSON.stringify({
            type: 'session:terminated',
            userId: meta.userId,
            sessionId: meta.sessionId,
            reason,
          })
        );
      } catch {
        // ignore send error
      }
      try {
        ws.close(4001, 'Session terminated');
      } catch {
        // ignore close error
      }
      closed += 1;
    }
    return closed;
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      return authHeader.slice(7).trim();
    }
    const cookies = parseCookies(req.headers.get('cookie'));
    return cookies[SESSION_COOKIE_NAME] || null;
  }

  private async resolveActor(
    req: Request,
    state: AqarDatabaseState,
    workspaceId: string,
    overrideToken?: string
  ): Promise<AuthedActor | null> {
    const rawToken = overrideToken || this.extractToken(req);
    if (!rawToken || !this.sessionSecretCache) return null;
    const claims = await verifyTokenWeb(rawToken, this.sessionSecretCache);
    if (!claims) return null;

    if (claims.wid && claims.wid !== workspaceId) {
      return null;
    }

    const sessionRow = this.ctx.storage.sql
      .exec<{ user_id: string; workspace_id: string; expires_at: string; revoked: number }>(
        'SELECT user_id, workspace_id, expires_at, revoked FROM sessions WHERE token_id = ?',
        claims.sid
      )
      .toArray()[0];

    if (
      !sessionRow ||
      sessionRow.revoked !== 0 ||
      sessionRow.user_id !== claims.uid ||
      sessionRow.workspace_id !== workspaceId
    ) {
      return null;
    }
    if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
      return null;
    }

    const user = state.users.find((u) => u.id === claims.uid && isUserAccountActive(u));
    if (!user) return null;

    const rawDevice = req.headers.get('x-device-name');
    let deviceName = claims.deviceName || 'Cloudflare Web';
    if (rawDevice) {
      try {
        deviceName = decodeURIComponent(rawDevice);
      } catch {
        deviceName = rawDevice;
      }
    }

    return {
      userId: user.id,
      workspaceId,
      role: user.role,
      sessionId: claims.sid,
      rawToken,
      deviceName,
    };
  }

  private buildSessionHeaders(
    accessToken: string,
    refreshToken: string | undefined,
    rememberMe: boolean,
    accessTtlMs: number,
    secure: boolean
  ): Headers {
    const headers = new Headers();
    const secAttr = secure ? '; Secure' : '';
    const accessMaxAge = rememberMe ? `; Max-Age=${Math.floor(accessTtlMs / 1000)}` : '';
    headers.append(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax${secAttr}${accessMaxAge}`
    );
    if (rememberMe && refreshToken) {
      headers.append(
        'Set-Cookie',
        `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax${secAttr}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
      );
    } else {
      headers.append('Set-Cookie', `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax${secAttr}; Max-Age=0`);
    }
    return headers;
  }

  private async issueSession(
    user: StaffUser,
    workspaceId: string,
    deviceName: string,
    opts?: { rememberMe?: boolean; appType?: 'web' | 'desktop'; secure?: boolean }
  ): Promise<{
    token: string;
    refreshToken?: string;
    expiresAt: string;
    refreshExpiresAt?: string;
    sessionId: string;
    rememberMe: boolean;
    headers: Headers;
  }> {
    const rememberMe = opts?.rememberMe !== false;
    const isDesktop = opts?.appType === 'desktop';
    const now = Date.now();
    const accessTtlMs = rememberMe ? ACCESS_TOKEN_TTL_MS : SESSION_SHORT_TTL_MS;
    const exp = now + accessTtlMs;
    const expiresAt = new Date(exp).toISOString();
    const refreshTtlMs = rememberMe ? SESSION_TTL_MS : SESSION_SHORT_TTL_MS;
    const refreshExpiresAt = rememberMe ? new Date(now + refreshTtlMs).toISOString() : undefined;
    const rawRefreshToken = rememberMe ? randomHexWeb(32) : undefined;
    const refreshHash = rawRefreshToken ? await sha256HexWeb(rawRefreshToken) : null;
    const sid = `ses-${crypto.randomUUID().slice(0, 12)}`;
    const token = await signTokenWeb(
      { sid, uid: user.id, wid: workspaceId, role: user.role, deviceName, iat: now, exp },
      this.sessionSecretCache!
    );
    this.ctx.storage.sql.exec(
      'INSERT INTO sessions (token_id, user_id, workspace_id, device_name, app_type, remember_me, refresh_token_hash, refresh_expires_at, created_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      sid,
      user.id,
      workspaceId,
      deviceName,
      isDesktop ? 'desktop' : 'web',
      rememberMe ? 1 : 0,
      refreshHash,
      refreshExpiresAt || null,
      new Date(now).toISOString(),
      expiresAt
    );
    const headers = this.buildSessionHeaders(token, rawRefreshToken, rememberMe, accessTtlMs, Boolean(opts?.secure));
    return {
      token,
      refreshToken: isDesktop ? rawRefreshToken : undefined,
      expiresAt,
      refreshExpiresAt,
      sessionId: sid,
      rememberMe,
      headers,
    };
  }

  private checkAccountLock(userId: string): { locked: boolean; retryAfterSec?: number } {
    const row = this.ctx.storage.sql
      .exec<{ failed_attempts: number; locked_until: string | null }>(
        'SELECT failed_attempts, locked_until FROM user_credentials WHERE user_id = ?',
        userId
      )
      .toArray()[0];
    if (!row?.locked_until) return { locked: false };
    const lockedUntilMs = new Date(row.locked_until).getTime();
    if (lockedUntilMs > Date.now()) {
      return { locked: true, retryAfterSec: Math.ceil((lockedUntilMs - Date.now()) / 1000) };
    }
    return { locked: false };
  }

  private recordFailedAttempt(userId: string) {
    const row = this.ctx.storage.sql
      .exec<{ failed_attempts: number }>('SELECT failed_attempts FROM user_credentials WHERE user_id = ?', userId)
      .toArray()[0];
    const next = (row?.failed_attempts || 0) + 1;
    const lockedUntil = next >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null;
    this.ctx.storage.sql.exec(
      'UPDATE user_credentials SET failed_attempts = ?, locked_until = ? WHERE user_id = ?',
      next,
      lockedUntil,
      userId
    );
  }

  private clearFailedAttempts(userId: string) {
    this.ctx.storage.sql.exec(
      'UPDATE user_credentials SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?',
      userId
    );
  }

  private getPresenceList(state: AqarDatabaseState) {
    const out: Array<{
      sessionId: string;
      userId: string;
      nameAr: string;
      roleLabelAr: string;
      deviceName: string;
      connectedAt: string;
    }> = [];
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment() as WsAttachment | null;
      if (!meta || !meta.authenticated) continue;
      const u = state.users.find((x) => x.id === meta.userId);
      if (u) {
        out.push({
          sessionId: meta.sessionId,
          userId: u.id,
          nameAr: u.nameAr,
          roleLabelAr: u.roleLabelAr,
          deviceName: meta.deviceName || u.deviceName,
          connectedAt: meta.connectedAt,
        });
      }
    }
    return out;
  }

  private broadcastStateChange(state: AqarDatabaseState, actorUserId: string, summary: string, workspaceId: string) {
    const presence = this.getPresenceList(state);
    for (const ws of this.ctx.getWebSockets()) {
      const meta = ws.deserializeAttachment() as WsAttachment | null;
      if (!meta || !meta.authenticated || meta.workspaceId !== workspaceId) continue;
      try {
        ws.send(
          JSON.stringify({
            type: 'state:updated',
            actorUserId,
            summary,
            presence,
            state: this.getStateForUser(state, meta.userId, workspaceId),
          })
        );
      } catch {
        // ignore broken ws socket
      }
    }
  }

  private normalizeAllowedPropertiesInput(input: unknown): string[] | undefined {
    if (!Array.isArray(input)) return undefined;
    const cleaned = input.map((id) => String(id).trim()).filter(Boolean);
    if (cleaned.includes(ALL_PROPERTIES_SCOPE)) return [ALL_PROPERTIES_SCOPE];
    return Array.from(new Set(cleaned));
  }

  private async handleMutation(
    state: AqarDatabaseState,
    actor: AuthedActor,
    method: string,
    pathname: string,
    body: Record<string, any>
  ): Promise<unknown> {
    const now = new Date().toISOString();
    const { userId, workspaceId, deviceName } = actor;

    if (method === 'PATCH' && pathname === '/api/settings') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'settings', 'edit', {
        entityType: 'CompanySettings',
        entityId: 'settings',
        deviceName,
      });
      if (user.role !== 'sys_owner' && user.role !== 'gm') {
        const msg = 'تعديل إعدادات المنشأة متاح فقط لمالك النظام أو المدير العام';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض تعديل الإعدادات', 'CompanySettings', 'settings', msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      state.settings = { ...state.settings, ...body };
      this.bumpRevision(state, 'settings', 'company');
      this.appendAudit(state, userId, 'تحديث الإعدادات', 'إعدادات', 'company', 'تحديث إعدادات المنشأة', deviceName);
      this.persistState(state, workspaceId);
      return { settings: state.settings, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/companies') {
      const user = this.assertPermission(state, workspaceId, userId, 'manage_users', {
        entityType: 'CompanyProfile',
        deviceName,
      });
      if (user.role !== 'sys_owner') {
        const msg = 'إنشاء شركة عقارية أو فرع جديد محصور بمالك النظام فقط';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض إنشاء شركة جديدة', 'CompanyProfile', 'create', msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      if (!state.companies) state.companies = [];
      const company = {
        id: uid('comp'),
        nameAr: String(body.nameAr || 'فرع جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'New Company'),
        logoText: String(body.logoText || ''),
        crNumber: String(body.crNumber || ''),
        vatNumber: String(body.vatNumber || ''),
        address: String(body.address || ''),
        city: String(body.city || state.settings.city || 'الرياض'),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        bankName: String(body.bankName || ''),
        iban: String(body.iban || ''),
        receiptFooterAr: String(body.receiptFooterAr || ''),
        isDefault: false,
      };
      state.companies.push(company);
      this.bumpRevision(state, 'companies', company.id);
      this.appendAudit(state, userId, 'إضافة شركة عقارية', 'CompanyProfile', company.id, `إضافة الشركة ${company.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { company, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/properties') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'properties', 'create', {
        entityType: 'Property',
        deviceName,
      });
      const targetCompanyId = String(body.companyId || actorUser.companyId || state.companies?.[0]?.id || `comp-${workspaceId}`);
      if (!canUserAccessCompany(state, actorUser, targetCompanyId)) {
        const msg = 'رفض إضافة عقار: لا يمكنك الإضافة لشركة خارج نطاق حسابك';
        this.recordDeniedAccess(state, workspaceId, actorUser, 'رفض إضافة عقار عبر الشركات', 'Property', 'create', msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const prop = {
        id: uid('prop'),
        companyId: targetCompanyId,
        code: String(body.code || `PR-${state.properties.length + 101}`),
        nameAr: String(body.nameAr || 'عقار جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'New Property'),
        city: String(body.city || state.settings.city || 'الرياض'),
        district: String(body.district || 'العليا'),
        street: String(body.street || ''),
        nationalAddress: String(body.nationalAddress || ''),
        type: body.type || 'سكني',
        deedNumber: String(body.deedNumber || ''),
        status: body.status || 'نشط',
        buildingsCount: Number(body.buildingsCount || 1),
        floorsCount: Number(body.floorsCount || 1),
        managementFeePercent: Number(body.managementFeePercent ?? state.settings.defaultManagementFeePercent ?? 5),
        ownershipMode: body.ownershipMode || 'إدارة للغير',
        ownerShares: Array.isArray(body.ownerShares)
          ? body.ownerShares
          : [{ ownerId: state.owners[0]?.id || 'own-1', sharePercent: 100 }],
        electricityMeterMain: String(body.electricityMeterMain || ''),
        waterMeterMain: String(body.waterMeterMain || ''),
        caretakerName: String(body.caretakerName || ''),
        caretakerPhone: String(body.caretakerPhone || ''),
        createdAt: now,
      };
      state.properties.unshift(prop);
      if (!userHasAllPropertiesAccess(state, actorUser)) {
        actorUser.allowedPropertyIds = Array.from(new Set([...(actorUser.allowedPropertyIds || []), prop.id]));
      }
      this.bumpRevision(state, 'properties', prop.id);
      this.appendAudit(state, userId, 'إضافة عقار', 'عقار', prop.id, `إضافة العقار ${prop.nameAr}`, deviceName, prop.id);
      this.persistState(state, workspaceId);
      return { property: prop, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/units') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'units', 'create', {
        entityType: 'Unit',
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        deviceName,
      });
      const propertyId = String(body.propertyId || '');
      if (!propertyId) throw new Error('يجب تحديد العقار لإضافة الوحدة');
      this.assertPropertyAccess(state, workspaceId, user, propertyId, 'إضافة وحدة', 'Unit', propertyId, deviceName);
      const monthly = Number(body.suggestedMonthlyRent || Math.round(Number(body.suggestedAnnualRent || 30000) / 12));
      const unit = {
        id: uid('unit'),
        propertyId,
        buildingName: String(body.buildingName || 'المبنى الرئيسي'),
        floor: Number(body.floor || 1),
        unitNumber: String(body.unitNumber || `${state.units.length + 101}`),
        unitType: body.unitType || 'شقة',
        areaSqm: Number(body.areaSqm || 120),
        rooms: Number(body.rooms || 3),
        bathrooms: Number(body.bathrooms || 2),
        furnished: Boolean(body.furnished),
        acCount: Number(body.acCount || 2),
        electricityMeter: String(body.electricityMeter || ''),
        waterMeter: String(body.waterMeter || ''),
        keyCount: Number(body.keyCount || 2),
        acRemoteCount: Number(body.acRemoteCount || 2),
        suggestedMonthlyRent: monthly,
        suggestedAnnualRent: Number(body.suggestedAnnualRent || monthly * 12),
        officeFee: Number(body.officeFee || 0),
        status: body.status || 'شاغرة',
      };
      state.units.push(unit);
      this.bumpRevision(state, 'units', unit.id);
      this.appendAudit(state, userId, 'إضافة وحدة', 'وحدة', unit.id, `إضافة الوحدة ${unit.unitNumber}`, deviceName, unit.propertyId);
      this.persistState(state, workspaceId);
      return { unit, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const unitStatusMatch = /^\/api\/units\/([^/]+)\/status$/.exec(pathname);
    if (method === 'PATCH' && unitStatusMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'units', 'edit', {
        entityType: 'Unit',
        entityId: unitStatusMatch[1],
        deviceName,
      });
      const unit = state.units.find((u) => u.id === unitStatusMatch[1]);
      if (!unit) throw new Error('الوحدة غير موجودة');
      this.assertPropertyAccess(state, workspaceId, user, unit.propertyId, 'تحديث حالة وحدة', 'Unit', unit.id, deviceName);
      unit.status = body.status;
      this.bumpRevision(state, 'units', unit.id);
      this.appendAudit(state, userId, 'تحديث حالة وحدة', 'وحدة', unit.id, `تغيير حالة الوحدة ${unit.unitNumber}`, deviceName, unit.propertyId);
      this.persistState(state, workspaceId);
      return { unit, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/tenants') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'tenants', 'create', {
        entityType: 'Tenant',
        deviceName,
      });
      if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        const msg = 'رفض تسجيل مستأجر: حسابك مقيد بـ 0 عقار مصرح به';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض إضافة مستأجر بدون عقارات', 'Tenant', 'create', msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const tenant = {
        id: uid('ten'),
        nameAr: String(body.nameAr || 'مستأجر جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'Tenant'),
        nationalIdOrIqama: String(body.nationalIdOrIqama || body.nationalId || ''),
        nationality: String(body.nationality || 'سعودي'),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        tenantType: body.tenantType || 'فرد',
        classification: body.classification || 'نشط',
        rating: Number(body.rating ?? 5),
        notes: String(body.notes || ''),
        createdAt: now,
      };
      state.tenants.unshift(tenant);
      this.bumpRevision(state, 'tenants', tenant.id);
      this.appendAudit(state, userId, 'تسجيل مستأجر', 'مستأجر', tenant.id, `تسجيل المستأجر ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { tenant, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const tenantMatch = /^\/api\/tenants\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tenantMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'tenants', 'edit', {
        entityType: 'Tenant',
        entityId: tenantMatch[1],
        deviceName,
      });
      const tenant = this.assertTenantAccess(state, workspaceId, user, tenantMatch[1], 'تحديث بيانات المستأجر', deviceName);
      Object.assign(tenant, body);
      this.bumpRevision(state, 'tenants', tenant.id);
      this.appendAudit(state, userId, 'تحديث مستأجر', 'مستأجر', tenant.id, `تحديث ملف المستأجر ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { tenant, state: this.getStateForUser(state, userId, workspaceId) };
    }
    if (method === 'DELETE' && tenantMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'tenants', 'delete_void', {
        entityType: 'Tenant',
        entityId: tenantMatch[1],
        deviceName,
      });
      const tenant = this.assertTenantAccess(state, workspaceId, user, tenantMatch[1], 'حذف المستأجر', deviceName);
      state.tenants = state.tenants.filter((t) => t.id !== tenant.id);
      this.bumpRevision(state, 'tenants', tenant.id);
      this.appendAudit(state, userId, 'حذف مستأجر', 'مستأجر', tenant.id, `حذف المستأجر ${tenant.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/contracts') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'contracts', 'create', {
        entityType: 'LeaseContract',
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        deviceName,
      });
      const unitId = String(body.unitId || '');
      const unit = state.units.find((u) => u.id === unitId);
      const propertyId = String(body.propertyId || unit?.propertyId || '');
      if (!propertyId) throw new Error('يجب تحديد العقار المرتبط بالعقد');
      if (unit && unit.propertyId !== propertyId) {
        throw new Error('الوحدة المحددة لا تتبع للعقار المختار');
      }
      this.assertPropertyAccess(state, workspaceId, user, propertyId, 'إنشاء عقد', 'LeaseContract', propertyId, deviceName);
      const tenantId = String(body.tenantId || '');
      if (tenantId) {
        this.assertTenantAccess(state, workspaceId, user, tenantId, 'ربط مستأجر بعقد', deviceName);
      }
      const contract = {
        id: uid('con'),
        internalNumber: String(body.internalNumber || `CNT-${state.contracts.length + 1001}`),
        ejarNumber: String(body.ejarNumber || ''),
        ejarStatus: body.ejarStatus || 'غير موثق',
        lifecycleStatus: 'نشط' as const,
        propertyId,
        unitId,
        tenantId,
        startDate: String(body.startDate || now.slice(0, 10)),
        endDate: String(body.endDate || now.slice(0, 10)),
        annualRent: Number(body.annualRent || 30000),
        paymentFrequency: body.paymentFrequency || 'شهري',
        installmentsCount: Number(body.installmentsCount || 12),
        securityDeposit: Number(body.securityDeposit || 2000),
        officeFee: Number(body.officeFee || 0),
        managementCommissionPercent: Number(body.managementCommissionPercent ?? state.settings.defaultManagementFeePercent ?? 5),
        includedServices: String(body.includedServices || ''),
        version: 1,
        createdBy: userId,
        createdAt: now,
      };
      state.contracts.unshift(contract);
      if (unit) {
        unit.status = 'مؤجرة';
        this.bumpRevision(state, 'units', unit.id);
      }
      this.bumpRevision(state, 'contracts', contract.id);
      this.appendAudit(state, userId, 'إنشاء عقد', 'عقد', contract.id, `إنشاء العقد ${contract.internalNumber}`, deviceName, contract.propertyId);
      this.persistState(state, workspaceId);
      return { contract, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/payments') {
      const user = this.assertPermission(state, workspaceId, userId, 'collect_payments', {
        entityType: 'Payment',
        entityId: String(body.contractId || 'payment'),
        deviceName,
      });
      const contract = state.contracts.find((c) => c.id === body.contractId);
      if (!contract) throw new Error('العقد غير موجود');
      this.assertPropertyAccess(state, workspaceId, user, contract.propertyId, 'تحصيل دفعة', 'Payment', contract.id, deviceName);

      const amount = Number(body.amount || 0);
      if (amount <= 0) throw new Error('مبلغ التحصيل يجب أن يكون أكبر من صفر');
      const idempotencyKey = String(body.idempotencyKey || uid('idem'));
      const existing = state.payments.find((p) => p.idempotencyKey === idempotencyKey);
      if (existing) {
        return { payment: existing, duplicate: true, state: this.getStateForUser(state, userId, workspaceId) };
      }
      const refNo = body.referenceNumber ? String(body.referenceNumber).trim() : '';
      if (refNo) {
        const dupRef = state.payments.find(
          (p) => p.contractId === body.contractId && p.referenceNumber === refNo && p.amount === amount && p.status === 'معتمد'
        );
        if (dupRef) {
          return { payment: dupRef, duplicate: true, state: this.getStateForUser(state, userId, workspaceId) };
        }
      }
      state.counters.receipt += 1;
      const allocations: PaymentAllocation[] = [];
      if ((body.paymentType || 'إيجار') === 'إيجار') {
        let rem = amount;
        const openInsts = state.installments
          .filter((i) => i.contractId === contract.id && i.remainingAmount > 0 && i.status !== 'ملغاة')
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        for (const inst of openInsts) {
          if (rem <= 0) break;
          const applied = Math.min(rem, inst.remainingAmount);
          inst.paidAmount = Math.round((inst.paidAmount + applied) * 100) / 100;
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          inst.status = inst.remainingAmount === 0 ? 'مدفوعة بالكامل' : 'مدفوعة جزئياً';
          allocations.push({ installmentId: inst.id, amount: applied });
          rem = Math.round((rem - applied) * 100) / 100;
          this.bumpRevision(state, 'installments', inst.id);
        }
      }
      const payment: Payment = {
        id: uid('pay'),
        receiptNumber: `REC-${new Date().getFullYear()}-${String(state.counters.receipt).padStart(4, '0')}`,
        idempotencyKey,
        contractId: contract.id,
        unitId: contract.unitId,
        propertyId: contract.propertyId,
        tenantId: contract.tenantId,
        allocations,
        amount,
        currency: body.currency || 'SAR',
        paymentMethod: body.paymentMethod || 'تحويل بنكي',
        paymentType: body.paymentType || 'إيجار',
        referenceNumber: refNo || undefined,
        receivedBy: userId,
        deviceName,
        status: 'معتمد',
        notes: body.notes,
        createdAt: now,
      };
      state.payments.unshift(payment);
      if (!state.processedIdempotencyKeys.includes(idempotencyKey)) {
        state.processedIdempotencyKeys.push(idempotencyKey);
      }
      this.bumpRevision(state, 'payments', payment.id);
      this.appendAudit(state, userId, 'تحصيل دفعة', 'دفعة', payment.id, `سند ${payment.receiptNumber} بمبلغ ${amount}`, deviceName, payment.propertyId);
      this.persistState(state, workspaceId);
      return { payment, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const revPayMatch = /^\/api\/payments\/([^/]+)\/reverse$/.exec(pathname);
    if (method === 'POST' && revPayMatch) {
      const user = this.assertPermission(state, workspaceId, userId, 'reverse_receipts', {
        entityType: 'Payment',
        entityId: revPayMatch[1],
        deviceName,
      });
      const orig = state.payments.find((p) => p.id === revPayMatch[1]);
      if (!orig) throw new Error('السند غير موجود');
      this.assertPropertyAccess(state, workspaceId, user, orig.propertyId, 'عكس سند قبض', 'Payment', orig.id, deviceName);
      if (orig.status === 'معكوس') throw new Error('تم عكس هذا السند مسبقاً');
      const todayStr = now.slice(0, 10);
      for (const alloc of orig.allocations || []) {
        const inst = state.installments.find((i) => i.id === alloc.installmentId);
        if (inst) {
          inst.paidAmount = Math.max(0, Math.round((inst.paidAmount - alloc.amount) * 100) / 100);
          inst.remainingAmount = Math.round((inst.amount - inst.paidAmount) * 100) / 100;
          if (inst.paidAmount > 0) {
            inst.status = 'مدفوعة جزئياً';
          } else {
            inst.status = inst.dueDate < todayStr ? 'متأخرة' : inst.dueDate === todayStr ? 'مستحقة اليوم' : 'لم تستحق';
          }
          this.bumpRevision(state, 'installments', inst.id);
        }
      }
      state.counters.receipt += 1;
      orig.status = 'معكوس';
      orig.reversedByReceiptId = `REV-${new Date().getFullYear()}-${String(state.counters.receipt).padStart(4, '0')}`;
      orig.reversalReason = String(body.reason || 'إلغاء وتصحيح السند');
      this.bumpRevision(state, 'payments', orig.id);
      this.appendAudit(state, userId, 'عكس سند', 'دفعة', orig.id, `عكس السند ${orig.receiptNumber}`, deviceName, orig.propertyId);
      this.persistState(state, workspaceId);
      return { payment: orig, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/expenses') {
      const user = this.assertPermission(state, workspaceId, userId, 'create_expense', {
        entityType: 'Expense',
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        deviceName,
      });
      const propertyId = String(body.propertyId || '');
      if (!propertyId) throw new Error('يجب تحديد العقار للمصروف');
      this.assertPropertyAccess(state, workspaceId, user, propertyId, 'تسجيل مصروف', 'Expense', propertyId, deviceName);
      state.counters.expense += 1;
      const expense = {
        id: uid('exp'),
        expenseNumber: `EXP-${String(state.counters.expense).padStart(4, '0')}`,
        date: String(body.date || now.slice(0, 10)),
        category: body.category || 'صيانة',
        propertyId,
        unitId: body.unitId ? String(body.unitId) : undefined,
        vendorId: body.vendorId ? String(body.vendorId) : undefined,
        invoiceNumber: String(body.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`),
        amount: Number(body.amount || 0),
        currency: body.currency || 'SAR',
        paymentMethod: body.paymentMethod || 'تحويل بنكي',
        bearer: body.bearer || 'المالك',
        approvalStatus: 'بانتظار المشرف' as const,
        notes: body.notes,
        createdBy: userId,
        createdAt: now,
      };
      state.expenses.unshift(expense);
      this.bumpRevision(state, 'expenses', expense.id);
      this.appendAudit(state, userId, 'تسجيل مصروف', 'مصروف', expense.id, `تسجيل مصروف ${expense.expenseNumber}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const expPatchMatch = /^\/api\/expenses\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && expPatchMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'expenses', 'edit', {
        entityType: 'Expense',
        entityId: expPatchMatch[1],
        deviceName,
      });
      const expense = state.expenses.find((e) => e.id === expPatchMatch[1]);
      if (!expense) throw new Error('المصروف غير موجود');
      this.assertPropertyAccess(state, workspaceId, user, expense.propertyId, 'تعديل مصروف', 'Expense', expense.id, deviceName);
      Object.assign(expense, body);
      this.bumpRevision(state, 'expenses', expense.id);
      this.appendAudit(state, userId, 'تعديل مصروف', 'مصروف', expense.id, `تحديث المصروف ${expense.expenseNumber}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const expDecisionMatch = /^\/api\/expenses\/([^/]+)\/decision$/.exec(pathname);
    if (method === 'POST' && expDecisionMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'expenses', 'approve', {
        entityType: 'Expense',
        entityId: expDecisionMatch[1],
        deviceName,
      });
      const expense = state.expenses.find((e) => e.id === expDecisionMatch[1]);
      if (!expense) throw new Error('المصروف غير موجود');
      this.assertPropertyAccess(state, workspaceId, user, expense.propertyId, 'اعتماد مصروف', 'Expense', expense.id, deviceName);
      if (expense.createdBy === userId && user.role !== 'sys_owner') {
        const msg = 'فصل المهام (SoD): لا يمكنك اعتماد مصروف قمت بتسجيله بنفسك';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض اعتماد ذاتي للمصروف', 'Expense', expense.id, msg, { propertyId: expense.propertyId, deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const decision = body.decision === 'reject' ? 'reject' : 'approve';
      const oldStatus = expense.approvalStatus;
      if (decision === 'reject') {
        expense.approvalStatus = 'مرفوض';
        expense.rejectionReason = String(body.reason || 'رفض إداري');
      } else if (expense.approvalStatus === 'بانتظار المشرف') {
        if (!this.hasPermission(state, userId, 'approve_expense_supervisor') && !this.hasPermission(state, userId, 'approve_expense_manager') && user.role !== 'sys_owner') {
          throw new WorkerPermissionDeniedError('تحتاج صلاحية اعتماد المشرف لهذه المرحلة');
        }
        expense.approvedBySupervisor = user.id;
        expense.approvalStatus = expense.amount > 5000 ? 'بانتظار المدير' : 'معتمد';
      } else if (expense.approvalStatus === 'بانتظار المدير') {
        if (!this.hasPermission(state, userId, 'approve_expense_manager') && user.role !== 'sys_owner') {
          throw new WorkerPermissionDeniedError('تحتاج صلاحية المدير العام لهذه المرحلة');
        }
        expense.approvedByManager = user.id;
        expense.approvalStatus = expense.amount > 20000 ? 'بانتظار المالك' : 'معتمد';
      } else if (expense.approvalStatus === 'بانتظار المالك') {
        if (user.role !== 'owner' && user.role !== 'sys_owner' && user.role !== 'gm') {
          throw new WorkerPermissionDeniedError('الموافقة النهائية للمصروفات الكبرى مخصصة للمالك أو مالك النظام');
        }
        expense.approvedByOwner = user.id;
        expense.approvalStatus = 'معتمد';
      }
      this.bumpRevision(state, 'expenses', expense.id);
      this.appendAudit(state, userId, 'قرار اعتماد مصروف', 'مصروف', expense.id, `تحديث ${expense.expenseNumber} من ${oldStatus} إلى ${expense.approvalStatus}`, deviceName, expense.propertyId);
      this.persistState(state, workspaceId);
      return { expense, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/tickets') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'maintenance', 'create', {
        entityType: 'MaintenanceTicket',
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        deviceName,
      });
      const propertyId = String(body.propertyId || '');
      if (!propertyId) throw new Error('يجب تحديد العقار لبلاغ الصيانة');
      this.assertPropertyAccess(state, workspaceId, user, propertyId, 'فتح بلاغ صيانة', 'MaintenanceTicket', propertyId, deviceName);
      state.counters.ticket += 1;
      const ticket = {
        id: uid('tkt'),
        ticketNumber: `MNT-${String(state.counters.ticket).padStart(4, '0')}`,
        propertyId,
        unitId: String(body.unitId || ''),
        source: body.source || 'المشرف',
        category: String(body.category || 'أخرى'),
        priority: body.priority || 'متوسط',
        title: String(body.title || 'بلاغ صيانة'),
        description: String(body.description || ''),
        estimatedCost: Number(body.estimatedCost || 0),
        actualCost: 0,
        status: 'جديد' as const,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      };
      state.tickets.unshift(ticket);
      this.bumpRevision(state, 'tickets', ticket.id);
      this.appendAudit(state, userId, 'فتح بلاغ صيانة', 'بلاغ صيانة', ticket.id, `فتح البلاغ ${ticket.ticketNumber}`, deviceName, ticket.propertyId);
      this.persistState(state, workspaceId);
      return { ticket, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const tktMatch = /^\/api\/tickets\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tktMatch) {
      const user = this.getActingUser(state, userId);
      if (!this.hasPermission(state, userId, 'manage_maintenance') && !this.hasPermission(state, userId, 'execute_maintenance')) {
        const msg = 'ليست لديك صلاحية تعديل بلاغات الصيانة';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض تعديل بلاغ صيانة', 'MaintenanceTicket', tktMatch[1], msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const ticket = state.tickets.find((t) => t.id === tktMatch[1]);
      if (!ticket) throw new Error('بلاغ الصيانة غير موجود');
      this.assertPropertyAccess(state, workspaceId, user, ticket.propertyId, 'تعديل بلاغ صيانة', 'MaintenanceTicket', ticket.id, deviceName);
      Object.assign(ticket, body, { updatedAt: now });
      this.bumpRevision(state, 'tickets', ticket.id);
      this.appendAudit(state, userId, 'تحديث بلاغ صيانة', 'بلاغ صيانة', ticket.id, `تحديث البلاغ ${ticket.ticketNumber}`, deviceName, ticket.propertyId);
      this.persistState(state, workspaceId);
      return { ticket, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/tasks') {
      const user = this.assertPermission(state, workspaceId, userId, 'manage_tasks', {
        entityType: 'TaskItem',
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        deviceName,
      });
      if (body.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, String(body.propertyId), 'إضافة مهمة', 'TaskItem', String(body.propertyId), deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        const msg = 'رفض إضافة مهمة: حسابك مقيد بـ 0 عقار';
        this.recordDeniedAccess(state, workspaceId, user, 'رفض إضافة مهمة بمصفوفة فارغة', 'TaskItem', 'create', msg, { deviceName });
        throw new WorkerPermissionDeniedError(msg);
      }
      const task = {
        id: uid('tsk'),
        title: String(body.title || 'مهمة جديدة'),
        description: String(body.description || ''),
        type: String(body.type || 'متابعة'),
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        unitId: body.unitId ? String(body.unitId) : undefined,
        priority: body.priority || 'متوسط',
        assignedTo: String(body.assignedTo || userId),
        createdBy: userId,
        dueDate: String(body.dueDate || now.slice(0, 10)),
        status: 'جديدة' as const,
        checklist: Array.isArray(body.checklist) ? body.checklist : [],
        comments: [],
        createdAt: now,
      };
      state.tasks.unshift(task);
      this.bumpRevision(state, 'tasks', task.id);
      this.persistState(state, workspaceId);
      return { task, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const tskMatch = /^\/api\/tasks\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && tskMatch) {
      const user = this.assertPermission(state, workspaceId, userId, 'manage_tasks', {
        entityType: 'TaskItem',
        entityId: tskMatch[1],
        deviceName,
      });
      const task = state.tasks.find((t) => t.id === tskMatch[1]);
      if (!task) throw new Error('المهمة غير موجودة');
      if (task.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, task.propertyId, 'تحديث مهمة', 'TaskItem', task.id, deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && task.assignedTo !== user.id) {
        throw new WorkerPermissionDeniedError('رفض تحديث مهمة خارج نطاق حسابك');
      }
      Object.assign(task, body);
      this.bumpRevision(state, 'tasks', task.id);
      this.persistState(state, workspaceId);
      return { task, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/documents') {
      const user = this.assertModuleAction(state, workspaceId, userId, 'documents', 'create', {
        entityType: 'Document',
        deviceName,
      });
      if (body.propertyId) {
        this.assertPropertyAccess(state, workspaceId, user, String(body.propertyId), 'أرشفة مستند', 'Document', String(body.propertyId), deviceName);
      } else if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        throw new WorkerPermissionDeniedError('رفض رفع مستند: لا توجد عقارات مصرح بها في حسابك');
      }
      const doc: AqarDatabaseState['documents'][number] = {
        id: uid('doc'),
        title: String(body.title || 'مستند'),
        category: (body.category || 'مراسلات الشركة') as AqarDatabaseState['documents'][number]['category'],
        relatedType: (body.relatedType || body.relatedEntityType || (body.propertyId ? 'عقار' : 'شركة')) as AqarDatabaseState['documents'][number]['relatedType'],
        relatedId: String(body.relatedId || body.relatedEntityId || body.propertyId || ''),
        propertyId: body.propertyId ? String(body.propertyId) : undefined,
        relatedEntityType: body.relatedEntityType ? String(body.relatedEntityType) : undefined,
        relatedEntityId: body.relatedEntityId ? String(body.relatedEntityId) : undefined,
        fileName: String(body.fileName || 'file.pdf'),
        fileType: String(body.fileType || 'application/pdf'),
        fileSizeKb: Number(body.fileSizeKb || 128),
        version: Number(body.version || 1),
        dataUrl: body.dataUrl ? String(body.dataUrl) : undefined,
        uploadedBy: userId,
        createdAt: now,
      };
      state.documents.unshift(doc);
      this.bumpRevision(state, 'documents', doc.id);
      this.appendAudit(state, userId, 'أرشفة مستند', 'مستند', doc.id, `أرشفة ${doc.title}`, deviceName, doc.propertyId);
      this.persistState(state, workspaceId);
      return { doc, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/vendors') {
      const user = this.assertPermission(state, workspaceId, userId, 'manage_maintenance', {
        entityType: 'Vendor',
        deviceName,
      });
      if (!userHasAllPropertiesAccess(state, user) && getAccessiblePropertyIdsSet(state, user).size === 0) {
        throw new WorkerPermissionDeniedError('رفض إضافة مورد: حسابك مقيد بـ 0 عقار');
      }
      const vendor: AqarDatabaseState['vendors'][number] = {
        id: uid('vnd'),
        nameAr: String(body.nameAr || 'مورد جديد'),
        nameEn: String(body.nameEn || body.nameAr || 'New Vendor'),
        crNumber: String(body.crNumber || ''),
        category: String(body.category || body.specialty || 'صيانة عامة'),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        rating: Number(body.rating ?? 5),
        active: body.active !== undefined ? Boolean(body.active) : true,
      };
      state.vendors.unshift(vendor);
      this.bumpRevision(state, 'vendors', vendor.id);
      this.persistState(state, workspaceId);
      return { vendor, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/templates') {
      const user = this.getActingUser(state, userId);
      if (
        !this.hasPermission(state, userId, 'manage_users') &&
        !this.hasPermission(state, userId, 'manage_contracts') &&
        !this.hasPermission(state, userId, 'manage_maintenance')
      ) {
        this.recordDeniedAccess(state, workspaceId, user, 'رفض إنشاء قالب تواصل', 'Template', 'create', 'ليست لديك صلاحية إنشاء قوالب التواصل', { deviceName });
        throw new WorkerPermissionDeniedError('ليست لديك صلاحية إنشاء قوالب التواصل');
      }
      const template = {
        id: uid('tpl'),
        name: String(body.name || 'قالب جديد'),
        category: body.category || 'custom',
        channel: body.channel || 'whatsapp',
        language: body.language || 'ar',
        contentAr: String(body.contentAr || ''),
        contentEn: body.contentEn ? String(body.contentEn) : undefined,
        usageCount: 0,
        createdBy: userId,
        updatedAt: now,
      };
      state.communicationTemplates = [template, ...(state.communicationTemplates || [])];
      this.bumpRevision(state, 'communicationTemplates', template.id);
      this.persistState(state, workspaceId);
      return { template, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/notifications/read') {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isReadBy: n.isReadBy.includes(userId) ? n.isReadBy : [...n.isReadBy, userId],
      }));
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/permissions/toggle') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'RolePermissions',
        entityId: String(body.role || 'role'),
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('تعديل مصفوفة الصلاحيات محصور لمالك النظام أو المدير العام');
      }
      const role = body.role as RoleKey;
      const perm = body.permission as PermissionKey;
      if (role === 'sys_owner') {
        throw new WorkerPermissionDeniedError('لا يمكن تقليص صلاحيات مالك النظام');
      }
      if (actorUser.role === 'gm' && role === 'gm') {
        throw new WorkerPermissionDeniedError('لا يمكنك تعديل صلاحيات دورك بنفسك');
      }
      const current = state.rolePermissions[role] || [];
      state.rolePermissions[role] = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm];
      this.appendAudit(state, userId, 'تحديث صلاحيات الدور', 'أدوار وصلاحيات', role, `تغيير الصلاحية ${perm} للدور ${role}`, deviceName);
      this.persistState(state, workspaceId);
      return { rolePermissions: state.rolePermissions, state: this.getStateForUser(state, userId, workspaceId) };
    }

    // Team & Workforce Endpoints (Parity with Node)
    if (method === 'POST' && pathname === '/api/team/users') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'create', {
        entityType: 'StaffUser',
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('إضافة الموظفين متاحة لمالك النظام أو مدير الشركة فقط');
      }
      const targetRole = (body.role || 'leasing') as RoleKey;
      if (actorUser.role !== 'sys_owner' && (targetRole === 'sys_owner' || targetRole === 'gm')) {
        throw new WorkerPermissionDeniedError('تعيين مالك نظام أو مدير شركة حصري لمالك النظام');
      }
      const tmpl = ROLE_TEMPLATES.find((t) => t.key === targetRole);
      const customRole = body.customRoleId ? (state.customRoles || []).find((r) => r.id === body.customRoleId) : undefined;
      const email = String(body.email || '').trim().toLowerCase();
      if (!email) throw new Error('البريد الإلكتروني مطلوب');
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error('البريد الإلكتروني مستخدم لحساب آخر');
      }
      const allowedProps = this.normalizeAllowedPropertiesInput(body.allowedPropertyIds);
      const newUser: StaffUser = {
        id: uid('usr'),
        companyId: actorUser.role === 'sys_owner' ? String(body.companyId || actorUser.companyId || `comp-${workspaceId}`) : actorUser.companyId,
        nameAr: String(body.nameAr || 'موظف جديد').trim(),
        nameEn: String(body.nameEn || body.nameAr || 'New Staff').trim(),
        email,
        phone: String(body.phone || '').trim(),
        role: targetRole,
        customRoleId: customRole?.id || (body.customRoleId ? String(body.customRoleId) : undefined),
        customModulePermissions: body.customModulePermissions ?? body.customPermissions,
        roleLabelAr: customRole?.nameAr || tmpl?.labelAr || 'موظف',
        roleLabelEn: customRole?.nameEn || tmpl?.labelEn || 'Staff',
        approvalLimitSar: Number(body.approvalLimitSar ?? tmpl?.defaultLimitSar ?? 0),
        allowedPropertyIds: allowedProps,
        deviceName: String(body.deviceName || 'Web Terminal'),
        lastActiveAt: now,
        statusState: 'متصل',
        active: true,
        accountStatus: 'نشط',
        createdAt: now,
      };
      state.users.push(newUser);
      const password = String(body.password || '').trim() || randomHexWeb(18);
      const pin = String(body.pin || '').trim();
      const pwHash = await hashSecretWeb(password);
      const pinHash = /^\d{4,6}$/.test(pin) ? await hashSecretWeb(pin) : null;
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)',
        newUser.id,
        pwHash,
        pinHash,
        now
      );
      this.bumpRevision(state, 'users', newUser.id);
      this.appendAudit(state, userId, 'إضافة موظف جديد', 'فريق العمل', newUser.id, `إضافة ${newUser.nameAr} (${newUser.role})`, deviceName);
      this.persistState(state, workspaceId);
      return { user: sanitizeUserForClient(newUser), state: this.getStateForUser(state, userId, workspaceId) };
    }

    const teamUserMatch = /^\/api\/team\/users\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && teamUserMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'edit', {
        entityType: 'StaffUser',
        entityId: teamUserMatch[1],
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('تعديل حسابات الموظفين حصري لمالك النظام أو مدير الشركة');
      }
      const target = state.users.find((u) => u.id === teamUserMatch[1]);
      if (!target) throw new Error('المستخدم غير موجود');
      if (actorUser.role !== 'sys_owner' && (target.role === 'sys_owner' || target.role === 'gm')) {
        throw new WorkerPermissionDeniedError('لا يمكنك تعديل حساب مالك النظام أو مدير الشركة');
      }
      if (actorUser.role === 'gm' && actorUser.companyId && target.companyId && actorUser.companyId !== target.companyId) {
        throw new WorkerPermissionDeniedError('لا يمكنك تعديل موظف يتبع شركة أخرى');
      }
      if (target.id === actorUser.id && (body.role !== undefined || body.customRoleId !== undefined || body.customModulePermissions !== undefined || body.customPermissions !== undefined || body.active === false)) {
        throw new WorkerPermissionDeniedError('لا يمكنك تعديل دورك أو صلاحياتك الخاصة');
      }

      const prevTargetSnapshot: StaffUser = {
        ...target,
        allowedPropertyIds: Array.isArray(target.allowedPropertyIds) ? [...target.allowedPropertyIds] : undefined,
      };
      const prevRole = target.role;
      const nextRole = (body.role ?? target.role) as RoleKey;
      const nextCustomRoleId = body.customRoleId !== undefined ? (body.customRoleId ? String(body.customRoleId) : undefined) : target.customRoleId;
      const nextScope =
        body.allowedPropertyIds !== undefined ? this.normalizeAllowedPropertiesInput(body.allowedPropertyIds) : target.allowedPropertyIds;
      const nextActive = body.active !== undefined ? Boolean(body.active) : target.active;
      const nextStatus = body.accountStatus || (nextActive ? 'نشط' : 'موقوف');

      if (actorUser.role !== 'sys_owner' && (nextRole === 'sys_owner' || nextRole === 'gm')) {
        throw new WorkerPermissionDeniedError('لا يملك مدير الشركة صلاحية ترقية موظف لدور قيادي');
      }

      target.role = nextRole;
      target.customRoleId = nextCustomRoleId;
      if (body.customModulePermissions !== undefined || body.customPermissions !== undefined) {
        target.customModulePermissions = body.customModulePermissions ?? body.customPermissions;
      }
      if (body.allowedPropertyIds !== undefined) target.allowedPropertyIds = nextScope;
      if (body.approvalLimitSar !== undefined) target.approvalLimitSar = Number(body.approvalLimitSar);
      if (body.nameAr !== undefined) target.nameAr = String(body.nameAr);
      if (body.nameEn !== undefined) target.nameEn = String(body.nameEn);
      target.active = nextActive && nextStatus === 'نشط';
      target.accountStatus = nextStatus;

      const roleChanged = isRoleDowngrade(prevRole, nextRole) || prevRole !== nextRole;
      const scopeShrank = isPropertyScopeShrink(state, prevTargetSnapshot, state, target);
      const suspended = !target.active;

      if (suspended || roleChanged || scopeShrank) {
        this.revokeUserSessions(
          target.id,
          workspaceId,
          suspended ? 'تم إيقاف الحساب من قِبل الإدارة' : 'تم تحديث صلاحيات أو نطاق العقارات — يرجى إعادة تسجيل الدخول'
        );
      }

      this.bumpRevision(state, 'users', target.id);
      this.appendAudit(state, userId, 'تحديث ملف موظف', 'فريق العمل', target.id, `تحديث ${target.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { user: sanitizeUserForClient(target), state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'DELETE' && teamUserMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'delete_void', {
        entityType: 'StaffUser',
        entityId: teamUserMatch[1],
        deviceName,
      });
      if (actorUser.role !== 'sys_owner') {
        throw new WorkerPermissionDeniedError('حذف المستخدمين حصري لمالك النظام فقط');
      }
      const target = state.users.find((u) => u.id === teamUserMatch[1]);
      if (!target) throw new Error('المستخدم غير موجود');
      if (target.id === actorUser.id) throw new WorkerPermissionDeniedError('لا يمكنك حذف حسابك الحالي');
      state.users = state.users.filter((u) => u.id !== target.id);
      this.ctx.storage.sql.exec('DELETE FROM user_credentials WHERE user_id = ?', target.id);
      this.revokeUserSessions(target.id, workspaceId, 'تم حذف الحساب بواسطة مالك النظام');
      this.appendAudit(state, userId, 'حذف حساب موظف', 'فريق العمل', target.id, `حذف ${target.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/roles') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'CustomRole',
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('إنشاء الأدوار المخصصة حصري لمالك النظام أو مدير الشركة');
      }
      const roleDef: CustomRoleDefinition = {
        id: uid('role'),
        companyId: String(body.companyId || actorUser.companyId || state.companies?.[0]?.id || `comp-${workspaceId}`),
        nameAr: String(body.nameAr || 'دور مخصص'),
        nameEn: String(body.nameEn || body.nameAr || 'Custom Role'),
        descriptionAr: String(body.descriptionAr || body.descAr || ''),
        baseRoleKey: (body.baseRoleKey || body.baseRole || 'leasing') as RoleKey,
        legacyPermissions: Array.isArray(body.legacyPermissions) ? body.legacyPermissions : [],
        modulePermissions: body.modulePermissions || {},
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      };
      if (!state.customRoles) state.customRoles = [];
      state.customRoles.push(roleDef);
      this.bumpRevision(state, 'customRoles', roleDef.id);
      this.appendAudit(state, userId, 'إنشاء دور مخصص', 'أدوار وصلاحيات', roleDef.id, `إنشاء الدور ${roleDef.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { role: roleDef, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const roleItemMatch = /^\/api\/roles\/([^/]+)$/.exec(pathname);
    if (method === 'PATCH' && roleItemMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'CustomRole',
        entityId: roleItemMatch[1],
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('تعديل الأدوار المخصصة حصري لمالك النظام أو مدير الشركة');
      }
      const roleDef = (state.customRoles || []).find((r) => r.id === roleItemMatch[1]);
      if (!roleDef) throw new Error('الدور المخصص غير موجود');
      Object.assign(roleDef, {
        nameAr: body.nameAr ?? roleDef.nameAr,
        nameEn: body.nameEn ?? roleDef.nameEn,
        descriptionAr: body.descriptionAr ?? body.descAr ?? roleDef.descriptionAr,
        modulePermissions: body.modulePermissions ?? roleDef.modulePermissions,
        legacyPermissions: Array.isArray(body.legacyPermissions) ? body.legacyPermissions : roleDef.legacyPermissions,
        updatedAt: now,
      });
      this.bumpRevision(state, 'customRoles', roleDef.id);
      this.appendAudit(state, userId, 'تحديث دور مخصص', 'أدوار وصلاحيات', roleDef.id, `تحديث ${roleDef.nameAr}`, deviceName);
      this.persistState(state, workspaceId);
      return { role: roleDef, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'DELETE' && roleItemMatch) {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'CustomRole',
        entityId: roleItemMatch[1],
        deviceName,
      });
      if (actorUser.role !== 'sys_owner') {
        throw new WorkerPermissionDeniedError('حذف الأدوار المخصصة حصري لمالك النظام');
      }
      state.customRoles = (state.customRoles || []).filter((r) => r.id !== roleItemMatch[1]);
      this.appendAudit(state, userId, 'حذف دور مخصص', 'أدوار وصلاحيات', roleItemMatch[1], 'حذف دور مخصص', deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/roles/module-matrix') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'RoleMatrix',
        entityId: String(body.role || ''),
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('تعديل مصفوفة الصلاحيات حصري لمالك النظام أو مدير الشركة');
      }
      const targetRole = body.role as RoleKey;
      if (targetRole === 'sys_owner') {
        throw new WorkerPermissionDeniedError('لا يمكن تعديل صلاحيات مالك النظام');
      }
      if (actorUser.role === 'gm' && targetRole === 'gm') {
        throw new WorkerPermissionDeniedError('لا يمكنك تعديل مصفوفة دورك بنفسك');
      }
      if (!state.roleModulePermissions) state.roleModulePermissions = buildAllDefaultRoleModulePermissions();
      state.roleModulePermissions[targetRole] = body.modulePermissions || {};
      state.rolePermissions[targetRole] = deriveLegacyPermissionsFromModules(body.modulePermissions || {});
      this.appendAudit(state, userId, 'تحديث مصفوفة الصلاحيات', 'أدوار وصلاحيات', targetRole, `تحديث مصفوفة ${targetRole}`, deviceName);
      this.persistState(state, workspaceId);
      return { roleModulePermissions: state.roleModulePermissions, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/team/sessions/terminate') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'StaffSession',
        deviceName,
      });
      if (actorUser.role !== 'sys_owner' && actorUser.role !== 'gm') {
        throw new WorkerPermissionDeniedError('إنهاء الجلسات عن بُعد حصري لمالك النظام أو مدير الشركة');
      }
      const targetUserId = body.userId ? String(body.userId) : undefined;
      const targetSessionId = body.sessionId ? String(body.sessionId) : undefined;
      let terminatedCount = 0;
      if (targetUserId) {
        const target = state.users.find((u) => u.id === targetUserId);
        if (!target) throw new Error('المستخدم غير موجود');
        if (actorUser.role === 'gm' && (target.role === 'sys_owner' || target.role === 'gm')) {
          throw new WorkerPermissionDeniedError('لا يمكنك إنهاء جلسات مالك النظام أو مدير شركة');
        }
        if (actorUser.role === 'gm' && actorUser.companyId && target.companyId && actorUser.companyId !== target.companyId) {
          throw new WorkerPermissionDeniedError('لا يمكنك إنهاء جلسات موظف يتبع شركة أخرى');
        }
        if (!targetSessionId) {
          terminatedCount = this.revokeUserSessions(targetUserId, workspaceId, String(body.reason || 'إنهاء جلسة إداري عن بُعد'));
        } else {
          this.ctx.storage.sql.exec('UPDATE sessions SET revoked = 1 WHERE user_id = ? AND token_id = ?', targetUserId, targetSessionId);
          terminatedCount = this.disconnectUserWebSockets(targetUserId, workspaceId, String(body.reason || 'إنهاء جلسة إداري عن بُعد'), targetSessionId);
        }
      }
      this.appendAudit(state, userId, 'إنهاء جلسات عن بُعد', 'جلسات الأمان', targetUserId || targetSessionId || 'session', `إنهاء ${terminatedCount} جلسة`, deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, terminatedCount, state: this.getStateForUser(state, userId, workspaceId) };
    }

    const resolveConflictMatch = /^\/api\/(?:team|sync)\/conflicts\/([^/]+)\/resolve$/.exec(pathname);
    if (method === 'POST' && resolveConflictMatch) {
      const user = this.assertModuleAction(state, workspaceId, userId, 'team', 'manage', {
        entityType: 'SyncConflict',
        entityId: resolveConflictMatch[1],
        deviceName,
      });
      if (user.role !== 'sys_owner' && user.role !== 'gm') {
        throw new WorkerPermissionDeniedError('اعتماد حل تعارضات المزامنة متاح فقط لمالك النظام أو المدير العام');
      }
      const cnf = (state.syncConflicts || []).find((c) => c.id === resolveConflictMatch[1]);
      if (!cnf) throw new Error('سجل التعارض غير موجود');
      const resolution =
        body.resolution === 'تم الإبقاء على النسخة السابقة' || body.choice === 'first'
          ? 'تم الإبقاء على النسخة السابقة'
          : 'تم اعتماد التعديل الأحدث';
      cnf.status = resolution;
      cnf.resolvedBy = user.nameAr || userId;
      cnf.resolvedAt = now;
      this.appendAudit(state, userId, 'حل تعارض مزامنة', 'نظام', cnf.id, `معالجة تعارض ${cnf.entityLabel}`, deviceName);
      this.persistState(state, workspaceId);
      return { conflict: cnf, state: this.getStateForUser(state, userId, workspaceId) };
    }

    if (method === 'POST' && pathname === '/api/workspace/reset-fresh') {
      const actorUser = this.assertModuleAction(state, workspaceId, userId, 'settings', 'manage', {
        entityType: 'WorkspaceReset',
        deviceName,
      });
      if (actorUser.role !== 'sys_owner') {
        throw new WorkerPermissionDeniedError('إعادة تهيئة مساحة العمل حصرية لمالك النظام فقط');
      }
      state.properties = [];
      state.units = [];
      state.tenants = [];
      state.leads = [];
      state.contracts = [];
      state.installments = [];
      state.payments = [];
      state.expenses = [];
      state.tickets = [];
      state.tasks = [];
      state.documents = [];
      // Preserve immutable auditLogs across workspace reset
      this.appendAudit(state, userId, 'تهيئة مساحة عمل نظيفة', 'النظام', 'workspace-reset', 'مسح البيانات التشغيلية مع الإبقاء على سجل التدقيق', deviceName);
      this.persistState(state, workspaceId);
      return { ok: true, state: this.getStateForUser(state, userId, workspaceId) };
    }

    throw new Error(`مسار غير مدعوم بعد في الخادم السحابي: ${method} ${pathname}`);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const workspaceId = resolveRequestWorkspace(request);
    const state = await this.ensureBootstrapped(workspaceId);
    const secureReq = isSecureRequest(request);

    // 1. WebSocket Upgrade (Hibernation API)
    if (pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const actor = await this.resolveActor(request, state, workspaceId);
      const attachment: WsAttachment = {
        sessionId: actor?.sessionId || uid('ws'),
        userId: actor?.userId || '',
        workspaceId,
        authenticated: Boolean(actor),
        deviceName: actor?.deviceName || 'Web Terminal',
        connectedAt: new Date().toISOString(),
      };
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment(attachment);
      if (attachment.authenticated && attachment.userId) {
        server.send(
          JSON.stringify({
            type: 'state:init',
            state: this.getStateForUser(state, attachment.userId, workspaceId),
            presence: this.getPresenceList(state),
          })
        );
      }
      return new Response(null, { status: 101, webSocket: client });
    }

    // 2. Public endpoints & Provisioning & Auth endpoints
    if (pathname === '/api/health') {
      const entitiesRow = this.ctx.storage.sql
        .exec<{ c: number }>('SELECT COUNT(*) as c FROM entities')
        .toArray()[0];
      const opsRow = this.ctx.storage.sql
        .exec<{ c: number }>('SELECT COUNT(*) as c FROM operations_log')
        .toArray()[0];
      return jsonResponse({
        ok: true,
        runtime: 'cloudflare-workers-durable-objects',
        storageEngine: 'do-sqlite-normalized',
        workspaceId,
        entitiesCount: entitiesRow?.c || 0,
        operationsCount: opsRow?.c || 0,
        lastUpdatedAt: state.lastUpdatedAt,
        syncRevision: state.syncRevision || 1,
      });
    }

    if (pathname === '/api/workspaces/provision' && request.method === 'POST') {
      if (workspaceId === 'default' || state.users.length > 0) {
        return jsonResponse(
          { error: 'مساحة العمل هذه مفعّلة مسبقاً — اختر معرّف شركة مختلفاً أو سجّل الدخول' },
          409
        );
      }
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const companyNameAr = String(body.companyNameAr || '').trim();
      const companyNameEn = String(body.companyNameEn || companyNameAr || 'AqarPlus Workspace').trim();
      const adminNameAr = String(body.adminNameAr || '').trim();
      const adminEmail = String(body.adminEmail || '').trim().toLowerCase();
      const adminPhone = String(body.adminPhone || '').trim();
      const password = String(body.password || '');
      const pin = String(body.pin || '').trim();
      const appType: 'web' | 'desktop' = body.appType === 'desktop' ? 'desktop' : 'web';

      if (!companyNameAr || !adminNameAr || !adminEmail || password.length < 8) {
        return jsonResponse(
          { error: 'يلزم إدخال اسم الشركة، واسم المدير، والبريد الإلكتروني، وكلمة مرور قوية لا تقل عن 8 أحرف' },
          400
        );
      }
      if (pin && !/^\d{4,6}$/.test(pin)) {
        return jsonResponse({ error: 'رمز PIN يجب أن يتكون من 4 إلى 6 أرقام فقط' }, 400);
      }

      const fresh = this.createEmptyWorkspaceSeed(workspaceId, companyNameAr, companyNameEn);
      const adminId = `usr-${workspaceId}-owner`;
      const provNow = new Date().toISOString();
      const adminUser: StaffUser = {
        id: adminId,
        companyId: `comp-${workspaceId}`,
        nameAr: adminNameAr,
        nameEn: adminNameAr,
        email: adminEmail,
        phone: adminPhone,
        role: 'sys_owner',
        roleLabelAr: 'مالك النظام',
        roleLabelEn: 'System Owner',
        approvalLimitSar: 10000000,
        deviceName: String(body.deviceName || 'Web Terminal'),
        lastActiveAt: provNow,
        statusState: 'متصل',
        active: true,
        accountStatus: 'نشط',
        security: {
          hasPin: Boolean(pin),
          lastPasswordChangedAt: provNow,
        },
      };
      fresh.users.push(adminUser);
      this.stateCache = fresh;
      this.saveNormalizedState(fresh, workspaceId);

      const pwHash = await hashSecretWeb(password);
      const pinHash = pin ? await hashSecretWeb(pin) : null;
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)',
        adminId,
        pwHash,
        pinHash,
        provNow
      );

      const session = await this.issueSession(adminUser, workspaceId, adminUser.deviceName, {
        rememberMe: body.rememberMe !== false,
        appType,
        secure: secureReq,
      });
      const userState = this.getStateForUser(fresh, adminUser.id, workspaceId);
      return jsonResponse(
        {
          ok: true,
          workspaceId,
          authenticated: true,
          user: sanitizeUserForClient(adminUser),
          token: session.token,
          ...(appType === 'desktop' && session.refreshToken ? { refreshToken: session.refreshToken } : {}),
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          landingNav: getRecommendedLandingNav(userState, adminUser),
          allowedNavs: getAllowedNavsForUser(userState, adminUser),
          state: userState,
        },
        201,
        session.headers
      );
    }

    if (pathname === '/api/auth/session' && request.method === 'GET') {
      const demoLoginEnabled = this.env.AQAR_DEMO_LOGIN === 'true';
      const actor = await this.resolveActor(request, state, workspaceId);
      const companyBranding = {
        nameAr: state.settings.nameAr,
        nameEn: state.settings.nameEn,
        logoDataUrl: state.settings.logoDataUrl,
        workspaceId,
      };
      const loginProfiles = demoLoginEnabled
        ? state.users
            .filter((u) => isUserAccountActive(u))
            .map((u) => ({
              id: u.id,
              nameAr: u.nameAr,
              nameEn: u.nameEn,
              role: u.role,
              roleLabelAr: u.roleLabelAr,
              roleLabelEn: u.roleLabelEn,
              email: u.email,
            }))
        : [];
      if (!actor) {
        return jsonResponse({
          authenticated: false,
          workspaceId,
          workspaceExists: state.users.length > 0 || workspaceId === 'default',
          demoLoginEnabled,
          loginProfiles,
          companyBranding,
        });
      }
      const user = state.users.find((u) => u.id === actor.userId);
      const userState = this.getStateForUser(state, actor.userId, workspaceId);
      return jsonResponse({
        authenticated: true,
        workspaceId,
        workspaceExists: true,
        user: user ? sanitizeUserForClient(user) : undefined,
        token: actor.rawToken,
        sessionId: actor.sessionId,
        landingNav: getRecommendedLandingNav(userState, user),
        allowedNavs: getAllowedNavsForUser(userState, user),
        demoLoginEnabled,
        loginProfiles,
        companyBranding,
      });
    }

    if (pathname === '/api/auth/login' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const identifier = String(body.identifier || body.email || body.userId || '').trim().toLowerCase();
      const password = String(body.password || '');
      const appType: 'web' | 'desktop' = body.appType === 'desktop' ? 'desktop' : 'web';
      const rememberMe = body.rememberMe !== false;
      const phoneNeedle = normalizePhone(identifier);
      const user = state.users.find(
        (u) =>
          u.id.toLowerCase() === identifier ||
          u.email.toLowerCase() === identifier ||
          (u.username && u.username.toLowerCase() === identifier) ||
          (phoneNeedle.length >= 6 && normalizePhone(u.phone) === phoneNeedle)
      );
      if (!user) {
        this.recordDeniedAccess(state, workspaceId, undefined, 'فشل تسجيل الدخول', 'AuthLogin', identifier || 'unknown', 'محاولة دخول ببريد/معرف غير مسجل', {
          deviceName: String(body.deviceName || 'Web Terminal'),
        });
        return jsonResponse({ error: 'بيانات الدخول غير صحيحة' }, 401);
      }
      if (!isUserAccountActive(user)) {
        this.recordDeniedAccess(state, workspaceId, user, 'رفض دخول حساب غير نشط', 'AuthLogin', user.id, `محاولة دخول لحساب بحالة ${user.accountStatus || 'موقوف'}`, {
          deviceName: String(body.deviceName || 'Web Terminal'),
        });
        return jsonResponse({ error: 'تم إيقاف هذا الحساب أو لم يتم تفعيله بعد' }, 401);
      }

      const lockStatus = this.checkAccountLock(user.id);
      if (lockStatus.locked) {
        return jsonResponse(
          { error: `تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة. حاول بعد ${lockStatus.retryAfterSec} ثانية.` },
          429
        );
      }

      const cred = this.ctx.storage.sql
        .exec<{ password_hash: string }>('SELECT password_hash FROM user_credentials WHERE user_id = ?', user.id)
        .toArray()[0];
      if (!cred || !cred.password_hash || !(await verifySecretWeb(password, cred.password_hash))) {
        this.recordFailedAttempt(user.id);
        this.recordDeniedAccess(state, workspaceId, user, 'فشل تحقق كلمة المرور', 'AuthLogin', user.id, 'محاولة دخول بكلمة مرور خاطئة', {
          deviceName: String(body.deviceName || 'Web Terminal'),
        });
        return jsonResponse({ error: 'بيانات الدخول غير صحيحة' }, 401);
      }
      this.clearFailedAttempts(user.id);
      const session = await this.issueSession(user, workspaceId, String(body.deviceName || 'Web Terminal'), {
        rememberMe,
        appType,
        secure: secureReq,
      });
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          authenticated: true,
          workspaceId,
          user: sanitizeUserForClient(user),
          token: session.token,
          ...(appType === 'desktop' && session.refreshToken ? { refreshToken: session.refreshToken } : {}),
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          rememberMe: session.rememberMe,
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState,
        },
        200,
        session.headers
      );
    }

    if (pathname === '/api/auth/login-pin' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const identifier = String(body.userId || body.identifier || '').trim().toLowerCase();
      const pin = String(body.pin || '').trim();
      const appType: 'web' | 'desktop' = body.appType === 'desktop' ? 'desktop' : 'web';
      const rememberMe = body.rememberMe !== false;
      const user = state.users.find(
        (u) => u.id.toLowerCase() === identifier || u.email.toLowerCase() === identifier
      );
      if (!user || !isUserAccountActive(user)) {
        this.recordDeniedAccess(state, workspaceId, user, 'فشل دخول PIN', 'AuthPin', identifier || 'unknown', 'محاولة دخول برمز PIN لحساب غير متاح');
        return jsonResponse({ error: 'بيانات الدخول أو رمز PIN غير صحيحة' }, 401);
      }

      const lockStatus = this.checkAccountLock(user.id);
      if (lockStatus.locked) {
        return jsonResponse(
          { error: `تم قفل الدخول السريع مؤقتاً لكثرة المحاولات الخاطئة. حاول بعد ${lockStatus.retryAfterSec} ثانية.` },
          429
        );
      }

      const cred = this.ctx.storage.sql
        .exec<{ pin_hash: string | null }>('SELECT pin_hash FROM user_credentials WHERE user_id = ?', user.id)
        .toArray()[0];
      if (!cred?.pin_hash || !(await verifySecretWeb(pin, cred.pin_hash))) {
        this.recordFailedAttempt(user.id);
        this.recordDeniedAccess(state, workspaceId, user, 'فشل تحقق PIN', 'AuthPin', user.id, 'محاولة دخول برمز PIN غير صحيح');
        return jsonResponse({ error: 'رمز PIN غير صحيح' }, 401);
      }
      this.clearFailedAttempts(user.id);
      const session = await this.issueSession(user, workspaceId, String(body.deviceName || 'Web Terminal'), {
        rememberMe,
        appType,
        secure: secureReq,
      });
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          authenticated: true,
          workspaceId,
          user: sanitizeUserForClient(user),
          token: session.token,
          ...(appType === 'desktop' && session.refreshToken ? { refreshToken: session.refreshToken } : {}),
          expiresAt: session.expiresAt,
          refreshExpiresAt: session.refreshExpiresAt,
          sessionId: session.sessionId,
          rememberMe: session.rememberMe,
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState,
        },
        200,
        session.headers
      );
    }

    if (pathname === '/api/auth/refresh' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const cookies = parseCookies(request.headers.get('cookie'));
      const cookieRefresh = (cookies[REFRESH_COOKIE_NAME] || '').trim();
      const bodyRefresh = body?.refreshToken ? String(body.refreshToken).trim() : '';
      const rawRefresh = cookieRefresh || bodyRefresh;
      if (!rawRefresh) {
        return jsonResponse({ error: 'رمز تجديد الجلسة غير موجود', code: 'AUTH_REQUIRED' }, 401);
      }
      const refHash = await sha256HexWeb(rawRefresh);
      const dbSession = this.ctx.storage.sql
        .exec<{
          token_id: string;
          user_id: string;
          workspace_id: string;
          device_name: string;
          app_type: string;
          remember_me: number;
          refresh_expires_at: string | null;
          revoked: number;
        }>(
          'SELECT token_id, user_id, workspace_id, device_name, app_type, remember_me, refresh_expires_at, revoked FROM sessions WHERE refresh_token_hash = ?',
          refHash
        )
        .toArray()[0];

      if (
        !dbSession ||
        dbSession.revoked !== 0 ||
        dbSession.workspace_id !== workspaceId ||
        (dbSession.refresh_expires_at && new Date(dbSession.refresh_expires_at).getTime() <= Date.now())
      ) {
        return jsonResponse({ error: 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً', code: 'AUTH_REQUIRED' }, 401);
      }
      if (dbSession.app_type !== 'desktop' && !cookieRefresh) {
        this.recordDeniedAccess(state, workspaceId, undefined, 'رفض تجديد جلسة ويب عبر body', 'SessionSecurity', dbSession.token_id, 'محاولة استخدام refreshToken في body لجلسة ويب');
        return jsonResponse({ error: 'تجديد جلسة الويب يتطلب ملف تعريف الجلسة الآمن فقط', code: 'AUTH_REQUIRED' }, 401);
      }

      const user = state.users.find((u) => u.id === dbSession.user_id && isUserAccountActive(u));
      if (!user) {
        this.revokeUserSessions(dbSession.user_id, workspaceId, 'تم إيقاف الحساب');
        return jsonResponse({ error: 'تم إيقاف الحساب أو انتهت عضويته', code: 'AUTH_REQUIRED' }, 401);
      }

      const rememberMe = dbSession.remember_me !== 0;
      const isDesktop = dbSession.app_type === 'desktop';
      const now = Date.now();
      const accessTtlMs = rememberMe ? ACCESS_TOKEN_TTL_MS : SESSION_SHORT_TTL_MS;
      const exp = now + accessTtlMs;
      const newExpiresAt = new Date(exp).toISOString();
      const newRefreshExpiresAt = new Date(now + SESSION_TTL_MS).toISOString();
      const newRefreshToken = randomHexWeb(32);
      const newRefHash = await sha256HexWeb(newRefreshToken);
      const newAccessToken = await signTokenWeb(
        { sid: dbSession.token_id, uid: user.id, wid: workspaceId, role: user.role, deviceName: dbSession.device_name, iat: now, exp },
        this.sessionSecretCache!
      );

      this.ctx.storage.sql.exec(
        'UPDATE sessions SET refresh_token_hash = ?, expires_at = ?, refresh_expires_at = ? WHERE token_id = ? AND refresh_token_hash = ? AND revoked = 0',
        newRefHash,
        newExpiresAt,
        newRefreshExpiresAt,
        dbSession.token_id,
        refHash
      );

      const headers = this.buildSessionHeaders(newAccessToken, newRefreshToken, rememberMe, accessTtlMs, secureReq);
      const userState = this.getStateForUser(state, user.id, workspaceId);
      return jsonResponse(
        {
          ok: true,
          authenticated: true,
          workspaceId,
          token: newAccessToken,
          ...(isDesktop ? { refreshToken: newRefreshToken } : {}),
          expiresAt: newExpiresAt,
          refreshExpiresAt: newRefreshExpiresAt,
          rememberMe,
          user: sanitizeUserForClient(user),
          landingNav: getRecommendedLandingNav(userState, user),
          allowedNavs: getAllowedNavsForUser(userState, user),
          state: userState,
        },
        200,
        headers
      );
    }

    if (pathname === '/api/auth/logout' && request.method === 'POST') {
      const token = this.extractToken(request);
      if (token && this.sessionSecretCache) {
        const claims = await verifyTokenWeb(token, this.sessionSecretCache);
        if (claims?.sid) {
          this.ctx.storage.sql.exec('UPDATE sessions SET revoked = 1 WHERE token_id = ?', claims.sid);
        }
      }
      const headers = new Headers();
      headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      headers.append('Set-Cookie', `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return jsonResponse({ ok: true }, 200, headers);
    }

    if (pathname === '/api/public/prospect-context' && request.method === 'GET') {
      return jsonResponse({
        companyNameAr: state.settings.nameAr,
        companyNameEn: state.settings.nameEn,
        properties: state.properties.map((p) => ({ id: p.id, nameAr: p.nameAr, city: p.city, district: p.district })),
        vacantUnits: state.units
          .filter((u) => u.status === 'شاغرة' || u.status === 'قيد التأجير')
          .map((u) => ({
            id: u.id,
            propertyId: u.propertyId,
            unitNumber: u.unitNumber,
            unitType: u.unitType,
            suggestedAnnualRent: u.suggestedAnnualRent,
            areaSqm: u.areaSqm,
            rooms: u.rooms,
          })),
      });
    }

    if (pathname === '/api/public/leads' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const lead: Lead = {
        id: uid('lead'),
        nameAr: String(body.nameAr || ''),
        phone: String(body.phone || ''),
        source: String(body.source || 'استبيان رابط إلكتروني'),
        propertyId: String(body.propertyId || state.properties[0]?.id || ''),
        unitId: String(body.unitId || state.units[0]?.id || ''),
        offeredRent: Number(body.offeredRent || 0),
        budgetMonthly: Math.round(Number(body.offeredRent || 0) / 12),
        viewingDate: new Date().toISOString().slice(0, 10),
        status: 'جديد',
        assignedTo: state.users.find((u) => u.role === 'leasing')?.id || state.users[0]?.id || '',
        notes: String(body.notes || ''),
        createdAt: new Date().toISOString(),
      };
      state.leads.unshift(lead);
      this.persistState(state, workspaceId);
      return jsonResponse({ lead, ok: true }, 201);
    }

    // 3. Protected API Guard
    const actor =
      !PUBLIC_PATHS.has(pathname) && !pathname.startsWith('/api/public/lead-decision/')
        ? await this.resolveActor(request, state, workspaceId)
        : null;

    if (!PUBLIC_PATHS.has(pathname) && !pathname.startsWith('/api/public/lead-decision/') && !actor) {
      this.recordDeniedAccess(
        state,
        workspaceId,
        undefined,
        'رفض وصول غير مصرح به (401)',
        'SecurityAuth',
        pathname,
        `محاولة وصول مرفوضة (${request.method} ${pathname}) بدون جلسة صالحة`
      );
      return jsonResponse(
        { error: 'انتهت الجلسة أو لم يتم تسجيل الدخول — يرجى المصادقة للمتابعة', code: 'AUTH_REQUIRED' },
        401
      );
    }

    const verifiedActor = actor!;

    if (pathname === '/api/auth/logout-all' && request.method === 'POST') {
      const revokedCount = this.revokeUserSessions(
        verifiedActor.userId,
        workspaceId,
        'تم تسجيل الخروج من جميع الأجهزة بناءً على طلبك'
      );
      const headers = new Headers();
      headers.append('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      headers.append('Set-Cookie', `${REFRESH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return jsonResponse({ ok: true, revokedCount }, 200, headers);
    }

    if (pathname === '/api/auth/me' && request.method === 'GET') {
      const user = state.users.find((u) => u.id === verifiedActor.userId);
      const userState = this.getStateForUser(state, verifiedActor.userId, workspaceId);
      return jsonResponse({
        authenticated: true,
        user: user ? sanitizeUserForClient(user) : undefined,
        sessionId: verifiedActor.sessionId,
        allowedNavs: getAllowedNavsForUser(userState, user),
        landingNav: getRecommendedLandingNav(userState, user),
      });
    }

    if (pathname === '/api/state' && request.method === 'GET') {
      return jsonResponse({
        state: this.getStateForUser(state, verifiedActor.userId, workspaceId),
        presence: this.getPresenceList(state),
        workspaceId,
      });
    }

    if (pathname === '/api/auth/credentials' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const targetUserId = String(body.targetUserId || verifiedActor.userId);
        const actorUser = this.getActingUser(state, verifiedActor.userId);
        const isSelf = targetUserId === actorUser.id;
        if (!isSelf && actorUser.role !== 'sys_owner') {
          this.recordDeniedAccess(state, workspaceId, actorUser, 'رفض تعديل بيانات دخول موظف', 'StaffCredentials', targetUserId, 'تعديل بيانات دخول موظف آخر حصري لمالك النظام', { deviceName: verifiedActor.deviceName });
          throw new WorkerPermissionDeniedError('تعديل بيانات دخول موظف آخر حصري لمالك النظام');
        }
        const now = new Date().toISOString();
        const row = this.ctx.storage.sql
          .exec<{ password_hash: string; pin_hash: string | null }>(
            'SELECT password_hash, pin_hash FROM user_credentials WHERE user_id = ?',
            targetUserId
          )
          .toArray()[0];

        if (isSelf && body.newPassword) {
          if (!body.currentPassword || !row?.password_hash || !(await verifySecretWeb(String(body.currentPassword), row.password_hash))) {
            return jsonResponse({ error: 'كلمة المرور الحالية غير صحيحة' }, 400);
          }
        }
        let pwHash = row?.password_hash || (await hashSecretWeb(randomHexWeb(18)));
        let pinHash = row?.pin_hash ?? null;
        if (body.newPassword) {
          if (String(body.newPassword).length < 8) {
            return jsonResponse({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف' }, 400);
          }
          pwHash = await hashSecretWeb(String(body.newPassword));
        }
        if (body.newPin) {
          if (!/^\d{4,6}$/.test(String(body.newPin))) {
            return jsonResponse({ error: 'رمز PIN الجديد يجب أن يتكون من 4 إلى 6 أرقام' }, 400);
          }
          pinHash = await hashSecretWeb(String(body.newPin));
        }
        this.ctx.storage.sql.exec(
          'INSERT OR REPLACE INTO user_credentials (user_id, password_hash, pin_hash, failed_attempts, locked_until, updated_at) VALUES (?, ?, ?, 0, NULL, ?)',
          targetUserId,
          pwHash,
          pinHash,
          now
        );
        if (body.newPassword || body.newPin) {
          this.revokeUserSessions(
            targetUserId,
            workspaceId,
            isSelf ? 'تم تحديث بيانات الدخول — تم إنهاء الجلسات الأخرى' : 'تمت إعادة تعيين بيانات الدخول بواسطة مالك النظام',
            isSelf ? verifiedActor.sessionId : undefined
          );
        }
        this.appendAudit(state, verifiedActor.userId, 'تحديث بيانات الدخول', 'أمان المستخدمين', targetUserId, isSelf ? 'تحديث كلمة المرور أو PIN الشخصي' : `إعادة تعيين بيانات ${targetUserId}`, verifiedActor.deviceName);
        this.persistState(state, workspaceId);
        return jsonResponse({ ok: true, state: this.getStateForUser(state, verifiedActor.userId, workspaceId) });
      } catch (err) {
        return errorResponse(err, 400);
      }
    }

    // Encrypted Backup Endpoints on Durable Object SQLite
    if (pathname === '/api/backups' && request.method === 'POST') {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, 'backup_restore', {
          entityType: 'Backup',
          deviceName: verifiedActor.deviceName,
        });
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const snapshotData = JSON.parse(JSON.stringify(state)) as AqarDatabaseState;
        const encryptPassword = body.encryptPassword ? String(body.encryptPassword) : undefined;
        const encrypted = Boolean(encryptPassword && encryptPassword.trim().length > 0);
        const id = uid('bkp');
        const payloadToStore = encrypted
          ? await encryptBackupWeb(snapshotData, encryptPassword!)
          : snapshotData;
        const rawPayload = JSON.stringify(payloadToStore);
        const bkpMeta: BackupSnapshot = {
          id,
          label: String(body.label || `نسخة سحابية · ${new Date().toLocaleDateString('ar-SA')}`),
          createdAt: new Date().toISOString(),
          createdBy: verifiedActor.userId,
          sizeKb: Math.max(1, Math.round(rawPayload.length / 1024)),
          recordCount:
            state.properties.length +
            state.units.length +
            state.tenants.length +
            state.contracts.length +
            state.payments.length,
          encrypted,
        };
        this.ctx.storage.sql.exec(
          'INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)',
          id,
          rawPayload,
          bkpMeta.createdAt
        );
        state.backups.unshift(bkpMeta);
        this.persistState(state, workspaceId);
        return jsonResponse({ backup: bkpMeta, state: this.getStateForUser(state, verifiedActor.userId, workspaceId) }, 201);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }

    const bkpPreviewMatch = /^\/api\/backups\/([^/]+)\/preview$/.exec(pathname);
    if (bkpPreviewMatch && (request.method === 'POST' || request.method === 'GET')) {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, 'backup_restore', {
          entityType: 'Backup',
          entityId: bkpPreviewMatch[1],
          deviceName: verifiedActor.deviceName,
        });
        const bkpId = bkpPreviewMatch[1];
        const meta = state.backups.find((b) => b.id === bkpId);
        const row = this.ctx.storage.sql
          .exec<{ payload_json: string }>('SELECT payload_json FROM backups_store WHERE id = ?', bkpId)
          .toArray()[0];
        if (!row) {
          return jsonResponse({
            id: bkpId,
            label: meta?.label || '',
            exists: false,
            encrypted: Boolean(meta?.encrypted),
            propertiesCount: 0,
            unitsCount: 0,
            tenantsCount: 0,
            contractsCount: 0,
            paymentsCount: 0,
            templatesCount: 0,
          });
        }
        const parsed = JSON.parse(row.payload_json) as AqarDatabaseState | WebEncryptedEnvelope;
        let snap: AqarDatabaseState;
        if ('aqarEncrypted' in parsed && parsed.aqarEncrypted) {
          const body = request.method === 'POST' ? ((await request.json().catch(() => ({}))) as Record<string, any>) : {};
          const password = body.password ? String(body.password) : url.searchParams.get('password') || '';
          if (!password) {
            return jsonResponse({
              id: bkpId,
              exists: true,
              encrypted: true,
              requiresPassword: true,
              propertiesCount: 0,
              unitsCount: 0,
              tenantsCount: 0,
              contractsCount: 0,
              paymentsCount: 0,
              templatesCount: 0,
            });
          }
          try {
            snap = await decryptBackupWeb<AqarDatabaseState>(parsed, password);
          } catch {
            return jsonResponse({
              id: bkpId,
              exists: true,
              encrypted: true,
              requiresPassword: true,
              decryptionError: 'كلمة مرور فك التشفير غير صحيحة',
              propertiesCount: 0,
              unitsCount: 0,
              tenantsCount: 0,
              contractsCount: 0,
              paymentsCount: 0,
              templatesCount: 0,
            });
          }
        } else {
          snap = parsed as AqarDatabaseState;
        }

        const diffCollection = <T extends { id: string }>(cur: T[] = [], inc: T[] = []): BackupCollectionDiff => {
          const curMap = new Map(cur.map((x) => [x.id, JSON.stringify(x)]));
          let added = 0;
          let updated = 0;
          let unchanged = 0;
          for (const item of inc) {
            const ex = curMap.get(item.id);
            if (!ex) added += 1;
            else if (ex === JSON.stringify(item)) unchanged += 1;
            else updated += 1;
          }
          return { added, updated, unchanged };
        };

        const diff = {
          properties: diffCollection(state.properties, snap.properties),
          units: diffCollection(state.units, snap.units),
          tenants: diffCollection(state.tenants, snap.tenants),
          contracts: diffCollection(state.contracts, snap.contracts),
          payments: diffCollection(state.payments, snap.payments),
          expenses: diffCollection(state.expenses, snap.expenses),
          tickets: diffCollection(state.tickets, snap.tickets),
        };
        const totalChanged = Object.values(diff).reduce((s, d) => s + d.added + d.updated, 0);

        const preview: BackupPreviewResult = {
          id: bkpId,
          exists: true,
          encrypted: 'aqarEncrypted' in parsed,
          propertiesCount: snap.properties?.length || 0,
          unitsCount: snap.units?.length || 0,
          tenantsCount: snap.tenants?.length || 0,
          contractsCount: snap.contracts?.length || 0,
          paymentsCount: snap.payments?.length || 0,
          templatesCount: snap.communicationTemplates?.length || 0,
          lastUpdatedAt: snap.lastUpdatedAt,
          diff: { ...diff, totalChanged },
        };
        return jsonResponse(preview);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }

    const bkpRestoreMatch = /^\/api\/backups\/([^/]+)\/restore$/.exec(pathname);
    if (bkpRestoreMatch && request.method === 'POST') {
      try {
        this.assertPermission(state, workspaceId, verifiedActor.userId, 'backup_restore', {
          entityType: 'Backup',
          entityId: bkpRestoreMatch[1],
          deviceName: verifiedActor.deviceName,
        });
        const bkpId = bkpRestoreMatch[1];
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const row = this.ctx.storage.sql
          .exec<{ payload_json: string }>('SELECT payload_json FROM backups_store WHERE id = ?', bkpId)
          .toArray()[0];
        if (!row) return jsonResponse({ error: 'النسخة غير موجودة' }, 404);
        const parsed = JSON.parse(row.payload_json) as AqarDatabaseState | WebEncryptedEnvelope;
        let snap: AqarDatabaseState;
        if ('aqarEncrypted' in parsed && parsed.aqarEncrypted) {
          if (!body.password) return jsonResponse({ error: 'كلمة مرور فك التشفير مطلوبة' }, 400);
          try {
            snap = await decryptBackupWeb<AqarDatabaseState>(parsed, String(body.password));
          } catch {
            return jsonResponse({ error: 'كلمة مرور فك التشفير غير صحيحة' }, 400);
          }
        } else {
          snap = parsed as AqarDatabaseState;
        }
        const safetyId = uid('bkp-safety');
        this.ctx.storage.sql.exec(
          'INSERT INTO backups_store (id, payload_json, created_at) VALUES (?, ?, ?)',
          safetyId,
          JSON.stringify(state),
          new Date().toISOString()
        );
        const existingAudits = [...(state.auditLogs || [])];
        if (body.mode === 'merge') {
          const mergeById = <T extends { id: string }>(cur: T[] = [], inc: T[] = []) => {
            const seen = new Set(cur.map((x) => x.id));
            return [...cur, ...inc.filter((x) => !seen.has(x.id))];
          };
          state.properties = mergeById(state.properties, snap.properties);
          state.units = mergeById(state.units, snap.units);
          state.tenants = mergeById(state.tenants, snap.tenants);
          state.contracts = mergeById(state.contracts, snap.contracts);
          state.installments = mergeById(state.installments, snap.installments);
          state.payments = mergeById(state.payments, snap.payments);
          state.expenses = mergeById(state.expenses, snap.expenses);
          state.tickets = mergeById(state.tickets, snap.tickets);
          state.tasks = mergeById(state.tasks, snap.tasks);
          state.documents = mergeById(state.documents, snap.documents);
          state.auditLogs = mergeById(existingAudits, snap.auditLogs || []);
        } else {
          const preservedBackups = state.backups;
          Object.assign(state, snap);
          state.backups = preservedBackups;
          const seenAudits = new Set(existingAudits.map((a) => a.id));
          state.auditLogs = [...existingAudits, ...(snap.auditLogs || []).filter((a) => !seenAudits.has(a.id))];
        }
        this.appendAudit(state, verifiedActor.userId, 'استعادة نسخة احتياطية', 'نظام', bkpId, `استعادة (${body.mode || 'replace'}) مع الحفاظ على سجل التدقيق`, verifiedActor.deviceName);
        this.persistState(state, workspaceId);
        this.broadcastStateChange(state, verifiedActor.userId, 'استعادة نسخة احتياطية', workspaceId);
        return jsonResponse({ ok: true, mode: body.mode || 'replace', state: this.getStateForUser(state, verifiedActor.userId, workspaceId) });
      } catch (err) {
        return errorResponse(err, 400);
      }
    }

    // Idempotent Offline Sync Batch Replay with operations_log + entityRevisions conflict check
    if (pathname === '/api/sync/batch' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const operations = Array.isArray(body.operations) ? body.operations : [];
      let uploaded = 0;
      let skippedDuplicates = 0;
      let conflictsDetected = 0;
      const newConflicts: SyncConflictRecord[] = [];
      const errors: string[] = [];

      for (const op of operations) {
        const operationId = String(op.operationId || op.idempotencyKey || op.id || '');
        if (!operationId) continue;

        const existingOp = this.ctx.storage.sql
          .exec<{ operation_id: string }>('SELECT operation_id FROM operations_log WHERE operation_id = ?', operationId)
          .toArray()[0];

        if (existingOp) {
          skippedDuplicates += 1;
          continue;
        }

        if (op.entityType && op.entityId && typeof op.baseRevision === 'number') {
          const revKey = `${op.entityType}:${op.entityId}`;
          const serverRev = state.entityRevisions?.[revKey] || 0;
          if (serverRev > op.baseRevision) {
            conflictsDetected += 1;
            const conflict: SyncConflictRecord = {
              id: uid('cnf'),
              entityType: op.entityType,
              entityId: op.entityId,
              entityLabel: `${op.entityType}:${op.entityId}`,
              firstActorName: 'تحديث محفوظ على الخادم',
              secondActorName: verifiedActor.deviceName,
              firstChangeSummary: `إصدار الخادم #${serverRev}`,
              secondChangeSummary: `عملية جهاز العميل (${op.endpoint}) من الإصدار #${op.baseRevision}`,
              status: 'بانتظار مراجعة المدير',
              createdAt: new Date().toISOString(),
            };
            if (!state.syncConflicts) state.syncConflicts = [];
            state.syncConflicts.unshift(conflict);
            newConflicts.push(conflict);
          }
        }

        try {
          const res = await this.handleMutation(state, verifiedActor, op.method || 'POST', op.endpoint, op.body || {});
          uploaded += 1;
          this.ctx.storage.sql.exec(
            'INSERT INTO operations_log (operation_id, user_id, method, endpoint, entity_type, entity_id, status, response_json, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            operationId,
            verifiedActor.userId,
            op.method || 'POST',
            op.endpoint,
            op.entityType || null,
            op.entityId || null,
            'applied',
            JSON.stringify({ ok: true, id: (res as { id?: string })?.id }),
            new Date().toISOString()
          );
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      if (conflictsDetected > 0) this.persistState(state, workspaceId);
      if (uploaded > 0) {
        this.broadcastStateChange(state, verifiedActor.userId, `مزامنة ${uploaded} عملية من العمل دون إنترنت`, workspaceId);
      }

      return jsonResponse({
        success: errors.length === 0,
        uploaded,
        skippedDuplicates,
        conflictsDetected,
        newConflicts,
        errors,
        state: this.getStateForUser(state, verifiedActor.userId, workspaceId),
        syncedAt: new Date().toISOString(),
      });
    }

    if (pathname === '/api/sync/delta' && request.method === 'GET') {
      const since = url.searchParams.get('since');
      const hasChanges = !since || new Date(state.lastUpdatedAt).getTime() > new Date(since).getTime();
      return jsonResponse({
        hasChanges,
        serverRevision: state.syncRevision || 1,
        lastUpdatedAt: state.lastUpdatedAt,
        pendingConflictsCount: (state.syncConflicts || []).filter((c) => c.status === 'بانتظار مراجعة المدير').length,
        syncConflicts: state.syncConflicts || [],
        state: hasChanges ? this.getStateForUser(state, verifiedActor.userId, workspaceId) : undefined,
      });
    }

    // Standard protected mutations
    if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE') {
      try {
        const body = (await request.json().catch(() => ({}))) as Record<string, any>;
        const result = await this.handleMutation(state, verifiedActor, request.method, pathname, body);
        this.broadcastStateChange(state, verifiedActor.userId, `تحديث ${pathname}`, workspaceId);
        return jsonResponse(result, request.method === 'POST' ? 201 : 200);
      } catch (err) {
        return errorResponse(err, 400);
      }
    }

    return jsonResponse({ error: 'Not Found' }, 404);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const text = typeof message === 'string' ? message : new TextDecoder().decode(message);
      const msg = JSON.parse(text) as { type?: string; token?: string; deviceName?: string };
      if (msg.type === 'session:identify') {
        const prev = ws.deserializeAttachment() as WsAttachment | null;
        const workspaceId = prev?.workspaceId || 'default';
        const state = await this.ensureBootstrapped(workspaceId);
        const dummyReq = new Request('https://worker.local/ws', {
          headers: { 'x-resolved-workspace-id': workspaceId },
        });
        const actor = await this.resolveActor(dummyReq, state, workspaceId, msg.token);
        if (!actor) {
          ws.send(JSON.stringify({ type: 'auth:required' }));
          return;
        }
        const meta: WsAttachment = {
          sessionId: actor.sessionId,
          userId: actor.userId,
          workspaceId,
          authenticated: true,
          deviceName: msg.deviceName || actor.deviceName,
          connectedAt: new Date().toISOString(),
        };
        ws.serializeAttachment(meta);
        ws.send(
          JSON.stringify({
            type: 'state:init',
            state: this.getStateForUser(state, actor.userId, workspaceId),
            presence: this.getPresenceList(state),
          })
        );
      }
    } catch {
      // ignore invalid ws payload
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    try {
      ws.close(code, reason);
    } catch {
      // already closed
    }
  }
}
