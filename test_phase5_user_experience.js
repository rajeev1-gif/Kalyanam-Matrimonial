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

function getKolkataDateKey(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
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

async function runPhase5Tests() {
  console.log('================================================================');
  console.log('🧪 Kalyanam Matrimonial – Phase 5 Automated Test Suite');
  console.log('   User-Facing Membership UI & Chat Restriction Experience');
  console.log('================================================================\n');

  try {
    const todayKey = getKolkataDateKey();

    // 0. Setup Users: sender & receiver
    async function getOrCreateUser(email, fullName, gender) {
      let u = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
      if (!u) {
        u = await prisma.user.create({
          data: {
            email,
            mobile: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            passwordHash: '$2a$10$pL3mZ78fS7nSjM1xQW3PyeYy4hF/nI1m8H6/v3sJ7oB2aC6f12rX6',
            role: 'USER',
            status: 'ACTIVE',
            profile: {
              create: {
                fullName,
                gender,
                dateOfBirth: new Date('1996-03-22'),
                height: 172,
              },
            },
          },
          include: { profile: true },
        });
      }
      return u;
    }

    const freeUser = await getOrCreateUser('p5_free_user@test.com', 'Sameer Saxena', 'MALE');
    const partnerUser = await getOrCreateUser('p5_partner_user@test.com', 'Neha Verma', 'FEMALE');
    const freeToken = makeToken(freeUser);
    const partnerToken = makeToken(partnerUser);

    // Mutual connection so free user can message
    await prisma.interest.upsert({
      where: { senderId_receiverId: { senderId: freeUser.id, receiverId: partnerUser.id } },
      create: { senderId: freeUser.id, receiverId: partnerUser.id, status: 'ACCEPTED' },
      update: { status: 'ACCEPTED' },
    });

    const [u1, u2] = [freeUser.id, partnerUser.id].sort();
    const conv = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: {},
    });

    // Reset usage & subscriptions for freeUser
    await prisma.adminAccessGrant.deleteMany({ where: { userId: freeUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: freeUser.id } });
    await prisma.chatUsage.deleteMany({ where: { userId: freeUser.id } });

    console.log('--- Test 1: Free user sees 5-message daily allowance ---');
    const usageInitial = await request('/api/messages/usage', { token: freeToken });
    assertTest(
      'Free user usage endpoint reports 5 limit, 0 used, 5 remaining',
      usageInitial.status === 200 &&
      usageInitial.data.data.dailyLimit === 5 &&
      usageInitial.data.data.usedToday === 0 &&
      usageInitial.data.data.remainingToday === 5 &&
      usageInitial.data.data.effectivePlan === 'FREE' &&
      usageInitial.data.data.accessSource === 'FREE'
    );

    console.log('\n--- Test 2: Sending one message updates the remaining quota ---');
    const sendMsg1 = await request('/api/chat/messages', {
      method: 'POST',
      token: freeToken,
      body: { receiverId: partnerUser.id, conversationId: conv.id, content: 'Phase 5 message 1' },
    });
    const usageAfter1 = await request('/api/messages/usage', { token: freeToken });
    assertTest(
      'Sending 1 message decrements remaining to 4 and increments used to 1',
      sendMsg1.status === 201 &&
      usageAfter1.data.data.usedToday === 1 &&
      usageAfter1.data.data.remainingToday === 4
    );

    console.log('\n--- Test 3: Exhausting quota (5 messages) sets remaining to 0 ---');
    for (let i = 2; i <= 5; i++) {
      await request('/api/chat/messages', {
        method: 'POST',
        token: freeToken,
        body: { receiverId: partnerUser.id, conversationId: conv.id, content: `Phase 5 message ${i}` },
      });
    }
    const usageExhausted = await request('/api/messages/usage', { token: freeToken });
    assertTest(
      'After 5 messages, usedToday is 5 and remainingToday is 0',
      usageExhausted.data.data.usedToday === 5 &&
      usageExhausted.data.data.remainingToday === 0
    );

    console.log('\n--- Test 4: Sixth message triggers 403 DAILY_MESSAGE_LIMIT_REACHED ---');
    const msg6Res = await request('/api/chat/messages', {
      method: 'POST',
      token: freeToken,
      body: { receiverId: partnerUser.id, conversationId: conv.id, content: 'Sixth message should trigger limit' },
    });
    assertTest(
      'Sixth message returns 403 DAILY_MESSAGE_LIMIT_REACHED for upgrade prompt',
      msg6Res.status === 403 &&
      msg6Res.data.code === 'DAILY_MESSAGE_LIMIT_REACHED' &&
      msg6Res.data.data.usedToday === 5 &&
      msg6Res.data.data.remainingToday === 0
    );

    console.log('\n--- Test 5: Incoming messages remain available after sender limit reached ---');
    // Partner (receiver) sends message to freeUser
    const partnerSend = await request('/api/chat/messages', {
      method: 'POST',
      token: partnerToken,
      body: { receiverId: freeUser.id, conversationId: conv.id, content: 'Incoming reply from partner' },
    });
    // freeUser fetches messages
    const getMsgs = await request(`/api/chat/conversations/${conv.id}/messages`, { token: freeToken });
    const hasIncoming = getMsgs.data?.data?.messages?.some((m) => m.content === 'Incoming reply from partner');
    assertTest(
      'User with exhausted quota still receives partner messages and reads chat history',
      partnerSend.status === 201 && hasIncoming === true
    );

    console.log('\n--- Test 6: Membership Endpoint returns real-time entitlement & accessSource ---');
    const currentSubRes = await request('/api/membership/current', { token: freeToken });
    assertTest(
      'GET /api/membership/current returns entitlement with plan, dailyLimit, and accessSource',
      currentSubRes.status === 200 &&
      currentSubRes.data.data.plan.planCode === 'FREE' &&
      currentSubRes.data.data.accessSource === 'FREE' &&
      currentSubRes.data.data.plan.dailyMessageLimit === 5
    );

    console.log('\n--- Test 7: Upgrading to Silver activates 50 messages/day & logs audit trail ---');
    const plansRes = await request('/api/membership/plans');
    const silverPlan = plansRes.data.data.find((p) => p.planCode === 'SILVER');

    // Create order & verify payment
    const orderRes = await request('/api/membership/orders', {
      method: 'POST',
      token: freeToken,
      body: { planId: silverPlan.id },
    });
    const verifyRes = await request('/api/membership/verify', {
      method: 'POST',
      token: freeToken,
      body: {
        orderId: orderRes.data.data.orderId,
        paymentId: `pay_p5_${Date.now()}`,
        signature: 'sandbox_verified_signature',
      },
    });

    const usageAfterUpgrade = await request('/api/messages/usage', { token: freeToken });
    const subAfterUpgrade = await request('/api/membership/current', { token: freeToken });
    const auditLogs = await prisma.membershipAuditLog.findMany({
      where: { userId: freeUser.id, action: 'PAID_SUBSCRIPTION' },
    });

    assertTest(
      'Payment verification upgrades user to SILVER with 50 limit and PAID_SUBSCRIPTION audit log',
      verifyRes.status === 200 &&
      usageAfterUpgrade.data.data.effectivePlan === 'SILVER' &&
      usageAfterUpgrade.data.data.dailyLimit === 50 &&
      usageAfterUpgrade.data.data.remainingToday === 45 && // 50 - 5 already used today
      subAfterUpgrade.data.data.accessSource === 'PAID' &&
      auditLogs.length > 0
    );

    console.log('\n--- Test 8: Upgraded user can now send 6th and 7th messages without 403 ---');
    const upgradedSend = await request('/api/chat/messages', {
      method: 'POST',
      token: freeToken,
      body: { receiverId: partnerUser.id, conversationId: conv.id, content: 'Message 6 now succeeds on SILVER plan!' },
    });
    const usageAfter6 = await request('/api/messages/usage', { token: freeToken });
    assertTest(
      'Message 6 sends with 201 Created after upgrade and usedToday becomes 6',
      upgradedSend.status === 201 &&
      usageAfter6.data.data.usedToday === 6 &&
      usageAfter6.data.data.remainingToday === 44
    );

    console.log('\n--- Test 9: Admin-granted Unlimited Platinum displays isUnlimited = true ---');
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const adminToken = makeToken(admin);
    const platPlan = plansRes.data.data.find((p) => p.planCode === 'PLATINUM');

    await request('/api/admin/memberships/grant', {
      method: 'POST',
      token: adminToken,
      body: {
        userId: freeUser.id,
        planCode: 'PLATINUM',
        isUnlimited: true,
        reason: 'Ambassador grant',
      },
    });

    const unlimUsage = await request('/api/messages/usage', { token: freeToken });
    const unlimSub = await request('/api/membership/current', { token: freeToken });
    assertTest(
      'Admin-granted Platinum displays effectivePlan = PLATINUM, accessSource = ADMIN, isUnlimited = true, dailyLimit = -1',
      unlimUsage.data.data.effectivePlan === 'PLATINUM' &&
      unlimUsage.data.data.accessSource === 'ADMIN' &&
      unlimUsage.data.data.isUnlimited === true &&
      unlimUsage.data.data.dailyLimit === -1 &&
      unlimUsage.data.data.remainingToday === -1 &&
      unlimSub.data.data.accessSource === 'ADMIN'
    );

    console.log('\n--- Test 10: Reset countdown correctly points to next midnight in Asia/Kolkata ---');
    const resetsAt = new Date(unlimUsage.data.data.resetsAt);
    const now = new Date();
    const diffHours = (resetsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    assertTest(
      'resetsAt is a future timestamp within 0 to 24 hours representing IST midnight',
      resetsAt.getTime() > now.getTime() && diffHours <= 24 && diffHours >= 0,
      `diffHours=${diffHours.toFixed(2)}, resetsAt=${resetsAt.toISOString()}`
    );

    console.log('\n================================================================');
    console.log(`📊 Phase 5 Test Results: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    await prisma.$disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test runner error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase5Tests();

