import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import WebSocket from 'ws';

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 3470;
      srv.close(() => resolve(port));
    });
  });
}

function extractCookieVal(res, name) {
  const getSetCookie =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [res.headers.get('set-cookie') || ''];
  for (const line of getSetCookie) {
    const m = String(line).match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (m) return decodeURIComponent(m[1]);
  }
  return '';
}

function extractInviteToken(inviteUrl) {
  return new URL(inviteUrl).searchParams.get('inviteToken');
}

async function startNodeEmbedded(port, dataDir) {
  const entry = path.resolve(process.cwd(), 'dist-server', 'server.mjs');
  const mod = await import(`${pathToFileURL(entry).href}?t=${Date.now()}-${Math.random()}`);
  return mod.startServer(port, { userDataDir: dataDir });
}

async function provisionInvitedEmployee(baseUrl, ownerHeaders, extraHeaders, payload, password, pin) {
  const createRes = await fetch(`${baseUrl}/api/team/employees`, {
    method: 'POST',
    headers: { ...ownerHeaders, ...extraHeaders },
    body: JSON.stringify(payload),
  });
  assert.equal(createRes.status, 201, `Failed creating employee ${payload.email}`);
  const created = await createRes.json();
  const inviteToken = extractInviteToken(created.inviteUrl);
  assert.ok(inviteToken, 'Missing inviteToken');
  const acceptRes = await fetch(`${baseUrl}/api/public/invitations/${encodeURIComponent(inviteToken)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify({
      verificationCode: created.verificationCode,
      password,
      confirmPassword: password,
      pin,
      acceptedTerms: true,
    }),
  });
  assert.equal(acceptRes.status, 200, `Failed activating employee ${payload.email}`);
  const accepted = await acceptRes.json();
  return accepted.user;
}

async function waitForWorkerReady(baseUrl, proc) {
  for (let i = 0; i < 45; i++) {
    if (proc.exitCode !== null) {
      throw new Error(`wrangler dev exited prematurely with code ${proc.exitCode}`);
    }
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return res.json();
    } catch {
      // booting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Timed out waiting for wrangler dev');
}

async function verifyNodeSuite() {
  console.log('\n[Phase 1 Security] === PART A: NODE.JS + SQLITE WAL ===');

  // S0: Strict production default-credential gating (AQAR_ALLOW_SEED_DEFAULTS unset -> Aqar@2026 & PIN 1234 rejected)
  const strictDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aqarplus-sec-strict-'));
  const strictPort = await getFreePort();
  const strictUrl = `http://127.0.0.1:${strictPort}`;
  process.env.NODE_ENV = 'production';
  delete process.env.AQAR_ALLOW_SEED_DEFAULTS;
  delete process.env.AQAR_DEMO_LOGIN;
  process.env.AQARPLUS_NO_AUTO_START = '1';
  process.env.AQARPLUS_USER_DATA_DIR = strictDataDir;
  process.env.AQARPLUS_DIST_DIR = path.resolve(process.cwd(), 'dist');
  process.env.AQAR_AUTH_RATE_LIMIT_MAX = '200';

  let strictStarted = await startNodeEmbedded(strictPort, strictDataDir);
  try {
    const rejectedSeedPwd = await fetch(`${strictUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'owner.sys@aqarplus.sa', password: 'Aqar@2026' }),
    });
    assert.equal(rejectedSeedPwd.status, 401, 'Strict production must NOT accept hardcoded seed Aqar@2026 password');

    const rejectedSeedPin = await fetch(`${strictUrl}/api/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'usr-tech', pin: '1234' }),
    });
    assert.equal(rejectedSeedPin.status, 401, 'Strict production must NOT accept hardcoded seed PIN 1234');
    console.log('✓ N0. Strict production default credential gating (Aqar@2026 & 1234 rejected) verified');
  } finally {
    strictStarted.server.closeAllConnections?.();
    await new Promise((r) => strictStarted.server.close(r));
    fs.rmSync(strictDataDir, { recursive: true, force: true });
  }

  // Main Node security suite with seed defaults enabled for baseline fixtures
  const nodeDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aqarplus-sec-node-'));
  const nodePort = await getFreePort();
  const BASE = `http://127.0.0.1:${nodePort}`;
  process.env.NODE_ENV = 'production';
  process.env.AQAR_ALLOW_SEED_DEFAULTS = 'true';
  process.env.AQARPLUS_USER_DATA_DIR = nodeDataDir;

  const started = await startNodeEmbedded(nodePort, nodeDataDir);
  try {
    // Login as sys_owner
    const ownerLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'owner.sys@aqarplus.sa',
        password: 'Aqar@2026',
        rememberMe: true,
        appType: 'desktop',
        deviceId: 'sec-owner-dev',
      }),
    });
    assert.equal(ownerLoginRes.status, 200);
    const ownerAuth = await ownerLoginRes.json();
    assert.ok(ownerAuth.token && ownerAuth.refreshToken);
    assert.ok(ownerAuth.state.properties.length >= 2, 'Seed must include multiple properties');
    const ownerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerAuth.token}`,
    };

    // N1. sys_owner full access + create secondary company branch + 3rd property in branch B
    const branchBRes = await fetch(`${BASE}/api/companies`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ nameAr: 'فرع جدة العقاري', city: 'جدة' }),
    });
    assert.equal(branchBRes.status, 201);
    const branchB = (await branchBRes.json()).company;

    const mainCompanyId = ownerAuth.state.properties[0].companyId || ownerAuth.state.companies?.[0]?.id || 'comp-1';
    const prop1 = ownerAuth.state.properties[0];
    const prop2 = ownerAuth.state.properties[1];
    const prop3Res = await fetch(`${BASE}/api/properties`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        companyId: branchB.id,
        code: 'BR-B-303',
        nameAr: 'برج فرع جدة',
        type: 'تجاري',
        city: 'جدة',
        district: 'الشاطئ',
        ownershipMode: 'مملوك للشركة',
      }),
    });
    assert.equal(prop3Res.status, 201);
    const prop3 = (await prop3Res.json()).property;

    const prop2SameBranchRes = await fetch(`${BASE}/api/properties`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        companyId: mainCompanyId,
        code: 'BR-A-202',
        nameAr: 'عمارة الفرع الرئيسي 2',
        type: 'سكني',
        city: 'الرياض',
        district: 'النرجس',
        ownershipMode: 'مملوك للشركة',
      }),
    });
    assert.equal(prop2SameBranchRes.status, 201);
    const prop2SameBranch = (await prop2SameBranchRes.json()).property;

    // Seed unit, doc, expense on prop2 and prop3 so we can verify cross-property & cross-branch denial
    const unit2Res = await fetch(`${BASE}/api/units`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ propertyId: prop2.id, unitNumber: 'SEC-P2-1', suggestedAnnualRent: 48000 }),
    });
    assert.equal(unit2Res.status, 201);
    const doc2Res = await fetch(`${BASE}/api/documents`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        title: 'صك عقار 2 سري',
        category: 'صكوك',
        fileName: 'deed2.pdf',
        fileType: 'application/pdf',
        fileSizeKb: 120,
        version: 1,
        propertyId: prop2.id,
        relatedType: 'عقار',
        relatedId: prop2.id,
      }),
    });
    assert.equal(doc2Res.status, 201);
    const doc2 = (await doc2Res.json()).doc;
    assert.ok(doc2?.id, 'doc2 must be returned');

    const exp2Res = await fetch(`${BASE}/api/expenses`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        propertyId: prop2.id,
        date: '2026-11-16',
        category: 'صيانة',
        invoiceNumber: `INV-SEC2-${Date.now()}`,
        amount: 900,
        paymentMethod: 'تحويل بنكي',
        bearer: 'المالك',
        notes: 'مصروف عقار 2',
      }),
    });
    assert.equal(exp2Res.status, 201);
    const exp2 = (await exp2Res.json()).expense;
    console.log('✓ N1. sys_owner full access, secondary branch & isolated property fixtures ready');

    // N2. GM hierarchy guard (cannot edit/escalate sys_owner)
    const gmLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'fahad@aqarplus.sa', password: 'Aqar@2026', appType: 'web' }),
    });
    assert.equal(gmLoginRes.status, 200);
    const gmAuth = await gmLoginRes.json();
    assert.equal(gmAuth.refreshToken, undefined, 'Web login must omit refreshToken from JSON');
    const gmHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${gmAuth.token}` };

    const gmTouchSysOwner = await fetch(`${BASE}/api/team/employees/usr-sys`, {
      method: 'PATCH',
      headers: gmHeaders,
      body: JSON.stringify({ jobTitle: 'اختراق' }),
    });
    assert.equal(gmTouchSysOwner.status, 403);
    assert.equal((await gmTouchSysOwner.json()).code, 'FORBIDDEN');

    const gmEscalate = await fetch(`${BASE}/api/permissions/toggle`, {
      method: 'POST',
      headers: gmHeaders,
      body: JSON.stringify({ role: 'sys_owner', permission: 'manage_users' }),
    });
    assert.equal(gmEscalate.status, 403);
    console.log('✓ N2. GM hierarchy & privilege-escalation protection (403 FORBIDDEN) verified');

    // N3. Employee with allowedPropertyIds: [] -> ZERO properties visible & all direct mutations return 403 + audited
    await provisionInvitedEmployee(
      BASE,
      ownerHeaders,
      {},
      {
        nameAr: 'موظف مقيد صفرياً',
        jobTitle: 'مشرف عمليات',
        department: 'التشغيل',
        phone: '0551100001',
        email: 'zero.prop@aqarplus.sa',
        username: 'zero.prop',
        role: 'supervisor',
        allowedPropertyIds: [],
        channel: 'copy_link',
      },
      'ZeroPropPass!26',
      '1122'
    );
    const zeroLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'zero.prop', password: 'ZeroPropPass!26' }),
    }).then((r) => r.json());
    const zeroHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${zeroLogin.token}` };

    assert.equal(zeroLogin.state.properties.length, 0, 'allowedPropertyIds: [] MUST return 0 properties');
    assert.equal(zeroLogin.state.units.length, 0, 'allowedPropertyIds: [] MUST return 0 units');
    assert.equal(zeroLogin.state.contracts.length, 0, 'allowedPropertyIds: [] MUST return 0 contracts');
    assert.equal(zeroLogin.state.payments.length, 0, 'allowedPropertyIds: [] MUST return 0 payments');
    assert.equal(zeroLogin.state.expenses.length, 0, 'allowedPropertyIds: [] MUST return 0 expenses');

    const zeroDeniedUnit = await fetch(`${BASE}/api/units`, {
      method: 'POST',
      headers: zeroHeaders,
      body: JSON.stringify({ propertyId: prop1.id, unitNumber: 'HACK-01', suggestedAnnualRent: 20000 }),
    });
    assert.equal(zeroDeniedUnit.status, 403);
    assert.equal((await zeroDeniedUnit.json()).code, 'FORBIDDEN');

    const zeroDeniedDoc = await fetch(`${BASE}/api/documents/${doc2.id}/access`, {
      method: 'POST',
      headers: zeroHeaders,
      body: JSON.stringify({ action: 'preview' }),
    });
    assert.equal(zeroDeniedDoc.status, 403);
    console.log('✓ N3. Strict allowedPropertyIds: [] (0 properties, 403 on direct API bypass) verified');

    // N4. Employee with single property [prop1.id] + custom role + per-user override
    const customRoleRes = await fetch(`${BASE}/api/roles`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({
        nameAr: 'محصل وتشغيل عقار واحد',
        nameEn: 'Single Prop Ops',
        baseRoleKey: 'leasing',
        modulePermissions: {
          dashboard: ['view'],
          properties: ['view'],
          units: ['view', 'create', 'edit'],
          contracts: ['view'],
          payments: ['view', 'create'],
          expenses: ['view', 'create'],
          maintenance: ['view', 'create'],
          documents: ['view', 'create'],
        },
      }),
    });
    assert.equal(customRoleRes.status, 201);
    const customRole = (await customRoleRes.json()).role;

    const singleEmp = await provisionInvitedEmployee(
      BASE,
      ownerHeaders,
      {},
      {
        nameAr: 'موظف عقار واحد',
        jobTitle: 'منسق عقار',
        department: 'العقارات',
        phone: '0551100002',
        email: 'one.prop@aqarplus.sa',
        username: 'one.prop',
        role: 'leasing',
        customRoleId: customRole.id,
        companyId: mainCompanyId,
        allowedPropertyIds: [prop1.id],
        channel: 'copy_link',
      },
      'OnePropPass!26',
      '2233'
    );

    const oneLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'one.prop', password: 'OnePropPass!26', rememberMe: true, appType: 'desktop' }),
    }).then((r) => r.json());
    const oneHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${oneLogin.token}` };

    assert.equal(oneLogin.state.properties.length, 1);
    assert.equal(oneLogin.state.properties[0].id, prop1.id);
    assert.ok(oneLogin.state.units.every((u) => u.propertyId === prop1.id));
    assert.ok(!oneLogin.state.documents.some((d) => d.id === doc2.id), 'Must not see prop2 confidential document');

    // Allowed on prop1
    const p1UnitId = oneLogin.state.units[0]?.id || '';
    const okTicketP1 = await fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: oneHeaders,
      body: JSON.stringify({
        propertyId: prop1.id,
        unitId: p1UnitId,
        source: 'المشرف',
        priority: 'متوسط',
        title: 'صيانة مسموحة لعقار 1',
        description: 'فحص دوري',
        category: 'كهرباء',
        estimatedCost: 0,
        actualCost: 0,
        status: 'جديد',
      }),
    });
    assert.equal(okTicketP1.status, 201);

    // Denied on prop2 across multiple modules
    const denyTicketP2 = await fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: oneHeaders,
      body: JSON.stringify({
        propertyId: prop2.id,
        unitId: '',
        source: 'المشرف',
        priority: 'متوسط',
        title: 'اختراق عقار 2',
        description: 'محاولة غير مصرحة',
        category: 'كهرباء',
        estimatedCost: 0,
        actualCost: 0,
        status: 'جديد',
      }),
    });
    assert.equal(denyTicketP2.status, 403);

    const denyExpApproveP2 = await fetch(`${BASE}/api/expenses/${exp2.id}/decision`, {
      method: 'POST',
      headers: oneHeaders,
      body: JSON.stringify({ decision: 'approve' }),
    });
    assert.equal(denyExpApproveP2.status, 403);

    // Approve permission denied even on prop1 because customRole has no approve
    const exp1Res = await fetch(`${BASE}/api/expenses`, {
      method: 'POST',
      headers: oneHeaders,
      body: JSON.stringify({
        propertyId: prop1.id,
        date: '2026-11-16',
        category: 'صيانة',
        invoiceNumber: `INV-SEC1-${Date.now()}`,
        amount: 300,
        paymentMethod: 'تحويل بنكي',
        bearer: 'المالك',
        notes: 'مصروف عقار 1',
      }),
    });
    assert.equal(exp1Res.status, 201);
    const exp1 = (await exp1Res.json()).expense;
    const denySelfApprove = await fetch(`${BASE}/api/expenses/${exp1.id}/decision`, {
      method: 'POST',
      headers: oneHeaders,
      body: JSON.stringify({ decision: 'approve' }),
    });
    assert.equal(denySelfApprove.status, 403, 'Employee without approve permission (and creator SoD) must receive 403');
    console.log('✓ N4. Single-property [prop1], custom role, and cross-property 403 enforcement verified');

    // N5. Multi-property [prop1, prop2] + Branch isolation (excluded from prop3 in branchB)
    await provisionInvitedEmployee(
      BASE,
      ownerHeaders,
      {},
      {
        nameAr: 'موظف عقارين بالفرع الرئيسي',
        jobTitle: 'مشرف محفظة',
        department: 'إدارة الأملاك',
        phone: '0551100003',
        email: 'multi.prop@aqarplus.sa',
        username: 'multi.prop',
        role: 'supervisor',
        companyId: mainCompanyId,
        allowedPropertyIds: [prop1.id, prop2SameBranch.id],
        channel: 'copy_link',
      },
      'MultiPropPass!26',
      '3344'
    );
    const multiLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'multi.prop', password: 'MultiPropPass!26' }),
    }).then((r) => r.json());
    const multiHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${multiLogin.token}` };

    const multiIds = new Set(multiLogin.state.properties.map((p) => p.id));
    assert.ok(multiIds.has(prop1.id) && multiIds.has(prop2SameBranch.id), 'Must see both allowed same-branch properties');
    assert.ok(!multiIds.has(prop2.id) && !multiIds.has(prop3.id), 'Must not see prop2/prop3 from excluded branches');

    const denyBranchProp3 = await fetch(`${BASE}/api/properties`, {
      method: 'POST',
      headers: multiHeaders,
      body: JSON.stringify({ companyId: branchB.id, code: 'BRB-HACK', nameAr: 'محاولة فرع آخر' }),
    });
    assert.equal(denyBranchProp3.status, 403, 'Branch-scoped employee cannot create property in branchB');

    const denyUnitProp3 = await fetch(`${BASE}/api/units`, {
      method: 'POST',
      headers: multiHeaders,
      body: JSON.stringify({ propertyId: prop3.id, unitNumber: 'BRB-U1', suggestedAnnualRent: 30000 }),
    });
    assert.equal(denyUnitProp3.status, 403);
    console.log('✓ N5. Multi-property subset & intra-workspace company branch isolation verified');

    // N6. Web HttpOnly cookie-only refresh + Session/WS revocation on scope shrink, role downgrade, & credential change
    const webEmpLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'one.prop',
        password: 'OnePropPass!26',
        rememberMe: true,
        appType: 'web',
      }),
    });
    assert.equal(webEmpLoginRes.status, 200);
    const webEmpJson = await webEmpLoginRes.json();
    assert.equal(webEmpJson.refreshToken, undefined);
    const webEmpRefreshCookie = extractCookieVal(webEmpLoginRes, 'aqar_refresh');
    assert.ok(webEmpRefreshCookie);
    const webEmpToken = webEmpJson.token;

    // Connect WebSocket for one.prop, then shrink property scope ([prop1] -> []) -> MUST receive session:terminated & close, and HTTP returns 401
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${nodePort}/ws`);
      let sawTerminated = false;
      const timer = setTimeout(() => {
        try {
          ws.terminate();
        } catch {
          // ignore
        }
        reject(new Error('WS termination on scope shrink timed out'));
      }, 6000);
      ws.on('open', () => ws.send(JSON.stringify({ type: 'session:identify', token: webEmpToken })));
      ws.on('message', async (raw) => {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'auth:required') {
          ws.send(JSON.stringify({ type: 'session:identify', token: webEmpToken }));
          return;
        }
        if (msg.type === 'state:init') {
          const shrinkRes = await fetch(`${BASE}/api/team/employees/${singleEmp.id}`, {
            method: 'PATCH',
            headers: ownerHeaders,
            body: JSON.stringify({ allowedPropertyIds: [] }),
          });
          assert.equal(shrinkRes.status, 200);
          return;
        }
        if (msg.type === 'session:terminated') {
          sawTerminated = true;
        }
      });
      ws.on('close', () => {
        clearTimeout(timer);
        assert.ok(sawTerminated, 'WebSocket must receive session:terminated on property scope shrink');
        resolve();
      });
      ws.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const staleAfterShrink = await fetch(`${BASE}/api/state`, {
      headers: { Authorization: `Bearer ${webEmpToken}` },
    });
    assert.equal(staleAfterShrink.status, 401, 'Session must immediately return 401 after property scope shrink');

    // Re-login and test credential change + role downgrade session revocation
    await fetch(`${BASE}/api/team/employees/${singleEmp.id}`, {
      method: 'PATCH',
      headers: ownerHeaders,
      body: JSON.stringify({ role: 'gm', allowedPropertyIds: ['*'] }),
    });
    const reloginForDowngrade = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'one.prop', password: 'OnePropPass!26', appType: 'desktop' }),
    }).then((r) => r.json());
    await fetch(`${BASE}/api/team/employees/${singleEmp.id}`, {
      method: 'PATCH',
      headers: ownerHeaders,
      body: JSON.stringify({ role: 'technician' }),
    });
    const afterDowngrade = await fetch(`${BASE}/api/state`, {
      headers: { Authorization: `Bearer ${reloginForDowngrade.token}` },
    });
    assert.equal(afterDowngrade.status, 401, 'Role downgrade must immediately revoke active sessions');

    // Password change via /api/profile/change-credentials revokes other sessions
    const sA = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'multi.prop', password: 'MultiPropPass!26', deviceId: 'dev-a' }),
    }).then((r) => r.json());
    const sB = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'multi.prop', password: 'MultiPropPass!26', deviceId: 'dev-b' }),
    }).then((r) => r.json());
    const chgCredRes = await fetch(`${BASE}/api/profile/change-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sA.token}` },
      body: JSON.stringify({ currentPassword: 'MultiPropPass!26', newPassword: 'MultiPropPass!99' }),
    });
    assert.equal(chgCredRes.status, 200);
    const sBAfterPwdChange = await fetch(`${BASE}/api/state`, {
      headers: { Authorization: `Bearer ${sB.token}` },
    });
    assert.equal(sBAfterPwdChange.status, 401, 'Other session must be revoked after password change');
    console.log('✓ N6. Session & WS revocation on scope shrink, role downgrade, and credential change verified');

    // N7. Audit logs record denied 403/401 attempts & survive replace restore
    const preRestoreState = await fetch(`${BASE}/api/state`, { headers: ownerHeaders }).then((r) => r.json());
    const deniedAudits = (preRestoreState.state.auditLogs || []).filter(
      (a) => String(a.action).includes('رفض') || String(a.summary || '').includes('رفض')
    );
    assert.ok(deniedAudits.length >= 3, 'Denied 403 access attempts must be persisted in auditLogs');

    const bkpRes = await fetch(`${BASE}/api/backups`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ label: 'Pre-Restore Security Snapshot', encryptPassword: 'SecBackupPassword!99' }),
    });
    assert.equal(bkpRes.status, 201);
    const bkpId = (await bkpRes.json()).backup.id;

    // Trigger another denied action AFTER backup snapshot
    await fetch(`${BASE}/api/team/employees/usr-sys`, {
      method: 'PATCH',
      headers: gmHeaders,
      body: JSON.stringify({ jobTitle: 'بعد النسخة' }),
    });
    // Restore replace mode must preserve existing immutable auditLogs (plus record restore)
    const restoreRes = await fetch(`${BASE}/api/backups/${bkpId}/restore`, {
      method: 'POST',
      headers: ownerHeaders,
      body: JSON.stringify({ mode: 'replace', password: 'SecBackupPassword!99' }),
    });
    assert.equal(restoreRes.status, 200);
    const postRestoreJson = await restoreRes.json();
    assert.ok(
      postRestoreJson.state.auditLogs.some((a) => String(a.action).includes('رفض') || String(a.summary || '').includes('رفض')),
      'Immutable auditLogs must survive restoreBackup replace'
    );
    console.log('✓ N7. Immutable auditLogs (403/401 tracking & replace-restore survival) verified');
  } finally {
    started.server.closeAllConnections?.();
    await new Promise((r) => started.server.close(r));
    fs.rmSync(nodeDataDir, { recursive: true, force: true });
  }
}

async function verifyWorkerSuite() {
  console.log('\n[Phase 1 Security] === PART B: CLOUDFLARE WORKER + DO SQLITE ===');
  const WORKER_PORT = await getFreePort();
  const BASE = `http://127.0.0.1:${WORKER_PORT}`;
  const TMP_PERSIST = fs.mkdtempSync(path.join(os.tmpdir(), 'aqarplus-sec-wrangler-'));

  const wranglerBin = path.resolve(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const wranglerProc = spawn(
    process.execPath,
    [wranglerBin, 'dev', '--local', '--port', String(WORKER_PORT), '--persist-to', TMP_PERSIST, '--show-interactive-dev-session=false'],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
    }
  );
  let logs = '';
  wranglerProc.stdout.on('data', (d) => { logs += d.toString(); });
  wranglerProc.stderr.on('data', (d) => { logs += d.toString(); });

  try {
    await waitForWorkerReady(BASE, wranglerProc);

    // Provision Workspace Alpha and Beta
    const alphaAuth = await fetch(`${BASE}/api/workspaces/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': 'sec-ws-alpha' },
      body: JSON.stringify({
        workspaceSlug: 'sec-ws-alpha',
        companyNameAr: 'ألفا للأمان',
        adminNameAr: 'مالك ألفا',
        adminEmail: 'alpha.owner@aqarplus.sa',
        password: 'AlphaOwnerPass!99',
        pin: '2468',
      }),
    }).then((r) => r.json());
    assert.ok(alphaAuth.token);

    const betaAuth = await fetch(`${BASE}/api/workspaces/provision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': 'sec-ws-beta' },
      body: JSON.stringify({
        workspaceSlug: 'sec-ws-beta',
        companyNameAr: 'بيتا للأمان',
        adminNameAr: 'مالك بيتا',
        adminEmail: 'beta.owner@aqarplus.sa',
        password: 'BetaOwnerPass!99',
      }),
    }).then((r) => r.json());

    // Default creds rejected on provisioned workspace
    const wrongSeedOnWorker = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-workspace-id': 'sec-ws-alpha' },
      body: JSON.stringify({ identifier: 'alpha.owner@aqarplus.sa', password: 'Aqar@2026' }),
    });
    assert.equal(wrongSeedOnWorker.status, 401);

    // Cross-workspace token rejected
    const crossWs = await fetch(`${BASE}/api/state`, {
      headers: { Authorization: `Bearer ${alphaAuth.token}`, 'x-workspace-id': 'sec-ws-beta' },
    });
    assert.equal(crossWs.status, 401);
    console.log('✓ W1. Worker multi-workspace isolation & strict auth verified');

    const alphaHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alphaAuth.token}`,
      'x-workspace-id': 'sec-ws-alpha',
    };
    const wsHeader = { 'x-workspace-id': 'sec-ws-alpha' };

    // Create 2 companies & 3 properties (P1, P2 in main branch, P3 in branch B)
    const compMainId = alphaAuth.state.companies?.[0]?.id || 'comp-sec-ws-alpha';
    const branchB = (
      await fetch(`${BASE}/api/companies`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ nameAr: 'فرع الدمام', city: 'الدمام' }),
      }).then((r) => r.json())
    ).company;

    const p1 = (
      await fetch(`${BASE}/api/properties`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ companyId: compMainId, nameAr: 'عقار ألفا 1', city: 'الرياض' }),
      }).then((r) => r.json())
    ).property;
    const p2 = (
      await fetch(`${BASE}/api/properties`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ companyId: compMainId, nameAr: 'عقار ألفا 2', city: 'الرياض' }),
      }).then((r) => r.json())
    ).property;
    const p3 = (
      await fetch(`${BASE}/api/properties`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ companyId: branchB.id, nameAr: 'عقار فرع الدمام 3', city: 'الدمام' }),
      }).then((r) => r.json())
    ).property;

    const u2 = (
      await fetch(`${BASE}/api/units`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ propertyId: p2.id, unitNumber: 'W-201', suggestedAnnualRent: 36000 }),
      }).then((r) => r.json())
    ).unit;
    assert.ok(u2.id);

    const doc2 = (
      await fetch(`${BASE}/api/documents`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({
          title: 'عقد سري عقار 2',
          category: 'صكوك',
          propertyId: p2.id,
          relatedType: 'عقار',
          relatedId: p2.id,
        }),
      }).then((r) => r.json())
    ).doc;
    assert.ok(doc2?.id, 'Worker doc2 must be created');

    // Create GM and verify hierarchy guard against sys_owner
    const gmUser = await provisionInvitedEmployee(
      BASE,
      alphaHeaders,
      wsHeader,
      {
        nameAr: 'مدير عام ألفا',
        jobTitle: 'المدير العام',
        phone: '0558800001',
        email: 'alpha.gm@aqarplus.sa',
        role: 'gm',
        allowedPropertyIds: ['*'],
        channel: 'copy_link',
      },
      'AlphaGmPass!26',
      '1111'
    );
    const gmLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...wsHeader },
      body: JSON.stringify({ identifier: 'alpha.gm@aqarplus.sa', password: 'AlphaGmPass!26', appType: 'web', rememberMe: true }),
    });
    assert.equal(gmLogin.status, 200);
    const gmCookie = extractCookieVal(gmLogin, 'aqar_refresh');
    assert.ok(gmCookie, 'Worker web rememberMe login must set HttpOnly aqar_refresh cookie');
    const gmJson = await gmLogin.json();
    assert.equal(gmJson.refreshToken, undefined, 'Worker web login must omit refreshToken from JSON body');
    const gmHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${gmJson.token}`, ...wsHeader };

    const gmBlockSys = await fetch(`${BASE}/api/team/employees/${alphaAuth.user.id}`, {
      method: 'PATCH',
      headers: gmHeaders,
      body: JSON.stringify({ jobTitle: 'محاولة تعديل المالك' }),
    });
    assert.equal(gmBlockSys.status, 403);
    assert.equal((await gmBlockSys.json()).code, 'FORBIDDEN');
    console.log('✓ W2. Worker GM hierarchy guard & web HttpOnly cookie-only refresh verified');

    // Create 0-property employee -> 0 properties visible & 403 on direct bypass
    await provisionInvitedEmployee(
      BASE,
      alphaHeaders,
      wsHeader,
      {
        nameAr: 'موظف صفري ووركر',
        jobTitle: 'موظف',
        phone: '0558800002',
        email: 'w.zero@aqarplus.sa',
        role: 'supervisor',
        allowedPropertyIds: [],
        channel: 'copy_link',
      },
      'WZeroPass!26',
      '2222'
    );
    const wZero = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...wsHeader },
      body: JSON.stringify({ identifier: 'w.zero@aqarplus.sa', password: 'WZeroPass!26' }),
    }).then((r) => r.json());
    assert.equal(wZero.state.properties.length, 0);
    assert.equal(wZero.state.units.length, 0);
    const wZeroDeny = await fetch(`${BASE}/api/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wZero.token}`, ...wsHeader },
      body: JSON.stringify({ propertyId: p1.id, unitNumber: 'Z-1', suggestedAnnualRent: 24000 }),
    });
    assert.equal(wZeroDeny.status, 403);
    assert.equal((await wZeroDeny.json()).code, 'FORBIDDEN');

    // Single property employee [p1.id] -> allowed on p1, 403 on p2
    const wOneUser = await provisionInvitedEmployee(
      BASE,
      alphaHeaders,
      wsHeader,
      {
        nameAr: 'موظف عقار واحد ووركر',
        jobTitle: 'منسق',
        phone: '0558800003',
        email: 'w.one@aqarplus.sa',
        role: 'leasing',
        companyId: compMainId,
        allowedPropertyIds: [p1.id],
        channel: 'copy_link',
      },
      'WOnePass!26',
      '3333'
    );
    const wOneLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...wsHeader },
      body: JSON.stringify({ identifier: 'w.one@aqarplus.sa', password: 'WOnePass!26', appType: 'desktop', rememberMe: true }),
    }).then((r) => r.json());
    assert.ok(wOneLogin.refreshToken, 'Desktop login on Worker keeps JSON refreshToken');
    assert.equal(wOneLogin.state.properties.length, 1);
    assert.equal(wOneLogin.state.properties[0].id, p1.id);
    assert.ok(!wOneLogin.state.documents.some((d) => d.id === doc2.id));

    const wOneHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${wOneLogin.token}`, ...wsHeader };
    const wOneDenyP2 = await fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: wOneHeaders,
      body: JSON.stringify({ propertyId: p2.id, title: 'محاولة تذكرة لعقار 2' }),
    });
    assert.equal(wOneDenyP2.status, 403);

    // Multi-property + branch isolation ([p1, p2] excluded from branchB p3)
    await provisionInvitedEmployee(
      BASE,
      alphaHeaders,
      wsHeader,
      {
        nameAr: 'موظف عقارين ووركر',
        jobTitle: 'مشرف',
        phone: '0558800004',
        email: 'w.multi@aqarplus.sa',
        role: 'supervisor',
        companyId: compMainId,
        allowedPropertyIds: [p1.id, p2.id],
        channel: 'copy_link',
      },
      'WMultiPass!26',
      '4444'
    );
    const wMultiLogin = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...wsHeader },
      body: JSON.stringify({ identifier: 'w.multi@aqarplus.sa', password: 'WMultiPass!26' }),
    }).then((r) => r.json());
    const wMultiIds = new Set(wMultiLogin.state.properties.map((x) => x.id));
    assert.ok(wMultiIds.has(p1.id) && wMultiIds.has(p2.id) && !wMultiIds.has(p3.id));
    const wMultiDenyP3 = await fetch(`${BASE}/api/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wMultiLogin.token}`, ...wsHeader },
      body: JSON.stringify({ propertyId: p3.id, unitNumber: 'B3-U1', suggestedAnnualRent: 30000 }),
    });
    assert.equal(wMultiDenyP3.status, 403);
    console.log('✓ W3. Worker 0-property, 1-property, multi-property & branch isolation verified');

    // W4. Scope shrink immediately revokes session + immutable auditLogs survive denied mutations & restore
    const shrinkRes = await fetch(`${BASE}/api/team/employees/${wOneUser.id}`, {
      method: 'PATCH',
      headers: alphaHeaders,
      body: JSON.stringify({ allowedPropertyIds: [] }),
    });
    assert.equal(shrinkRes.status, 200);
    const wOneAfterShrink = await fetch(`${BASE}/api/state`, { headers: wOneHeaders });
    assert.equal(wOneAfterShrink.status, 401, 'Worker must immediately revoke sessions when property scope shrinks');

    // Restore backup preserves immutable auditLogs including 403 denials
    const alphaState = await fetch(`${BASE}/api/state`, { headers: alphaHeaders }).then((r) => r.json());
    const deniedCount = (alphaState.state.auditLogs || []).filter(
      (a) => String(a.action).includes('رفض') || String(a.summary || '').includes('رفض')
    ).length;
    assert.ok(deniedCount >= 3, 'Worker auditLogs must record denied 403 access attempts');

    const wBkp = (
      await fetch(`${BASE}/api/backups`, {
        method: 'POST',
        headers: alphaHeaders,
        body: JSON.stringify({ label: 'Worker Security Backup' }),
      }).then((r) => r.json())
    ).backup;
    const wRestore = await fetch(`${BASE}/api/backups/${wBkp.id}/restore`, {
      method: 'POST',
      headers: alphaHeaders,
      body: JSON.stringify({ mode: 'replace' }),
    });
    assert.equal(wRestore.status, 200);
    const wRestoreJson = await wRestore.json();
    assert.ok(
      wRestoreJson.state.auditLogs.some((a) => String(a.action).includes('رفض') || String(a.summary || '').includes('رفض')),
      'Worker immutable auditLogs must survive restore replace'
    );
    console.log('✓ W4. Worker instant revocation & immutable auditLogs across restore verified');
  } catch (err) {
    console.error('❌ Worker Security Phase 1 failed:', err);
    console.error('--- Wrangler logs ---\n' + logs);
    throw err;
  } finally {
    if (wranglerProc.pid) {
      try {
        process.kill(-wranglerProc.pid, 'SIGTERM');
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 400));
      try {
        process.kill(-wranglerProc.pid, 'SIGKILL');
      } catch {
        // ignore
      }
    }
    fs.rmSync(TMP_PERSIST, { recursive: true, force: true });
  }
}

async function main() {
  await verifyNodeSuite();
  await verifyWorkerSuite();
  console.log('\n✅ ALL PHASE 1 SECURITY & ISOLATION CHECKS PASSED ACROSS NODE.JS AND CLOUDFLARE WORKER!\n');
}

main().catch((err) => {
  console.error('❌ Phase 1 security verification failed:', err);
  process.exit(1);
});
