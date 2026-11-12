const http = require('http');

async function postLogin(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getMe(token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Dedicated Login Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assertTest(name, condition) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  try {
    // 1. Empty fields check
    const resEmpty = await postLogin({ identifier: '', password: '' });
    assertTest(
      'Empty fields return 400 with "Email/Mobile and Password are required"',
      resEmpty.status === 400 && resEmpty.data.message === 'Email/Mobile and Password are required'
    );

    // 2. Empty password check
    const resEmptyPass = await postLogin({ identifier: 'admin@matrimonial.com', password: '' });
    assertTest(
      'Empty password returns 400 with "Email/Mobile and Password are required"',
      resEmptyPass.status === 400 && resEmptyPass.data.message === 'Email/Mobile and Password are required'
    );

    // 3. Invalid password check
    const resInvalidPass = await postLogin({ identifier: 'admin@matrimonial.com', password: 'WrongPassword!999' });
    assertTest(
      'Invalid password returns 401 with "Invalid email or password"',
      resInvalidPass.status === 401 && resInvalidPass.data.message === 'Invalid email or password'
    );

    // 4. Manually entered email and password login (Admin)
    const resAdmin = await postLogin({ identifier: 'admin@matrimonial.com', password: 'Password@123' });
    assertTest(
      'Email login with identifier (Admin) succeeds with 200 & JWT',
      resAdmin.status === 200 &&
        resAdmin.data.success === true &&
        resAdmin.data.data.token &&
        resAdmin.data.data.user.role === 'ADMIN'
    );

    // 5. Email login via email property payload (autofill / legacy client payload)
    const resEmailProp = await postLogin({ email: 'ananya.sharma@example.com', password: 'Password@123' });
    assertTest(
      'Email login via { email, password } succeeds with 200 & JWT',
      resEmailProp.status === 200 &&
        resEmailProp.data.success === true &&
        resEmailProp.data.data.token &&
        resEmailProp.data.data.user.email === 'ananya.sharma@example.com'
    );

    // 6. Mobile login with country code (+919811122211)
    const resMobileExact = await postLogin({ identifier: '+919811122211', password: 'Password@123' });
    assertTest(
      'Mobile login with full country code (+919811122211) succeeds',
      resMobileExact.status === 200 &&
        resMobileExact.data.success === true &&
        resMobileExact.data.data.user.email === 'aditya.verma@example.com'
    );

    // 7. Mobile login with 10 digits without country code (9811122211)
    const resMobile10Digits = await postLogin({ identifier: '9811122211', password: 'Password@123' });
    assertTest(
      'Mobile login with 10 digits (9811122211) resolves user and succeeds',
      resMobile10Digits.status === 200 &&
        resMobile10Digits.data.success === true &&
        resMobile10Digits.data.data.user.email === 'aditya.verma@example.com'
    );

    // 8. Mobile login via mobile property payload { mobile, password }
    const resMobileProp = await postLogin({ mobile: '9811122211', password: 'Password@123' });
    assertTest(
      'Mobile login via { mobile, password } succeeds with 200',
      resMobileProp.status === 200 &&
        resMobileProp.data.success === true &&
        resMobileProp.data.data.user.email === 'aditya.verma@example.com'
    );

    // 9. Mobile login with spaces/formatting (+91 98111 22211)
    const resMobileFormatted = await postLogin({ identifier: '+91 98111 22211', password: 'Password@123' });
    assertTest(
      'Mobile login with spaces/formatting (+91 98111 22211) succeeds',
      resMobileFormatted.status === 200 &&
        resMobileFormatted.data.success === true &&
        resMobileFormatted.data.data.user.email === 'aditya.verma@example.com'
    );

    // 10. Browser-autofilled combined payload { identifier, email, mobile, password }
    const resAutofillCombined = await postLogin({
      identifier: 'ananya.sharma@example.com',
      email: 'ananya.sharma@example.com',
      password: 'Password@123',
    });
    assertTest(
      'Simulated browser-autofilled combined payload succeeds',
      resAutofillCombined.status === 200 && resAutofillCombined.data.success === true
    );

    // 11. JWT token verification via /api/auth/me
    const token = resAdmin.data.data.token;
    const resMe = await getMe(token);
    assertTest(
      'JWT token valid and GET /api/auth/me returns authenticated user',
      resMe.status === 200 &&
        resMe.data.success === true &&
        (resMe.data.data.role === 'ADMIN' || resMe.data.data.user?.role === 'ADMIN')
    );

    console.log(`\n==============================================`);
    console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`==============================================\n`);

    if (passed === total) {
      console.log('🎉 ALL LOGIN VALIDATION AND AUTH TESTS PASSED PERFECTLY!');
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
