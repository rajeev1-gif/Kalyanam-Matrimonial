const http = require('http');
const path = require('path');
const dotenv = require('./server/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, 'server/.env'), override: true });

const { PrismaClient } = require('./server/node_modules/@prisma/client');
const jwt = require('./server/node_modules/jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding';
const SERVER_URL = 'http://localhost:5000';

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, SERVER_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function makeToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

let passed = 0;
let total = 0;

function assertTest(name, condition, details = '') {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
  }
}

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('🧪 Kalyanam Matrimonial – Phase 4 Automated Test Suite');
  console.log('   Admin Membership Management, Extension, Revocation & Auditing');
  console.log('================================================================\n');

  try {
    // 0. Setup Admin & Regular Test Users
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN', status: 'ACTIVE' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin_p4_tester@example.com',
          mobile: '9900000001',
          passwordHash: '$2a$10$pL3mZ78fS7nSjM1xQW3PyeYy4hF/nI1m8H6/v3sJ7oB2aC6f12rX6',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }
    const adminToken = makeToken(admin);

    let regularUser = await prisma.user.findUnique({
      where: { email: 'p4_member@test.com' },
      include: { profile: true },
    });
    if (!regularUser) {
      regularUser = await prisma.user.create({
        data: {
          email: 'p4_member@test.com',
          mobile: '9900000002',
          passwordHash: '$2a$10$pL3mZ78fS7nSjM1xQW3PyeYy4hF/nI1m8H6/v3sJ7oB2aC6f12rX6',
          role: 'USER',
          status: 'ACTIVE',
          profile: {
            create: {
              fullName: 'Vikas Malhotra',
              gender: 'MALE',
              dateOfBirth: new Date('1994-08-20'),
              height: 178,
            },
          },
        },
        include: { profile: true },
      });
    }
    const userToken = makeToken(regularUser);

    const plans = await prisma.membershipPlan.findMany();
    const silverPlan = plans.find((p) => p.planCode === 'SILVER');
    const goldPlan = plans.find((p) => p.planCode === 'GOLD');
    const platPlan = plans.find((p) => p.planCode === 'PLATINUM');
    const freePlan = plans.find((p) => p.planCode === 'FREE');

    // Clean previous grants & subscriptions for regularUser
    await prisma.adminAccessGrant.deleteMany({ where: { userId: regularUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: regularUser.id } });
    await prisma.membershipAuditLog.deleteMany({ where: { userId: regularUser.id } });

    console.log('--- Test 1: Admin can grant each plan (FREE, SILVER, GOLD, PLATINUM) ---');
    for (const code of ['SILVER', 'GOLD', 'PLATINUM', 'FREE']) {
      const grantRes = await request('/api/admin/memberships/grant', {
        method: 'POST',
        token: adminToken,
        body: {
          userId: regularUser.id,
          planCode: code,
          duration: 30,
          reason: `Granting ${code} tier for testing`,
        },
      });
      assertTest(
        `Admin grant ${code} plan succeeds with 201 Created`,
        grantRes.status === 201 &&
        grantRes.data.success === true &&
        grantRes.data.data.grant.plan.planCode === code,
        JSON.stringify(grantRes.data)
      );
    }

    console.log('\n--- Test 2: Admin can grant unlimited access (isUnlimited: true) ---');
    const unlimRes = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: {
        userId: regularUser.id,
        planCode: 'PLATINUM',
        isUnlimited: true,
        reason: 'VIP Lifetime access granted for ambassador',
      },
    });
    const unlimGrant = unlimRes.data?.data?.grant;
    assertTest(
      'Admin grant unlimited access sets isUnlimited: true and endDate: null',
      unlimRes.status === 201 &&
      unlimGrant.isUnlimited === true &&
      unlimGrant.endDate === null &&
      unlimRes.data.data.effectiveEntitlement.isUnlimited === true &&
      unlimRes.data.data.effectiveEntitlement.dailyMessageLimit === -1
    );

    console.log('\n--- Test 3: Admin can extend a valid grant ---');
    // First grant fixed-duration 15-day GOLD plan
    const goldGrantRes = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: {
        userId: regularUser.id,
        planCode: 'GOLD',
        duration: 15,
        reason: '15-day Gold trial',
      },
    });
    const goldGrantId = goldGrantRes.data.data.grant.id;
    const initialEndDate = new Date(goldGrantRes.data.data.grant.endDate);

    // Extend by 20 days
    const extendRes = await request(`/api/admin/memberships/${goldGrantId}/extend`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        additionalDays: 20,
        reason: 'Courtesy extension for service interruption',
      },
    });
    const extendedEndDate = new Date(extendRes.data?.data?.grant?.endDate);
    const dayDiff = Math.round((extendedEndDate - initialEndDate) / (1000 * 60 * 60 * 24));

    assertTest(
      'Admin can extend grant and expiry date is extended by exactly 20 days',
      extendRes.status === 200 &&
      extendRes.data.success === true &&
      dayDiff === 20,
      `initial=${initialEndDate.toISOString()}, extended=${extendedEndDate.toISOString()}, diff=${dayDiff}`
    );

    console.log('\n--- Test 4: Admin cannot extend an unlimited grant ---');
    const extendUnlimRes = await request(`/api/admin/memberships/${unlimGrant.id}/extend`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        additionalDays: 10,
        reason: 'Attempt extend unlimited',
      },
    });
    assertTest(
      'Attempting to extend an unlimited grant is rejected with 400',
      extendUnlimRes.status === 400 &&
      extendUnlimRes.data.message.includes('unlimited')
    );

    console.log('\n--- Test 5: Admin can revoke a grant ---');
    const revokeRes = await request(`/api/admin/memberships/${goldGrantId}/revoke`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        revocationReason: 'Terms of service violation',
      },
    });
    assertTest(
      'Admin can revoke a grant with mandatory reason',
      revokeRes.status === 200 &&
      revokeRes.data.success === true &&
      revokeRes.data.data.grant.status === 'REVOKED' &&
      revokeRes.data.data.grant.revocationReason === 'Terms of service violation' &&
      revokeRes.data.data.fallbackEntitlement.effectivePlan === 'FREE'
    );

    console.log('\n--- Test 6: Missing reason is rejected for grant, extend and revoke ---');
    const noReasonGrant = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: { userId: regularUser.id, planCode: 'SILVER', duration: 30, reason: '' },
    });
    const noReasonExtend = await request(`/api/admin/memberships/${goldGrantId}/extend`, {
      method: 'PATCH',
      token: adminToken,
      body: { additionalDays: 10, reason: '   ' },
    });
    const noReasonRevoke = await request(`/api/admin/memberships/${goldGrantId}/revoke`, {
      method: 'PATCH',
      token: adminToken,
      body: { revocationReason: '' },
    });

    assertTest(
      'Mandatory reason validation rejects empty reason on grant, extend, and revoke with 400',
      noReasonGrant.status === 400 && noReasonExtend.status === 400 && noReasonRevoke.status === 400
    );

    console.log('\n--- Test 7: Invalid user or plan is rejected ---');
    const badUser = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: { userId: 'non_existent_id', planCode: 'SILVER', duration: 30, reason: 'Test' },
    });
    const badPlan = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: { userId: regularUser.id, planCode: 'DIAMOND_INVALID', duration: 30, reason: 'Test' },
    });
    assertTest(
      'Invalid userId returns 404 and invalid planCode returns 400',
      badUser.status === 404 && badPlan.status === 400
    );

    console.log('\n--- Test 8: Non-admin cannot use Admin endpoints (403) ---');
    const forbiddenRes = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: userToken,
      body: { userId: regularUser.id, planCode: 'GOLD', duration: 30, reason: 'Attempt bypass' },
    });
    assertTest(
      'Non-admin request rejected with HTTP 403 Forbidden',
      forbiddenRes.status === 403
    );

    console.log('\n--- Test 9: Granting access does not cancel paid subscription ---');
    // Setup active paid subscription
    const paidSub = await prisma.subscription.create({
      data: {
        userId: regularUser.id,
        planId: silverPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        interestsRemaining: silverPlan.interestLimit,
        viewsRemaining: silverPlan.profileViewLimit,
        contactsRemaining: silverPlan.contactViewLimit,
      },
    });

    // Admin grants PLATINUM for 7 days
    const tempPlat = await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: {
        userId: regularUser.id,
        planCode: 'PLATINUM',
        duration: 7,
        reason: 'Promotional 7-day Platinum',
      },
    });

    const subCheck1 = await prisma.subscription.findUnique({ where: { id: paidSub.id } });
    assertTest(
      'Admin grant leaves paid subscription ACTIVE and untouched in database',
      subCheck1 && subCheck1.status === 'ACTIVE' && tempPlat.data.data.effectiveEntitlement.effectivePlan === 'PLATINUM'
    );

    console.log('\n--- Test 10: Revoking Admin grant falls back to paid subscription ---');
    const platGrantId = tempPlat.data.data.grant.id;
    const revokePlat = await request(`/api/admin/memberships/${platGrantId}/revoke`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        revocationReason: 'Promo expired early',
      },
    });
    const subCheck2 = await prisma.subscription.findUnique({ where: { id: paidSub.id } });
    assertTest(
      'Revoking Admin grant leaves paid sub ACTIVE and immediately falls back to paid SILVER',
      subCheck2 && subCheck2.status === 'ACTIVE' &&
      revokePlat.data.data.fallbackEntitlement.effectivePlan === 'SILVER' &&
      revokePlat.data.data.fallbackEntitlement.accessSource === 'PAID'
    );

    console.log('\n--- Test 11: Audit logs created for all actions ---');
    const auditLogs = await prisma.membershipAuditLog.findMany({
      where: { userId: regularUser.id },
      orderBy: { createdAt: 'desc' },
    });
    const hasGrant = auditLogs.some((l) => l.action === 'ADMIN_GRANT');
    const hasExtend = auditLogs.some((l) => l.action === 'ADMIN_EXTEND');
    const hasRevoke = auditLogs.some((l) => l.action === 'ADMIN_REVOKE');
    const allHaveActor = auditLogs.every((l) => l.performedById === admin.id);

    assertTest(
      'Audit logs record ADMIN_GRANT, ADMIN_EXTEND, and ADMIN_REVOKE with admin actor ID',
      hasGrant && hasExtend && hasRevoke && allHaveActor,
      `count=${auditLogs.length}`
    );

    console.log('\n--- Test 12: Audit history API is accessible and returns formatted logs ---');
    const historyRes = await request(`/api/admin/memberships/users/${regularUser.id}/history`, {
      token: adminToken,
    });
    assertTest(
      'GET /api/admin/memberships/users/:id/history returns 200 with structured audit history',
      historyRes.status === 200 &&
      historyRes.data.success === true &&
      Array.isArray(historyRes.data.data.logs) &&
      historyRes.data.data.logs.length >= 3 &&
      historyRes.data.data.currentEntitlement.effectivePlan === 'SILVER'
    );

    console.log('\n--- Test 13: Listing memberships supports search, filters, and pagination ---');
    const listAll = await request('/api/admin/memberships?limit=10', { token: adminToken });
    const listFilteredPlan = await request('/api/admin/memberships?plan=PLATINUM', { token: adminToken });
    const listFilteredStatus = await request('/api/admin/memberships?status=REVOKED', { token: adminToken });
    const listSearch = await request('/api/admin/memberships?search=Vikas', { token: adminToken });

    assertTest(
      'GET /api/admin/memberships returns paginated grants with search and plan/status filtering',
      listAll.status === 200 &&
      listAll.data.data.grants.length > 0 &&
      listFilteredPlan.status === 200 &&
      listFilteredStatus.status === 200 &&
      listFilteredStatus.data.data.grants.every((g) => g.status === 'REVOKED' || g.displayStatus === 'REVOKED') &&
      listSearch.status === 200 &&
      listSearch.data.data.grants.some((g) => g.userName.includes('Vikas'))
    );

    console.log('\n--- Test 14: Details endpoint GET /api/admin/memberships/:id ---');
    const detailRes = await request(`/api/admin/memberships/${platGrantId}`, { token: adminToken });
    assertTest(
      'GET /api/admin/memberships/:id returns full grant details, user, plan, and audit logs',
      detailRes.status === 200 &&
      detailRes.data.success === true &&
      detailRes.data.data.grant.id === platGrantId &&
      Array.isArray(detailRes.data.data.auditLogs)
    );

    console.log('\n================================================================');
    console.log(`📊 Phase 4 Backend Test Results: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    await prisma.$disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test runner error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase4Tests();

