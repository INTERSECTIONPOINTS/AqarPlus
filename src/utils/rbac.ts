import {
  AqarDatabaseState,
  CustomRoleDefinition,
  PermissionKey,
  PermissionLevel,
  PermissionModuleKey,
  RoleKey,
  StaffUser,
} from '../types/aqar';

export interface RbacModuleMeta {
  key: PermissionModuleKey;
  labelAr: string;
  labelEn: string;
  groupAr: string;
}

export interface RbacActionMeta {
  key: PermissionLevel;
  labelAr: string;
  labelEn: string;
}

export interface RoleTemplateMeta {
  key: RoleKey;
  labelAr: string;
  labelEn: string;
  tierAr: string;
  descAr: string;
  defaultLimitSar: number;
}

export const RBAC_MODULES: RbacModuleMeta[] = [
  { key: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', groupAr: 'العمليات' },
  { key: 'properties', labelAr: 'العقارات', labelEn: 'Properties', groupAr: 'المحفظة' },
  { key: 'units', labelAr: 'الوحدات', labelEn: 'Units', groupAr: 'المحفظة' },
  { key: 'tenants', labelAr: 'المستأجرون والمهتمون', labelEn: 'Tenants & Leads', groupAr: 'التأجير' },
  { key: 'contracts', labelAr: 'العقود وإيجار', labelEn: 'Contracts', groupAr: 'التأجير' },
  { key: 'payments', labelAr: 'الدفعات والتحصيل', labelEn: 'Payments', groupAr: 'المالية' },
  { key: 'finance', labelAr: 'المالية والمحاسبة', labelEn: 'Finance & Ledger', groupAr: 'المالية' },
  { key: 'receipts', labelAr: 'الإيصالات والسندات', labelEn: 'Receipts', groupAr: 'المالية' },
  { key: 'expenses', labelAr: 'المصروفات والموافقات', labelEn: 'Expenses', groupAr: 'المالية' },
  { key: 'maintenance', labelAr: 'الصيانة والبلاغات', labelEn: 'Maintenance', groupAr: 'التشغيل' },
  { key: 'tasks', labelAr: 'المهام اليومية', labelEn: 'Tasks', groupAr: 'التشغيل' },
  { key: 'reports', labelAr: 'التقارير والتحليلات', labelEn: 'Reports', groupAr: 'التقارير' },
  { key: 'documents', labelAr: 'خزنة المستندات', labelEn: 'Documents', groupAr: 'الأرشفة' },
  { key: 'archive', labelAr: 'الأرشيف الذكي', labelEn: 'Smart Archive', groupAr: 'الأرشفة' },
  { key: 'team', labelAr: 'المستخدمون وفريق العمل', labelEn: 'Team & Workforce', groupAr: 'الإدارة' },
  { key: 'audit', labelAr: 'سجل التدقيق', labelEn: 'Audit Logs', groupAr: 'الإدارة' },
  { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', groupAr: 'الإدارة' },
  { key: 'backups', labelAr: 'النسخ الاحتياطي', labelEn: 'Backups', groupAr: 'الإدارة' },
];

export const RBAC_ACTIONS: RbacActionMeta[] = [
  { key: 'view', labelAr: 'عرض', labelEn: 'View' },
  { key: 'create', labelAr: 'إنشاء', labelEn: 'Create' },
  { key: 'edit', labelAr: 'تعديل', labelEn: 'Edit' },
  { key: 'delete_void', labelAr: 'حذف / إلغاء', labelEn: 'Delete' },
  { key: 'approve', labelAr: 'اعتماد', labelEn: 'Approve' },
  { key: 'export', labelAr: 'تصدير / طباعة', labelEn: 'Export' },
  { key: 'manage', labelAr: 'إدارة كاملة', labelEn: 'Manage' },
];

export const ROLE_TEMPLATES: RoleTemplateMeta[] = [
  {
    key: 'sys_owner',
    labelAr: 'مالك النظام',
    labelEn: 'System Owner',
    tierAr: 'تحكم كامل',
    descAr: 'التحكم الكامل بالمنشأة، إدارة الحسابات والأدوار، الأمان، والنسخ الاحتياطي',
    defaultLimitSar: 9999999,
  },
  {
    key: 'gm',
    labelAr: 'مدير الشركة',
    labelEn: 'Company Manager',
    tierAr: 'مرتفع',
    descAr: 'الإشراف العام، التقارير المالية، واعتماد المصروفات الكبرى والقرارات',
    defaultLimitSar: 500000,
  },
  {
    key: 'supervisor',
    labelAr: 'المشرف العقاري',
    labelEn: 'Property Supervisor',
    tierAr: 'متوسط-مرتفع',
    descAr: 'إدارة العقارات والوحدات، متابعة الإشغال ومحاضر الاستلام والإخلاء',
    defaultLimitSar: 25000,
  },
  {
    key: 'accountant',
    labelAr: 'المحاسب',
    labelEn: 'Accountant',
    tierAr: 'مالي فقط',
    descAr: 'التحصيل، سندات القبض، المصروفات، القيود المحاسبية وتقارير الملاك',
    defaultLimitSar: 50000,
  },
  {
    key: 'leasing',
    labelAr: 'موظف التأجير',
    labelEn: 'Leasing Agent',
    tierAr: 'متوسط',
    descAr: 'تسجيل المستأجرين، إبرام العقود، التوثيق في إيجار ومتابعة المتأخرات',
    defaultLimitSar: 0,
  },
  {
    key: 'maint_manager',
    labelAr: 'مسؤول الصيانة',
    labelEn: 'Maintenance Manager',
    tierAr: 'تشغيلي',
    descAr: 'استقبال بلاغات الصيانة، إسناد المهام للفنيين، وإدارة الموردين',
    defaultLimitSar: 15000,
  },
  {
    key: 'technician',
    labelAr: 'فني الصيانة',
    labelEn: 'Technician',
    tierAr: 'محدود',
    descAr: 'تنفيذ المهام الميدانية المسندة ورفع التقارير والتشخيص والصور',
    defaultLimitSar: 0,
  },
  {
    key: 'receptionist',
    labelAr: 'موظف الاستقبال',
    labelEn: 'Receptionist',
    tierAr: 'أساسي',
    descAr: 'تسجيل البيانات الأولية للعملاء، رفع المستندات، وتوجيه البلاغات',
    defaultLimitSar: 0,
  },
  {
    key: 'auditor',
    labelAr: 'المراجع',
    labelEn: 'Auditor',
    tierAr: 'للقراءة فقط',
    descAr: 'الاطلاع الكامل على السجلات المالية والتشغيلية وسجل التدقيق دون تعديل',
    defaultLimitSar: 0,
  },
  {
    key: 'owner',
    labelAr: 'بوابة المالك',
    labelEn: 'Owner Portal',
    tierAr: 'محفظة المالك',
    descAr: 'متابعة عوائد وإشغال العقارات المملوكة ومستندات التسوية فقط',
    defaultLimitSar: 0,
  },
];

const ALL_ACTIONS: PermissionLevel[] = ['view', 'create', 'edit', 'delete_void', 'approve', 'export', 'manage'];

export function getDefaultModulePermissionsForRole(
  role: RoleKey
): Partial<Record<PermissionModuleKey, PermissionLevel[]>> {
  if (role === 'sys_owner' || role === 'gm') {
    return Object.fromEntries(RBAC_MODULES.map((m) => [m.key, [...ALL_ACTIONS]]));
  }
  if (role === 'auditor') {
    return Object.fromEntries(
      RBAC_MODULES.filter((m) => m.key !== 'settings' && m.key !== 'backups').map((m) => [
        m.key,
        ['view', 'export'] as PermissionLevel[],
      ])
    );
  }
  if (role === 'accountant') {
    return {
      dashboard: ['view'],
      properties: ['view'],
      units: ['view'],
      tenants: ['view'],
      contracts: ['view'],
      payments: ['view', 'create', 'edit', 'approve', 'export'],
      finance: ['view', 'create', 'edit', 'approve', 'export', 'manage'],
      receipts: ['view', 'create', 'delete_void', 'export'],
      expenses: ['view', 'create', 'edit', 'export'],
      reports: ['view', 'export'],
      documents: ['view', 'create', 'export'],
      archive: ['view', 'export'],
      audit: ['view'],
    };
  }
  if (role === 'supervisor') {
    return {
      dashboard: ['view'],
      properties: ['view', 'create', 'edit', 'export'],
      units: ['view', 'create', 'edit', 'export'],
      tenants: ['view', 'create', 'edit'],
      contracts: ['view', 'create', 'edit', 'approve'],
      maintenance: ['view', 'create', 'edit', 'approve'],
      tasks: ['view', 'create', 'edit', 'approve'],
      expenses: ['view', 'create', 'approve'],
      reports: ['view', 'export'],
      documents: ['view', 'create'],
      archive: ['view', 'create'],
    };
  }
  if (role === 'leasing') {
    return {
      dashboard: ['view'],
      properties: ['view', 'edit'],
      units: ['view', 'create', 'edit'],
      tenants: ['view', 'create', 'edit', 'export'],
      contracts: ['view', 'create', 'edit', 'export'],
      tasks: ['view', 'create'],
      documents: ['view', 'create'],
      archive: ['view'],
    };
  }
  if (role === 'maint_manager') {
    return {
      dashboard: ['view'],
      properties: ['view'],
      units: ['view'],
      maintenance: ['view', 'create', 'edit', 'approve', 'manage'],
      tasks: ['view', 'create', 'edit', 'approve', 'manage'],
      expenses: ['view', 'create', 'approve'],
      documents: ['view', 'create'],
      reports: ['view'],
    };
  }
  if (role === 'technician') {
    return {
      dashboard: ['view'],
      units: ['view'],
      maintenance: ['view', 'create', 'edit'],
      tasks: ['view', 'create', 'edit'],
      expenses: ['view', 'create'],
    };
  }
  if (role === 'receptionist') {
    return {
      dashboard: ['view'],
      properties: ['view'],
      units: ['view'],
      tenants: ['view', 'create', 'edit'],
      tasks: ['view', 'create'],
      documents: ['view', 'create'],
      maintenance: ['view', 'create'],
    };
  }
  if (role === 'owner') {
    return {
      dashboard: ['view'],
      properties: ['view'],
      units: ['view'],
      tenants: ['view'],
      contracts: ['view'],
      payments: ['view'],
      finance: ['view'],
      receipts: ['view'],
      reports: ['view', 'export'],
      documents: ['view'],
      archive: ['view'],
    };
  }
  return { dashboard: ['view'] };
}

export function buildAllDefaultRoleModulePermissions(): Partial<
  Record<RoleKey, Partial<Record<PermissionModuleKey, PermissionLevel[]>>>
> {
  const out: Partial<Record<RoleKey, Partial<Record<PermissionModuleKey, PermissionLevel[]>>>> = {};
  for (const r of ROLE_TEMPLATES) {
    out[r.key] = getDefaultModulePermissionsForRole(r.key);
  }
  return out;
}

function mergeModulePermissions(
  base: Partial<Record<PermissionModuleKey, PermissionLevel[]>>,
  overlay?: Partial<Record<PermissionModuleKey, PermissionLevel[]>>
): Partial<Record<PermissionModuleKey, PermissionLevel[]>> {
  if (!overlay) return { ...base };
  const merged: Partial<Record<PermissionModuleKey, PermissionLevel[]>> = {};
  for (const m of RBAC_MODULES) {
    const key = m.key;
    if (overlay[key] !== undefined) {
      merged[key] = Array.from(new Set(overlay[key] || []));
    } else if (base[key] !== undefined) {
      merged[key] = Array.from(new Set(base[key] || []));
    }
  }
  return merged;
}

export function deriveLegacyPermissionsFromModules(
  modulePerms: Partial<Record<PermissionModuleKey, PermissionLevel[]>>
): PermissionKey[] {
  const set = new Set<PermissionKey>();
  const hasAny = (mod: PermissionModuleKey, actions: PermissionLevel[]) => {
    const list = modulePerms[mod] || [];
    return list.includes('manage') || actions.some((a) => list.includes(a));
  };

  if (hasAny('properties', ['create', 'edit', 'delete_void', 'manage']) || hasAny('units', ['create', 'edit', 'manage'])) {
    set.add('manage_properties');
  }
  if (hasAny('tenants', ['create', 'edit', 'delete_void', 'manage'])) {
    set.add('manage_tenants');
  }
  if (hasAny('contracts', ['create', 'edit', 'approve', 'manage'])) {
    set.add('manage_contracts');
  }
  if (hasAny('payments', ['create', 'edit', 'manage'])) {
    set.add('collect_payments');
  }
  if (hasAny('receipts', ['delete_void', 'approve', 'manage'])) {
    set.add('reverse_receipts');
  }
  if (hasAny('finance', ['create', 'edit', 'approve', 'manage'])) {
    set.add('manage_accounting');
  }
  if (hasAny('expenses', ['create'])) {
    set.add('create_expense');
  }
  if (hasAny('expenses', ['approve'])) {
    set.add('approve_expense_supervisor');
  }
  if (hasAny('expenses', ['manage'])) {
    set.add('approve_expense_manager');
  }
  if (hasAny('maintenance', ['manage', 'approve'])) {
    set.add('manage_maintenance');
  }
  if (hasAny('maintenance', ['create', 'edit'])) {
    set.add('execute_maintenance');
  }
  if (hasAny('tasks', ['create', 'edit', 'approve', 'manage'])) {
    set.add('manage_tasks');
  }
  if (hasAny('documents', ['create', 'edit', 'delete_void', 'manage'])) {
    set.add('manage_documents');
  }
  if (hasAny('team', ['create', 'edit', 'delete_void', 'manage']) || hasAny('settings', ['manage'])) {
    set.add('manage_users');
  }
  if (hasAny('backups', ['create', 'manage', 'approve'])) {
    set.add('backup_restore');
  }
  if (hasAny('audit', ['view', 'export', 'manage'])) {
    set.add('view_audit');
  }
  if (hasAny('reports', ['view']) && hasAny('finance', ['view'])) {
    set.add('view_all');
  }
  return Array.from(set);
}

/**
 * Computes effective 18-module x 7-action permissions for a user.
 * Note: Changing `jobTitle` NEVER grants or modifies any permission.
 */
export function getEffectiveModulePermissions(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined
): Partial<Record<PermissionModuleKey, PermissionLevel[]>> {
  if (!user) return {};

  const customRole: CustomRoleDefinition | undefined = user.customRoleId
    ? state?.customRoles?.find((r) => r.id === user.customRoleId)
    : undefined;

  const baseTemplate = customRole
    ? customRole.modulePermissions
    : state?.roleModulePermissions?.[user.role] || getDefaultModulePermissionsForRole(user.role);

  // Explicit per-user customModulePermissions overrides template module keys where specified
  const effective = mergeModulePermissions(baseTemplate, user.customModulePermissions);

  // Keep legacy permission toggles in sync if no customModulePermissions overrode that module
  const legacyList = customRole
    ? customRole.legacyPermissions
    : state?.rolePermissions?.[user.role] || [];

  const ensureLegacy = (perm: PermissionKey, mod: PermissionModuleKey, actions: PermissionLevel[]) => {
    if (!legacyList.includes(perm)) return;
    if (user.customModulePermissions && user.customModulePermissions[mod] !== undefined) return;
    const cur = new Set(effective[mod] || []);
    for (const a of actions) cur.add(a);
    effective[mod] = Array.from(cur);
  };

  ensureLegacy('manage_properties', 'properties', ['view', 'create', 'edit']);
  ensureLegacy('manage_properties', 'units', ['view', 'create', 'edit']);
  ensureLegacy('manage_tenants', 'tenants', ['view', 'create', 'edit']);
  ensureLegacy('manage_contracts', 'contracts', ['view', 'create', 'edit']);
  ensureLegacy('collect_payments', 'payments', ['view', 'create']);
  ensureLegacy('collect_payments', 'receipts', ['view', 'create']);
  ensureLegacy('reverse_receipts', 'receipts', ['view', 'delete_void']);
  ensureLegacy('manage_accounting', 'finance', ['view', 'create', 'edit']);
  ensureLegacy('create_expense', 'expenses', ['view', 'create']);
  ensureLegacy('approve_expense_supervisor', 'expenses', ['view', 'approve']);
  ensureLegacy('approve_expense_manager', 'expenses', ['view', 'approve', 'manage']);
  ensureLegacy('manage_maintenance', 'maintenance', ['view', 'create', 'edit', 'approve', 'manage']);
  ensureLegacy('execute_maintenance', 'maintenance', ['view', 'edit']);
  ensureLegacy('manage_tasks', 'tasks', ['view', 'create', 'edit']);
  ensureLegacy('manage_documents', 'documents', ['view', 'create', 'edit']);
  ensureLegacy('manage_users', 'team', ['view', 'create', 'edit', 'delete_void', 'manage']);
  ensureLegacy('backup_restore', 'backups', ['view', 'create', 'approve', 'manage']);
  ensureLegacy('view_audit', 'audit', ['view', 'export']);

  return effective;
}

export function userHasModuleAction(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined,
  module: PermissionModuleKey,
  action: PermissionLevel = 'view'
): boolean {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== 'نشط') return false;
  if (user.role === 'sys_owner' && !user.customModulePermissions && !user.customRoleId) {
    return true;
  }
  const effective = getEffectiveModulePermissions(state, user);
  const actions = effective[module] || [];
  if (actions.includes('manage')) return true;
  return actions.includes(action);
}

export function userHasLegacyPermission(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined,
  permission: PermissionKey
): boolean {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== 'نشط') return false;
  if (user.customRoleId) {
    const customRole = state?.customRoles?.find((r) => r.id === user.customRoleId);
    if (customRole) {
      const derived = deriveLegacyPermissionsFromModules(
        getEffectiveModulePermissions(state, user)
      );
      return (
        customRole.legacyPermissions.includes(permission) ||
        derived.includes(permission)
      );
    }
  }
  if (user.customModulePermissions) {
    const derived = deriveLegacyPermissionsFromModules(
      getEffectiveModulePermissions(state, user)
    );
    if (derived.includes(permission)) return true;
  }
  const perms = state?.rolePermissions?.[user.role] || [];
  return perms.includes(permission);
}

export const ALL_PROPERTIES_SCOPE = '*';

export const ROLE_PRIORITY_RANK: Record<RoleKey, number> = {
  owner: 0,
  technician: 1,
  receptionist: 1,
  leasing: 2,
  auditor: 2,
  maint_manager: 3,
  accountant: 3,
  supervisor: 4,
  gm: 5,
  sys_owner: 6,
};

export function isRoleDowngrade(oldRole: RoleKey, newRole: RoleKey): boolean {
  return (ROLE_PRIORITY_RANK[newRole] ?? 0) < (ROLE_PRIORITY_RANK[oldRole] ?? 0);
}

export function isUserAccountActive(user: StaffUser | null | undefined): boolean {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== 'نشط') return false;
  return true;
}

export function canUserAccessCompany(
  state: Pick<AqarDatabaseState, 'companies'> | null | undefined,
  user: StaffUser | null | undefined,
  companyId?: string | null
): boolean {
  if (!isUserAccountActive(user) || !user) return false;
  if (user.role === 'sys_owner') return true;
  if (!user.companyId) return true;
  if (!companyId) return true;
  if ((state?.companies?.length || 0) <= 1 && !companyId) return true;
  return user.companyId === companyId;
}

/**
 * Computes the strict set of accessible property IDs for a user.
 * Security rule:
 * - Inactive/suspended accounts get an empty Set().
 * - `owner` only gets properties where `ownerShares` matches `user.ownerId`.
 * - `sys_owner` gets all workspace properties (`'ALL'`).
 * - `gm` gets company properties if `allowedPropertyIds` is `undefined` or includes `'*'`,
 *   otherwise strictly the explicitly listed IDs filtered by `companyId` (so `[]` => 0 properties).
 * - All non-admin employee roles: MUST explicitly have `'*'` (`ALL_PROPERTIES_SCOPE`) in
 *   `allowedPropertyIds` to access all company properties; `undefined` OR `[]` both yield 0 properties!
 */
export function getUserPropertyScope(
  state: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  user: StaffUser | null | undefined
): 'ALL' | Set<string> {
  if (!isUserAccountActive(user) || !user) return new Set();
  const allProperties = state?.properties || [];

  const withinCompany = (propId: string): boolean => {
    const prop = allProperties.find((p) => p.id === propId);
    if (!prop) return false;
    return canUserAccessCompany(state, user, prop.companyId);
  };

  if (user.role === 'owner') {
    if (!user.ownerId) return new Set();
    const owned = new Set<string>();
    for (const p of allProperties) {
      if (
        Array.isArray(p.ownerShares) &&
        p.ownerShares.some((s) => s.ownerId === user.ownerId) &&
        canUserAccessCompany(state, user, p.companyId)
      ) {
        owned.add(p.id);
      }
    }
    for (const s of state?.ownerShares || []) {
      if (s.ownerId === user.ownerId && withinCompany(s.propertyId)) {
        owned.add(s.propertyId);
      }
    }
    return owned;
  }

  if (user.role === 'sys_owner') {
    return 'ALL';
  }

  const companyRestricted = Boolean(user.companyId && (state?.companies?.length || 0) > 0);
  const rawAllowed = user.allowedPropertyIds;

  if (user.role === 'gm') {
    if (rawAllowed === undefined || (Array.isArray(rawAllowed) && rawAllowed.includes(ALL_PROPERTIES_SCOPE))) {
      if (!companyRestricted) return 'ALL';
      return new Set(allProperties.filter((p) => canUserAccessCompany(state, user, p.companyId)).map((p) => p.id));
    }
    return new Set(rawAllowed.filter((id) => id !== ALL_PROPERTIES_SCOPE && withinCompany(id)));
  }

  // Non-admin employee roles: NEVER treat undefined or [] as "all properties"
  if (!Array.isArray(rawAllowed) || rawAllowed.length === 0) {
    return new Set();
  }

  if (rawAllowed.includes(ALL_PROPERTIES_SCOPE)) {
    if (!companyRestricted) return 'ALL';
    return new Set(allProperties.filter((p) => canUserAccessCompany(state, user, p.companyId)).map((p) => p.id));
  }

  return new Set(rawAllowed.filter((id) => id !== ALL_PROPERTIES_SCOPE && withinCompany(id)));
}

export function getAccessiblePropertyIdsSet(
  state: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  user: StaffUser | null | undefined
): Set<string> {
  const scope = getUserPropertyScope(state, user);
  if (scope === 'ALL') {
    return new Set((state?.properties || []).map((p) => p.id));
  }
  return scope;
}

export function userHasAllPropertiesAccess(
  state: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  user: StaffUser | null | undefined
): boolean {
  if (!isUserAccountActive(user) || !user) return false;
  if (user.role === 'sys_owner') return true;
  if (user.role === 'owner') return false;
  const scope = getUserPropertyScope(state, user);
  if (scope === 'ALL') return true;
  if (user.companyId && Array.isArray(user.allowedPropertyIds) && user.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE)) {
    return true;
  }
  if (user.role === 'gm' && user.allowedPropertyIds === undefined) return true;
  return false;
}

export function canUserAccessProperty(
  state: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  user: StaffUser | null | undefined,
  propertyId?: string | null
): boolean {
  if (!isUserAccountActive(user) || !user || !propertyId) return false;
  const scope = getUserPropertyScope(state, user);
  if (scope === 'ALL') {
    const prop = (state?.properties || []).find((p) => p.id === propertyId);
    if (prop) return canUserAccessCompany(state, user, prop.companyId);
    return true;
  }
  return scope.has(propertyId);
}

export function isPropertyScopeShrink(
  oldState: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  oldUser: StaffUser,
  newState: Pick<AqarDatabaseState, 'properties' | 'ownerShares' | 'companies'> | null | undefined,
  newUser: StaffUser
): boolean {
  const oldScope = getUserPropertyScope(oldState, oldUser);
  const newScope = getUserPropertyScope(newState, newUser);
  if (newScope === 'ALL') return false;
  if (oldScope === 'ALL') {
    const allIds = (oldState?.properties || []).map((p) => p.id);
    if (allIds.length === 0) {
      return !Array.isArray(newUser.allowedPropertyIds) || !newUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE);
    }
    return allIds.some((id) => !newScope.has(id));
  }
  for (const prevId of oldScope) {
    if (!newScope.has(prevId)) return true;
  }
  if (
    Array.isArray(oldUser.allowedPropertyIds) &&
    oldUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE) &&
    (!Array.isArray(newUser.allowedPropertyIds) || !newUser.allowedPropertyIds.includes(ALL_PROPERTIES_SCOPE))
  ) {
    return true;
  }
  return false;
}

export function sanitizeUserForClient(u: StaffUser): StaffUser {
  return {
    id: u.id,
    companyId: u.companyId,
    nameAr: u.nameAr,
    nameEn: u.nameEn,
    username: u.username,
    role: u.role,
    customRoleId: u.customRoleId,
    jobTitle: u.jobTitle,
    department: u.department,
    roleLabelAr: u.roleLabelAr,
    roleLabelEn: u.roleLabelEn,
    email: u.email,
    phone: u.phone,
    approvalLimitSar: u.approvalLimitSar,
    active: u.active,
    accountStatus: u.accountStatus || (u.active ? 'نشط' : 'موقوف'),
    allowedPropertyIds: Array.isArray(u.allowedPropertyIds) ? [...u.allowedPropertyIds] : undefined,
    customModulePermissions: u.customModulePermissions ? { ...u.customModulePermissions } : undefined,
    ownerId: u.ownerId,
    deviceName: u.deviceName,
    lastActiveAt: u.lastActiveAt,
    statusState: u.statusState,
    specialty: u.specialty,
    managerRating: u.managerRating,
    lastActivitySummary: u.lastActivitySummary,
    security: u.security
      ? {
          ...u.security,
          trustedDevices: u.security.trustedDevices ? [...u.security.trustedDevices] : undefined,
        }
      : undefined,
    notificationPrefs: u.notificationPrefs ? { ...u.notificationPrefs } : undefined,
    invitedBy: u.invitedBy,
    invitedAt: u.invitedAt,
    inviteStatus: u.inviteStatus,
    terminatedAt: u.terminatedAt,
    terminationReason: u.terminationReason,
    verifiedEmail: u.verifiedEmail,
    verifiedPhone: u.verifiedPhone,
    online: u.online,
  };
}

export function filterStateForUser(
  state: AqarDatabaseState,
  user: StaffUser | undefined,
  options?: { workspaceId?: string }
): AqarDatabaseState {
  if (!user || !isUserAccountActive(user)) {
    return {
      ...state,
      properties: [],
      units: [],
      tenants: [],
      leads: [],
      leadEscalations: [],
      contracts: [],
      handovers: [],
      installments: [],
      payments: [],
      expenses: [],
      supplierInvoices: [],
      propertyBudgets: [],
      tickets: [],
      tasks: [],
      meterReadings: [],
      documents: [],
      owners: [],
      ownerShares: [],
      ownerTransfers: [],
      purchaseOrders: [],
      decisions: [],
      zatcaInvoices: [],
      communications: [],
      notifications: [],
      auditLogs: [],
      backups: [],
      loginHistory: [],
      employeeInvitations: [],
      users: [],
    };
  }

  const hasAllProps = userHasAllPropertiesAccess(state, user);
  const allowedPropIds = getAccessiblePropertyIdsSet(state, user);
  const canAudit = userHasLegacyPermission(state, user, 'view_audit') || userHasModuleAction(state, user, 'audit', 'view');
  const canBackup = userHasLegacyPermission(state, user, 'backup_restore') || userHasModuleAction(state, user, 'backups', 'view');
  const canTeam = userHasLegacyPermission(state, user, 'manage_users') || userHasModuleAction(state, user, 'team', 'view');

  const properties = (state.properties || []).filter((p) => allowedPropIds.has(p.id));
  const units = (state.units || []).filter((u) => allowedPropIds.has(u.propertyId));
  const unitIds = new Set(units.map((u) => u.id));

  const contracts = (state.contracts || []).filter((c) => allowedPropIds.has(c.propertyId));
  const contractIds = new Set(contracts.map((c) => c.id));

  const handovers = (state.handovers || []).filter((h) => allowedPropIds.has(h.propertyId));
  const handoverIds = new Set(handovers.map((h) => h.id));

  const installments = (state.installments || []).filter((i) => contractIds.has(i.contractId));
  const payments = (state.payments || []).filter((p) => contractIds.has(p.contractId));
  const expenses = (state.expenses || []).filter((e) => allowedPropIds.has(e.propertyId));
  const expenseIds = new Set(expenses.map((e) => e.id));

  const supplierInvoices = (state.supplierInvoices || []).filter((inv) =>
    inv.propertyId ? allowedPropIds.has(inv.propertyId) : hasAllProps
  );
  const propertyBudgets = (state.propertyBudgets || []).filter((b) => allowedPropIds.has(b.propertyId));
  const tickets = (state.tickets || []).filter((t) => allowedPropIds.has(t.propertyId));
  const ticketIds = new Set(tickets.map((t) => t.id));

  const tasks = (state.tasks || []).filter((t) =>
    t.propertyId ? allowedPropIds.has(t.propertyId) : hasAllProps || t.assignedTo === user.id
  );
  const leads = (state.leads || []).filter((l) =>
    l.propertyId ? allowedPropIds.has(l.propertyId) : hasAllProps || l.assignedTo === user.id
  );
  const leadIds = new Set(leads.map((l) => l.id));
  const leadEscalations = (state.leadEscalations || []).filter((e) => leadIds.has(e.leadId));
  const meterReadings = (state.meterReadings || []).filter((m) => allowedPropIds.has(m.propertyId));

  // Build index of which properties every tenant belongs to (via contracts, units, leads)
  const tenantAllLinkedPropIds = new Map<string, Set<string>>();
  const addTenantLink = (tenantId: string | undefined, propertyId: string | undefined) => {
    if (!tenantId || !propertyId) return;
    let set = tenantAllLinkedPropIds.get(tenantId);
    if (!set) {
      set = new Set<string>();
      tenantAllLinkedPropIds.set(tenantId, set);
    }
    set.add(propertyId);
  };
  for (const c of state.contracts || []) addTenantLink(c.tenantId, c.propertyId);
  for (const u of state.units || []) {
    const linkedTid = u.currentTenantId || (u as { linkedTenantId?: string }).linkedTenantId;
    if (linkedTid) addTenantLink(linkedTid, u.propertyId);
  }
  for (const l of state.leads || []) {
    const linkedTid = l.convertedToTenantId || l.convertedTenantId;
    if (linkedTid && l.propertyId) addTenantLink(linkedTid, l.propertyId);
  }

  const tenants = (state.tenants || []).filter((t) => {
    if (user.role === 'owner') {
      return contracts.some((c) => c.tenantId === t.id);
    }
    const linkedProps = tenantAllLinkedPropIds.get(t.id);
    if (linkedProps && linkedProps.size > 0) {
      for (const pid of linkedProps) {
        if (allowedPropIds.has(pid)) return true;
      }
      return false;
    }
    // Unlinked orphan/new tenant: visible ONLY to users with >=1 accessible property or global scope
    if (hasAllProps) {
      return canUserAccessCompany(state, user, (t as any).companyId);
    }
    return allowedPropIds.size > 0;
  });
  const tenantIds = new Set(tenants.map((t) => t.id));

  const ownerShares =
    user.role === 'owner'
      ? (state.ownerShares || []).filter((s) => s.ownerId === user.ownerId && allowedPropIds.has(s.propertyId))
      : (state.ownerShares || []).filter((s) => allowedPropIds.has(s.propertyId));
  const visibleOwnerIds = new Set<string>(ownerShares.map((s) => s.ownerId));
  for (const p of properties) {
    for (const s of p.ownerShares || []) {
      if (user.role !== 'owner' || s.ownerId === user.ownerId) {
        visibleOwnerIds.add(s.ownerId);
      }
    }
  }
  const owners =
    user.role === 'owner'
      ? (state.owners || []).filter((o) => o.id === user.ownerId)
      : (state.owners || []).filter((o) => visibleOwnerIds.has(o.id) || hasAllProps);
  const allowedOwnerIds = new Set(owners.map((o) => o.id));
  const ownerTransfers = (state.ownerTransfers || []).filter((tr) => allowedOwnerIds.has(tr.ownerId));

  const purchaseOrders = (state.purchaseOrders || []).filter((po) =>
    po.propertyId ? allowedPropIds.has(po.propertyId) : hasAllProps
  );
  const decisions = (state.decisions || []).filter((d) =>
    d.propertyId ? allowedPropIds.has(d.propertyId) : hasAllProps
  );
  const zatcaInvoices = (state.zatcaInvoices || []).filter((z) => {
    if (z.contractId) return contractIds.has(z.contractId);
    if (z.propertyId) return allowedPropIds.has(z.propertyId);
    return hasAllProps;
  });
  const communications = (state.communications || []).filter((c) =>
    c.tenantId ? tenantIds.has(c.tenantId) : hasAllProps
  );

  const documents = (state.documents || []).filter((doc) => {
    if (doc.propertyId) return allowedPropIds.has(doc.propertyId);
    const relType = doc.relatedEntityType || (doc as any).relatedType;
    const relId = doc.relatedEntityId || (doc as any).relatedId;
    if ((relType === 'Property' || relType === 'عقار') && relId) return allowedPropIds.has(relId);
    if ((relType === 'Unit' || relType === 'وحدة') && relId) return unitIds.has(relId);
    if ((relType === 'Contract' || relType === 'عقد') && relId) return contractIds.has(relId);
    if ((relType === 'Tenant' || relType === 'مستأجر') && relId) return tenantIds.has(relId);
    if (relType === 'Ticket' && relId) return ticketIds.has(relId);
    if (relType === 'Expense' && relId) return expenseIds.has(relId);
    if (relType === 'Handover' && relId) return handoverIds.has(relId);
    if (relType === 'Owner' && relId) return allowedOwnerIds.has(relId);
    if (relType === 'شركة') return hasAllProps;
    return hasAllProps;
  });

  const companies =
    user.role === 'sys_owner' || !user.companyId
      ? state.companies || []
      : (state.companies || []).filter((c) => c.id === user.companyId);

  const notifications = (state.notifications || []).filter((n) => {
    if (!n.targetRoles.includes(user.role) && user.role !== 'sys_owner') return false;
    if (n.propertyId) return allowedPropIds.has(n.propertyId);
    return true;
  });

  const sanitizedUsers = (state.users || [])
    .filter((u) => {
      if (user.role === 'owner') return u.id === user.id;
      if (user.role === 'sys_owner') return true;
      if (user.companyId && u.companyId && user.companyId !== u.companyId) return false;
      return true;
    })
    .map((u) => {
      if (u.id === user.id || canTeam || canAudit) {
        return sanitizeUserForClient(u);
      }
      // Minimal directory record for non-managers (no PII, credentials, or permission configs)
      return {
        id: u.id,
        companyId: u.companyId,
        nameAr: u.nameAr,
        nameEn: u.nameEn,
        role: u.role,
        jobTitle: u.jobTitle,
        department: u.department,
        roleLabelAr: u.roleLabelAr,
        roleLabelEn: u.roleLabelEn,
        email: '',
        phone: '',
        approvalLimitSar: 0,
        active: u.active,
        accountStatus: u.accountStatus || (u.active ? 'نشط' : 'موقوف'),
        lastActiveAt: u.lastActiveAt,
        statusState: u.statusState,
        specialty: u.specialty,
        online: u.online,
      } as StaffUser;
    });

  return {
    ...state,
    meta: {
      ...state.meta,
      ...(options?.workspaceId ? { workspaceId: options.workspaceId } : {}),
    },
    companies,
    properties,
    units,
    tenants,
    leads,
    leadEscalations,
    contracts,
    handovers,
    installments,
    payments,
    expenses,
    supplierInvoices,
    propertyBudgets,
    tickets,
    tasks,
    meterReadings,
    documents,
    owners,
    ownerShares,
    ownerTransfers,
    purchaseOrders,
    decisions,
    zatcaInvoices,
    communications,
    notifications,
    auditLogs: canAudit ? state.auditLogs : [],
    backups: canBackup ? state.backups : [],
    loginHistory: canAudit || canTeam ? state.loginHistory || [] : [],
    employeeInvitations: canTeam ? state.employeeInvitations || [] : [],
    users: sanitizedUsers,
  };
}

export function getNavRequiredModules(nav: string): PermissionModuleKey[] {
  switch (nav) {
    case 'dashboard':
      return ['dashboard'];
    case 'daily_hub':
      return ['tasks', 'dashboard'];
    case 'properties':
      return ['properties', 'units'];
    case 'leasing_finance':
    case 'leasing':
    case 'finance':
    case 'accounting':
      return ['contracts', 'payments', 'finance', 'receipts', 'expenses'];
    case 'tenants':
      return ['tenants'];
    case 'maintenance':
      return ['maintenance', 'tasks'];
    case 'reports':
    case 'admin':
      return ['reports', 'audit'];
    case 'team':
      return ['team'];
    case 'documents':
      return ['documents'];
    case 'archive':
      return ['archive'];
    case 'templates':
      return ['tenants', 'contracts', 'settings'];
    case 'settings':
      return ['settings', 'backups'];
    case 'about':
    case 'profile':
      return ['dashboard'];
    default:
      return ['dashboard'];
  }
}

export function userCanAccessNav(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined,
  nav: string
): boolean {
  if (!user || !user.active) return false;
  if (user.accountStatus && user.accountStatus !== 'نشط') return false;
  if (nav === 'profile' || nav === 'about' || nav === 'dashboard') return true;
  if (user.role === 'owner') {
    const ownerAllowed = new Set(['dashboard', 'properties', 'leasing_finance', 'tenants', 'reports', 'documents', 'archive', 'profile', 'about']);
    return ownerAllowed.has(nav);
  }
  const modules = getNavRequiredModules(nav);
  return modules.some((m) => userHasModuleAction(state, user, m, 'view'));
}

export function getRecommendedLandingNav(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined
): { nav: string; leasingFinanceTab?: 'leasing' | 'finance' | 'accounting' } {
  if (!user || !user.active || (user.accountStatus && user.accountStatus !== 'نشط')) {
    return { nav: 'dashboard' };
  }
  if (user.role === 'accountant' && userCanAccessNav(state, user, 'leasing_finance')) {
    return { nav: 'leasing_finance', leasingFinanceTab: 'finance' };
  }
  if ((user.role === 'maint_manager' || user.role === 'technician') && userCanAccessNav(state, user, 'maintenance')) {
    return { nav: 'maintenance' };
  }
  if (user.role === 'leasing' && userCanAccessNav(state, user, 'tenants')) {
    return { nav: 'tenants' };
  }
  if (user.role === 'supervisor' && userCanAccessNav(state, user, 'properties')) {
    return { nav: 'properties' };
  }
  if (user.role === 'receptionist' && userCanAccessNav(state, user, 'daily_hub')) {
    return { nav: 'daily_hub' };
  }
  return { nav: 'dashboard' };
}

export function getAllowedNavsForUser(
  state: Pick<AqarDatabaseState, 'roleModulePermissions' | 'customRoles' | 'rolePermissions'> | null | undefined,
  user: StaffUser | null | undefined
): string[] {
  const allNavs = [
    'dashboard',
    'daily_hub',
    'properties',
    'leasing_finance',
    'tenants',
    'maintenance',
    'reports',
    'team',
    'documents',
    'archive',
    'templates',
    'settings',
    'profile',
    'about',
  ];
  return allNavs.filter((n) => userCanAccessNav(state, user, n));
}
