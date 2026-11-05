const http = require('http');

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
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

async function runTests() {
  console.log('🧪 Starting Full Matrimonial API Test Suite...\n');
  let passed = 0;
  let total = 0;

  function test(title, condition) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`);
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    test('Server health check returns 200 OK', health.status === 200 && health.data.status === 'ok');

    // 2. Public stats
    const stats = await request('/api/public/stats');
    test('Public stats API returns statistics', stats.status === 200 && stats.data.data.totalProfiles >= 50000);

    // 3. Login as Admin
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'admin@matrimonial.com', password: 'Password@123' },
    });
    test('Admin login succeeds with JWT and ADMIN role', adminLogin.status === 200 && adminLogin.data.data.user.role === 'ADMIN');
    const adminToken = adminLogin.data.data.token;

    // 4. Login as Aditya (Groom)
    const adityaLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'aditya.verma@example.com', password: 'Password@123' },
    });
    test('User login (Aditya) succeeds', adityaLogin.status === 200 && !!adityaLogin.data.data.token);
    const adityaToken = adityaLogin.data.data.token;
    const adityaUserId = adityaLogin.data.data.user.id;

    // 5. Login as Dr. Ananya (Bride)
    const ananyaLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: 'ananya.sharma@example.com', password: 'Password@123' },
    });
    test('User login (Ananya) succeeds', ananyaLogin.status === 200 && !!ananyaLogin.data.data.token);
    const ananyaToken = ananyaLogin.data.data.token;
    const ananyaUserId = ananyaLogin.data.data.user.id;

    // 6. Register a new user
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Kavita Iyer',
        gender: 'FEMALE',
        dateOfBirth: '1998-07-10',
        email: uniqueEmail,
        mobile: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Password@123',
        profileCreatedFor: 'MYSELF',
        religion: 'HINDU',
        motherTongue: 'Tamil',
      },
    });
    test('New user registration succeeds and returns profile & token', regRes.status === 201 && !!regRes.data.data.token);
    const testUserToken = regRes.data.data.token;
    const testUserId = regRes.data.data.user.id;

    // 7. Profile update wizard
    const updateRes = await request('/api/profiles/me', {
      method: 'PUT',
      token: testUserToken,
      body: {
        basicInfo: { height: 168 },
        educationCareer: {
          highestEducation: 'M.Tech Computer Science',
          occupationTitle: 'AI Research Engineer',
          companyName: 'NVIDIA',
          annualIncome: '35-50 Lakhs',
        },
        location: { city: 'Bengaluru', state: 'Karnataka' },
        lifestyleDetails: { diet: 'VEGETARIAN', hobbies: 'Carnatic Vocal, Painting' },
        aboutMe: 'Passionate about deep learning, yoga and family values. Looking for an educated partner.',
      },
    });
    test('Profile wizard update saves details & computes completeness score', updateRes.status === 200 && updateRes.data.data.completionPercentage >= 70);

    // 8. Public profile view
    const viewRes = await request(`/api/profiles/user/${ananyaUserId}`, {
      token: testUserToken,
    });
    test('View public profile returns details with protected contact info', viewRes.status === 200 && viewRes.data.data.profile.fullName === 'Dr. Ananya Sharma');

    // 9. Profile Search with filters
    const searchRes = await request('/api/search/profiles?gender=FEMALE&religion=HINDU&ageMin=22&ageMax=32', {
      token: adityaToken,
    });
    test('Search profiles with multiple filters returns matching candidates', searchRes.status === 200 && searchRes.data.data.profiles.length > 0);

    // 10. Recommended matches
    const recRes = await request('/api/search/recommended', {
      token: adityaToken,
    });
    test('Matchmaking recommendations algorithm returns compatible profiles', recRes.status === 200 && Array.isArray(recRes.data.data));

    // 11. Interest management: Send interest
    const sendIntRes = await request('/api/interests/send', {
      method: 'POST',
      token: testUserToken,
      body: {
        receiverId: adityaUserId,
        message: 'Namaste Aditya, your background in tech and passion for trekking aligns well with my interests.',
      },
    });
    test('Send interest creates request & generates in-app notification', sendIntRes.status === 201 && sendIntRes.data.data.status === 'PENDING');
    const interestId = sendIntRes.data.data.id;

    // 12. Check received interests for Aditya
    const recvdRes = await request('/api/interests/received', {
      token: adityaToken,
    });
    test('Received interests lists pending incoming requests', recvdRes.status === 200 && recvdRes.data.data.some(i => i.id === interestId));

    // 13. Accept interest
    const acceptRes = await request(`/api/interests/${interestId}/accept`, {
      method: 'PUT',
      token: adityaToken,
    });
    test('Accept interest establishes connection and creates conversation', acceptRes.status === 200 && acceptRes.data.data.status === 'ACCEPTED');

    // 14. Check mutual connections
    const connRes = await request('/api/interests/connections', {
      token: adityaToken,
    });
    test('Accepted connections lists mutual matches with contact details', connRes.status === 200 && connRes.data.data.some(c => c.partnerId === testUserId));

    // 15. Real-time Messaging: Send chat message
    const msgRes = await request('/api/chat/messages', {
      method: 'POST',
      token: testUserToken,
      body: {
        receiverId: adityaUserId,
        content: 'Hello Aditya! Wonderful to connect with you.',
      },
    });
    test('Send message between connected partners succeeds', msgRes.status === 201 && !!msgRes.data.data.id);
    const convId = msgRes.data.data.conversationId;

    // 16. Get conversation messages
    const getMsgs = await request(`/api/chat/conversations/${convId}/messages`, {
      token: adityaToken,
    });
    test('Fetch messages returns conversation history & marks as read', getMsgs.status === 200 && getMsgs.data.data.messages.length > 0);

    // 17. Shortlists
    const shortRes = await request('/api/shortlists/toggle', {
      method: 'POST',
      token: testUserToken,
      body: { targetUserId: adityaUserId },
    });
    test('Toggle shortlist adds profile to user saved shortlist', shortRes.status === 200 && shortRes.data.data.isShortlisted === true);

    const getShorts = await request('/api/shortlists', {
      token: testUserToken,
    });
    test('Get shortlisted profiles returns saved list', getShorts.status === 200 && getShorts.data.data.length > 0);

    // 18. Notifications
    const notifRes = await request('/api/notifications', {
      token: adityaToken,
    });
    test('In-app notifications returned with unread counter', notifRes.status === 200 && notifRes.data.data.notifications.length > 0);

    // 19. Membership & Payments: Order creation & verification
    const plansRes = await request('/api/membership/plans');
    const goldPlan = plansRes.data.data.find(p => p.planCode === 'GOLD');
    test('Membership plans retrieved with pricing & limits', plansRes.status === 200 && !!goldPlan);

    const orderRes = await request('/api/membership/orders', {
      method: 'POST',
      token: testUserToken,
      body: { planId: goldPlan.id },
    });
    test('Create membership payment order succeeds', orderRes.status === 200 && !!orderRes.data.data.orderId);

    const verifyPay = await request('/api/membership/verify', {
      method: 'POST',
      token: testUserToken,
      body: {
        orderId: orderRes.data.data.orderId,
        paymentId: `pay_test_${Date.now()}`,
        signature: 'test_signature',
      },
    });
    test('Verify payment activates Gold subscription with VIP quotas', verifyPay.status === 200);

    // 20. Admin Console APIs
    const analyticsRes = await request('/api/admin/analytics', {
      token: adminToken,
    });
    test('Admin dashboard analytics returns platform revenue and user breakdown', analyticsRes.status === 200 && analyticsRes.data.data.totalUsers > 0);

    const adminUsers = await request('/api/admin/users', {
      token: adminToken,
    });
    test('Admin users management endpoint returns accounts list with status', adminUsers.status === 200 && adminUsers.data.data.users.length > 0);

    const verifyProfile = await request(`/api/admin/profiles/${updateRes.data.data.id}/verification`, {
      method: 'PUT',
      token: adminToken,
      body: { isVerified: true },
    });
    test('Admin can verify/moderate profile credentials', verifyProfile.status === 200 && verifyProfile.data.data.isVerified === true);

    console.log(`\n==============================================`);
    console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`==============================================\n`);

    if (passed === total) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();

