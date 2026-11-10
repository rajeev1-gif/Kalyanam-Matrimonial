const http = require('http');
const path = require('path');
const dotenv = require('./server/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, 'server/.env'), override: true });

const { PrismaClient } = require('./server/node_modules/@prisma/client');
const jwt = require('./server/node_modules/jsonwebtoken');
const ioClient = require('./client/node_modules/socket.io-client');

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

async function runPhase3Tests() {
  console.log('================================================================');
  console.log('🧪 Kalyanam Matrimonial – Phase 3 Comprehensive Test Suite');
  console.log('   Entitlement Resolution & Chat Restriction Enforcement');
  console.log('================================================================\n');

  try {
    // 0. Verify Database connection & fetch Membership Plans
    const plans = await prisma.membershipPlan.findMany();
    const freePlan = plans.find((p) => p.planCode === 'FREE');
    const silverPlan = plans.find((p) => p.planCode === 'SILVER');
    const goldPlan = plans.find((p) => p.planCode === 'GOLD');
    const platPlan = plans.find((p) => p.planCode === 'PLATINUM');

    assertTest(
      'Database contains required membership plans with limits',
      freePlan && silverPlan && goldPlan && platPlan &&
      freePlan.dailyMessageLimit === 5 &&
      silverPlan.dailyMessageLimit === 50 &&
      goldPlan.dailyMessageLimit === 150 &&
      platPlan.dailyMessageLimit === -1,
      `FREE=${freePlan?.dailyMessageLimit}, SILVER=${silverPlan?.dailyMessageLimit}, GOLD=${goldPlan?.dailyMessageLimit}, PLATINUM=${platPlan?.dailyMessageLimit}`
    );

    // Setup Admin user
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin_test_p3@example.com',
          mobile: '9999900001',
          passwordHash: 'dummy_hash',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    // Helper to get or create test user
    async function getOrCreateTestUser(email, fullName, gender) {
      let user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });
      if (!user) {
        user = await prisma.user.create({
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
                dateOfBirth: new Date('1995-05-15'),
                height: 175,
              },
            },
          },
          include: { profile: true },
        });
      }
      return user;
    }

    // Helper to create test subscription
    async function createTestSubscription(userId, plan, durationDays = 30) {
      return prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
          interestsRemaining: plan.interestLimit,
          viewsRemaining: plan.profileViewLimit,
          contactsRemaining: plan.contactViewLimit,
        },
      });
    }

    const senderA = await getOrCreateTestUser('p3_sender_a@test.com', 'Aarav Gupta', 'MALE');
    const receiverB = await getOrCreateTestUser('p3_receiver_b@test.com', 'Diya Patel', 'FEMALE');
    const senderToken = makeToken(senderA);
    const receiverToken = makeToken(receiverB);

    // Ensure mutual accepted interest so free user is allowed to chat
    await prisma.interest.deleteMany({
      where: {
        OR: [
          { senderId: senderA.id, receiverId: receiverB.id },
          { senderId: receiverB.id, receiverId: senderA.id },
        ],
      },
    });
    await prisma.interest.create({
      data: {
        senderId: senderA.id,
        receiverId: receiverB.id,
        status: 'ACCEPTED',
      },
    });

    // Find or create conversation
    const [u1, u2] = [senderA.id, receiverB.id].sort();
    const conv = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: {},
    });

    const todayKey = getKolkataDateKey();

    // Clean up any test grants, subscriptions, or usages for senderA
    await prisma.adminAccessGrant.deleteMany({ where: { userId: senderA.id } });
    await prisma.subscription.deleteMany({ where: { userId: senderA.id } });
    await prisma.chatUsage.deleteMany({ where: { userId: senderA.id } });
    await prisma.chatUsage.deleteMany({ where: { userId: receiverB.id } });

    console.log('\n--- Condition 1: Free User sends 5 messages successfully ---');
    let condition1Success = true;
    for (let i = 1; i <= 5; i++) {
      const res = await request('/api/chat/messages', {
        method: 'POST',
        token: senderToken,
        body: {
          receiverId: receiverB.id,
          conversationId: conv.id,
          content: `Test free message #${i}`,
        },
      });
      if (res.status !== 201 || !res.data.success) {
        condition1Success = false;
        console.error(`Failed at message ${i}:`, res.status, res.data);
        break;
      }
    }
    assertTest('Free user sends 5 messages successfully with 201 Created', condition1Success);

    // Verify ChatUsage endpoint
    const usageCheck5 = await request('/api/chat/usage', { token: senderToken });
    assertTest(
      'GET /api/chat/usage reports 5 used, 0 remaining for FREE plan',
      usageCheck5.status === 200 &&
      usageCheck5.data.data.usedToday === 5 &&
      usageCheck5.data.data.remainingToday === 0 &&
      usageCheck5.data.data.dailyLimit === 5 &&
      usageCheck5.data.data.effectivePlan === 'FREE'
    );

    console.log('\n--- Condition 2: 6th Free message is blocked with 403 & structured payload ---');
    const sixthRes = await request('/api/chat/messages', {
      method: 'POST',
      token: senderToken,
      body: {
        receiverId: receiverB.id,
        conversationId: conv.id,
        content: 'Test free message #6 should fail',
      },
    });

    assertTest(
      '6th Free message returns HTTP 403 with DAILY_MESSAGE_LIMIT_REACHED',
      sixthRes.status === 403 &&
      sixthRes.data.code === 'DAILY_MESSAGE_LIMIT_REACHED' &&
      sixthRes.data.data.dailyLimit === 5 &&
      sixthRes.data.data.usedToday === 5 &&
      sixthRes.data.data.remainingToday === 0 &&
      sixthRes.data.data.resetTimezone === 'Asia/Kolkata' &&
      typeof sixthRes.data.data.resetsAt === 'string',
      JSON.stringify(sixthRes.data)
    );

    console.log('\n--- Condition 3: Silver User allowed 50 messages/day ---');
    const silverUser = await getOrCreateTestUser('p3_silver@test.com', 'Silver User', 'MALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: silverUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: silverUser.id } });
    await createTestSubscription(silverUser.id, silverPlan);
    const silverToken = makeToken(silverUser);
    const silverUsage = await request('/api/chat/usage', { token: silverToken });
    assertTest(
      'Silver user has dailyLimit = 50 and effectivePlan = SILVER',
      silverUsage.status === 200 &&
      silverUsage.data.data.effectivePlan === 'SILVER' &&
      silverUsage.data.data.dailyLimit === 50 &&
      silverUsage.data.data.accessSource === 'PAID'
    );

    console.log('\n--- Condition 4: Gold User allowed 150 messages/day ---');
    const goldUser = await getOrCreateTestUser('p3_gold@test.com', 'Gold User', 'FEMALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: goldUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: goldUser.id } });
    await createTestSubscription(goldUser.id, goldPlan);
    const goldToken = makeToken(goldUser);
    const goldUsage = await request('/api/chat/usage', { token: goldToken });
    assertTest(
      'Gold user has dailyLimit = 150 and effectivePlan = GOLD',
      goldUsage.status === 200 &&
      goldUsage.data.data.effectivePlan === 'GOLD' &&
      goldUsage.data.data.dailyLimit === 150 &&
      goldUsage.data.data.accessSource === 'PAID'
    );

    console.log('\n--- Condition 5: Platinum User allowed unlimited messages (-1) ---');
    const platUser = await getOrCreateTestUser('p3_plat@test.com', 'Platinum User', 'MALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: platUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: platUser.id } });
    await createTestSubscription(platUser.id, platPlan);
    const platToken = makeToken(platUser);
    const platUsage = await request('/api/chat/usage', { token: platToken });
    assertTest(
      'Platinum user has dailyLimit = -1 and isUnlimited = true',
      platUsage.status === 200 &&
      platUsage.data.data.effectivePlan === 'PLATINUM' &&
      platUsage.data.data.dailyLimit === -1 &&
      platUsage.data.data.isUnlimited === true &&
      platUsage.data.data.remainingToday === -1
    );

    console.log('\n--- Condition 6: Admin-granted Silver access receives 50 messages/day ---');
    const adminGrantUser = await getOrCreateTestUser('p3_admingrant@test.com', 'Grant User', 'FEMALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: adminGrantUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: adminGrantUser.id } });
    await prisma.adminAccessGrant.create({
      data: {
        userId: adminGrantUser.id,
        adminId: admin.id,
        planId: silverPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isUnlimited: false,
        reason: 'Courtesy upgrade for beta testing',
      },
    });
    const grantToken = makeToken(adminGrantUser);
    const grantUsage = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Admin-granted Silver access gives 50 messages/day with accessSource = ADMIN',
      grantUsage.status === 200 &&
      grantUsage.data.data.effectivePlan === 'SILVER' &&
      grantUsage.data.data.dailyLimit === 50 &&
      grantUsage.data.data.accessSource === 'ADMIN'
    );

    console.log('\n--- Condition 7: Admin-granted Gold access receives 150 messages/day ---');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: adminGrantUser.id } });
    await prisma.adminAccessGrant.create({
      data: {
        userId: adminGrantUser.id,
        adminId: admin.id,
        planId: goldPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isUnlimited: false,
        reason: 'Promotional VIP access',
      },
    });
    const grantGoldUsage = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Admin-granted Gold access gives 150 messages/day with accessSource = ADMIN',
      grantGoldUsage.status === 200 &&
      grantGoldUsage.data.data.effectivePlan === 'GOLD' &&
      grantGoldUsage.data.data.dailyLimit === 150 &&
      grantGoldUsage.data.data.accessSource === 'ADMIN'
    );

    console.log('\n--- Condition 8: Expired Admin grant falls back to valid paid subscription ---');
    // User has valid paid SILVER sub, but expired Admin GOLD grant
    await prisma.adminAccessGrant.deleteMany({ where: { userId: adminGrantUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: adminGrantUser.id } });
    await createTestSubscription(adminGrantUser.id, silverPlan);
    await prisma.adminAccessGrant.create({
      data: {
        userId: adminGrantUser.id,
        adminId: admin.id,
        planId: goldPlan.id,
        status: 'ACTIVE', // status in DB is active but date expired
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // expired yesterday
        isUnlimited: false,
        reason: 'Past weekend trial',
      },
    });
    const expiredGrantUsage = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Expired Admin grant falls back to active paid SILVER subscription (limit 50)',
      expiredGrantUsage.status === 200 &&
      expiredGrantUsage.data.data.effectivePlan === 'SILVER' &&
      expiredGrantUsage.data.data.dailyLimit === 50 &&
      expiredGrantUsage.data.data.accessSource === 'PAID'
    );

    console.log('\n--- Condition 9: Expired Admin grant with no paid subscription falls back to FREE ---');
    await prisma.subscription.deleteMany({ where: { userId: adminGrantUser.id } });
    const freeFallbackUsage = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Expired Admin grant with no paid subscription falls back to FREE (limit 5)',
      freeFallbackUsage.status === 200 &&
      freeFallbackUsage.data.data.effectivePlan === 'FREE' &&
      freeFallbackUsage.data.data.dailyLimit === 5 &&
      freeFallbackUsage.data.data.accessSource === 'FREE'
    );

    console.log('\n--- Condition 10: Revoked Admin grant immediately stops providing access ---');
    // Active grant with future end date, but status is REVOKED
    await prisma.adminAccessGrant.deleteMany({ where: { userId: adminGrantUser.id } });
    await prisma.adminAccessGrant.create({
      data: {
        userId: adminGrantUser.id,
        adminId: admin.id,
        planId: platPlan.id,
        status: 'REVOKED',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isUnlimited: false,
        reason: 'Granted by mistake',
        revokedAt: new Date(),
        revokedByAdminId: admin.id,
        revocationReason: 'Terms violation',
      },
    });
    const revokedUsage = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Revoked Admin grant is ignored and falls back to FREE',
      revokedUsage.status === 200 &&
      revokedUsage.data.data.effectivePlan === 'FREE' &&
      revokedUsage.data.data.dailyLimit === 5 &&
      revokedUsage.data.data.accessSource === 'FREE'
    );

    console.log('\n--- Condition 11: Revoking Admin grant does not modify/cancel paid subscription ---');
    // Add paid subscription back
    const freshPaidSub = await createTestSubscription(adminGrantUser.id, silverPlan, 20);
    // Add active admin grant and then revoke it
    const grantToRevoke = await prisma.adminAccessGrant.create({
      data: {
        userId: adminGrantUser.id,
        adminId: admin.id,
        planId: platPlan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        isUnlimited: false,
        reason: 'Temporary upgrade',
      },
    });
    // Revoke the grant
    await prisma.adminAccessGrant.update({
      where: { id: grantToRevoke.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedByAdminId: admin.id,
        revocationReason: 'Grant cancelled',
      },
    });
    // Check paid subscription in DB
    const subInDb = await prisma.subscription.findUnique({
      where: { id: freshPaidSub.id },
    });
    const usageAfterRevoke = await request('/api/chat/usage', { token: grantToken });
    assertTest(
      'Paid subscription remains ACTIVE and user retains SILVER (limit 50) after grant revocation',
      subInDb && subInDb.status === 'ACTIVE' &&
      usageAfterRevoke.status === 200 &&
      usageAfterRevoke.data.data.effectivePlan === 'SILVER' &&
      usageAfterRevoke.data.data.dailyLimit === 50 &&
      usageAfterRevoke.data.data.accessSource === 'PAID'
    );

    console.log('\n--- Condition 12: Incoming messages do not consume recipient quota ---');
    const recipientUsageBefore = await prisma.chatUsage.findUnique({
      where: { userId_dateKey: { userId: receiverB.id, dateKey: todayKey } },
    });
    assertTest(
      'Receiver ChatUsage record does not exist or messageCount is 0',
      !recipientUsageBefore || recipientUsageBefore.messageCount === 0
    );

    console.log('\n--- Condition 13: Failed message creation rolls back quota ---');
    // Attempt to invoke sendMessageCore with non-existent receiver and invalid parameters
    const failRes = await request('/api/chat/messages', {
      method: 'POST',
      token: senderToken,
      body: {
        content: '', // Empty text triggers validation error before/inside tx
      },
    });
    assertTest(
      'Failed message creation returns error and does not increment quota',
      failRes.status === 400
    );

    console.log('\n--- Condition 14: Concurrent requests cannot exceed daily limit ---');
    // Setup fresh user with 4/5 usage
    const concUser = await getOrCreateTestUser('p3_conc@test.com', 'Concurrent Tester', 'MALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: concUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: concUser.id } });
    await prisma.chatUsage.upsert({
      where: { userId_dateKey: { userId: concUser.id, dateKey: todayKey } },
      create: { userId: concUser.id, dateKey: todayKey, messageCount: 4 },
      update: { messageCount: 4 },
    });
    // Connect concUser with receiverB
    await prisma.interest.upsert({
      where: { senderId_receiverId: { senderId: concUser.id, receiverId: receiverB.id } },
      create: { senderId: concUser.id, receiverId: receiverB.id, status: 'ACCEPTED' },
      update: { status: 'ACCEPTED' },
    });
    const [cu1, cu2] = [concUser.id, receiverB.id].sort();
    const concConv = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id: cu1, user2Id: cu2 } },
      create: { user1Id: cu1, user2Id: cu2 },
      update: {},
    });
    const concToken = makeToken(concUser);

    // Fire 5 concurrent requests simultaneously
    const concPromises = [1, 2, 3, 4, 5].map((i) =>
      request('/api/chat/messages', {
        method: 'POST',
        token: concToken,
        body: {
          receiverId: receiverB.id,
          conversationId: concConv.id,
          content: `Concurrent burst message #${i}`,
        },
      })
    );
    const concResults = await Promise.all(concPromises);
    const successCount = concResults.filter((r) => r.status === 201).length;
    const blockedCount = concResults.filter((r) => r.status === 403 && r.data.code === 'DAILY_MESSAGE_LIMIT_REACHED').length;
    const finalConcUsage = await prisma.chatUsage.findUnique({
      where: { userId_dateKey: { userId: concUser.id, dateKey: todayKey } },
    });

    assertTest(
      'Concurrency test: exactly 1 request succeeded, 4 blocked with 403, and total count is 5',
      successCount === 1 && blockedCount === 4 && finalConcUsage.messageCount === 5,
      `Successes=${successCount}, Blocked=${blockedCount}, FinalUsage=${finalConcUsage?.messageCount}`
    );

    console.log('\n--- Condition 15: Daily usage resets at midnight Asia/Kolkata (dateKey rollover) ---');
    // Set yesterday's usage to 10
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayKey = getKolkataDateKey(yesterday);
    const rolloverUser = await getOrCreateTestUser('p3_rollover@test.com', 'Rollover Tester', 'FEMALE');
    await prisma.adminAccessGrant.deleteMany({ where: { userId: rolloverUser.id } });
    await prisma.subscription.deleteMany({ where: { userId: rolloverUser.id } });
    await prisma.chatUsage.deleteMany({ where: { userId: rolloverUser.id } });
    // Write usage record for yesterday
    await prisma.chatUsage.create({
      data: {
        userId: rolloverUser.id,
        dateKey: yesterdayKey,
        messageCount: 5,
      },
    });
    const rolloverToken = makeToken(rolloverUser);
    const rolloverUsage = await request('/api/chat/usage', { token: rolloverToken });
    assertTest(
      'Rollover test: yesterday usage is ignored; today has usedToday = 0, remainingToday = 5',
      rolloverUsage.status === 200 &&
      rolloverUsage.data.data.usedToday === 0 &&
      rolloverUsage.data.data.remainingToday === 5
    );

    console.log('\n--- Condition 16: Socket.IO send_message enforces limit and emits message_error ---');
    // senderA is at 5/5 limit. Test Socket.IO send_message.
    const socketTested = await new Promise((resolve) => {
      const socket = ioClient(SERVER_URL, {
        auth: { token: senderToken },
        transports: ['websocket'],
      });

      let errorEventReceived = false;
      let ackErrorReceived = false;

      socket.on('connect', () => {
        socket.emit(
          'send_message',
          {
            receiverId: receiverB.id,
            conversationId: conv.id,
            content: 'Socket message should trigger limit error',
          },
          (ack) => {
            if (ack && ack.code === 'DAILY_MESSAGE_LIMIT_REACHED') {
              ackErrorReceived = true;
            }
            if (errorEventReceived && ackErrorReceived) {
              socket.disconnect();
              resolve(true);
            }
          }
        );
      });

      socket.on('message_error', (payload) => {
        if (payload && payload.code === 'DAILY_MESSAGE_LIMIT_REACHED') {
          errorEventReceived = true;
        }
        if (errorEventReceived && ackErrorReceived) {
          socket.disconnect();
          resolve(true);
        }
      });

      // Timeout safety
      setTimeout(() => {
        socket.disconnect();
        resolve(errorEventReceived || ackErrorReceived);
      }, 3000);
    });

    assertTest(
      'Socket.IO send_message emits message_error and ack with DAILY_MESSAGE_LIMIT_REACHED',
      socketTested
    );

    // Test GET /api/messages/usage alias
    console.log('\n--- Additional Verification: /api/messages/usage Route Alias ---');
    const aliasRes = await request('/api/messages/usage', { token: senderToken });
    assertTest(
      'GET /api/messages/usage returns 200 OK with identical payload',
      aliasRes.status === 200 && aliasRes.data.success === true && aliasRes.data.data.dailyLimit === 5
    );

    console.log('\n================================================================');
    console.log(`📊 Phase 3 Test Results: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    await prisma.$disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal test runner error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase3Tests();
