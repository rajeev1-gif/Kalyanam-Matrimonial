const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records if any
  await prisma.adminActivityLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.shortlist.deleteMany({});
  await prisma.profileView.deleteMany({});
  await prisma.interest.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.profilePhoto.deleteMany({});
  await prisma.partnerPreference.deleteMany({});
  await prisma.lifestyleDetails.deleteMany({});
  await prisma.familyDetails.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.educationCareer.deleteMany({});
  await prisma.religionCommunity.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.successStory.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Membership Plans
  console.log('Creating Membership Plans...');
  const planFree = await prisma.membershipPlan.create({
    data: {
      name: 'Free Starter',
      planCode: 'FREE',
      price: 0,
      durationMonths: 1,
      interestLimit: 10,
      profileViewLimit: 50,
      contactViewLimit: 2,
      canDirectMessage: false,
      priorityListing: false,
      features: JSON.stringify([
        'Create and verify profile',
        'Browse all verified profiles',
        'Send up to 10 interests per month',
        'View 2 phone contacts',
        'Standard search filters'
      ]),
      isActive: true,
    }
  });

  const planSilver = await prisma.membershipPlan.create({
    data: {
      name: 'Silver Connect',
      planCode: 'SILVER',
      price: 2499,
      durationMonths: 3,
      interestLimit: 50,
      profileViewLimit: 200,
      contactViewLimit: 25,
      canDirectMessage: true,
      priorityListing: false,
      features: JSON.stringify([
        'Everything in Free',
        'Send up to 50 interests',
        'Unlock 25 phone & email contacts',
        'Direct chat with accepted matches',
        'Who viewed your profile history',
        'Dedicated customer support'
      ]),
      isActive: true,
    }
  });

  const planGold = await prisma.membershipPlan.create({
    data: {
      name: 'Gold Privilege',
      planCode: 'GOLD',
      price: 4999,
      durationMonths: 6,
      interestLimit: 150,
      profileViewLimit: 500,
      contactViewLimit: 75,
      canDirectMessage: true,
      priorityListing: true,
      features: JSON.stringify([
        'Everything in Silver',
        'Send 150 interests',
        'Unlock 75 verified contacts',
        'Featured profile boost in search',
        'Horoscope matching assistance',
        'Spotlight badge on search cards',
        'Direct relationship manager consultation'
      ]),
      isActive: true,
    }
  });

  const planPlatinum = await prisma.membershipPlan.create({
    data: {
      name: 'Platinum VIP Elite',
      planCode: 'PLATINUM',
      price: 8999,
      durationMonths: 12,
      interestLimit: 999,
      profileViewLimit: 9999,
      contactViewLimit: 200,
      canDirectMessage: true,
      priorityListing: true,
      features: JSON.stringify([
        'Everything in Gold',
        'Unlimited interests',
        'Unlock 200 verified contacts',
        'Personal Relationship Manager',
        'Handpicked weekly match recommendations',
        'Complete family background screening',
        'Top of search results placement'
      ]),
      isActive: true,
    }
  });

  // 3. Create Admin User
  console.log('Creating Admin Account...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@matrimonial.com',
      mobile: '+919876543210',
      passwordHash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profileCreatedFor: 'MYSELF',
      emailVerified: true,
      mobileVerified: true,
    }
  });

  // 4. Create Demo Users and Rich Profiles
  console.log('Creating Demo Matrimonial Profiles...');

  const profilesData = [
    // --- FEMALE PROFILES ---
    {
      user: {
        email: 'ananya.sharma@example.com',
        mobile: '+919811122201',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Dr. Ananya Sharma',
        gender: 'FEMALE',
        dateOfBirth: new Date('1997-04-15'),
        height: 165,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Warm, compassionate and career-oriented. Completed MBBS and MD in Pediatrics from AIIMS Delhi. Enjoy classical music, yoga, weekend baking and exploring cultural heritage sites. Looking for an educated, respectful and cheerful partner who shares strong family values.',
        profileSummary: 'Pediatrician at Apollo Hospital, Delhi. Passionate about healthcare and lifelong learning.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Brahmin', caste: 'Gaur', subCaste: 'Shandilya', motherTongue: 'Hindi', gothra: 'Kashyap', manglik: 'NO' },
      education: { highestEducation: 'MD / MBBS', educationField: 'Pediatric Medicine', collegeName: 'AIIMS New Delhi', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Senior Pediatrician', companyName: 'Apollo Hospitals', annualIncome: '25-35 Lakhs' },
      location: { country: 'India', state: 'Delhi', city: 'South Delhi', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'MODERATE', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Retired Chief Engineer, CPWD', motherOccupation: 'Professor of English Literature', brothersCount: 1, brothersMarried: 0, sistersCount: 0, sistersMarried: 0, aboutFamily: 'Close-knit nuclear family rooted in traditional ethics with an open-minded modern outlook.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'Indian Classical Music, Tennis, Yoga, Culinary Arts', interests: 'Public Health, Travel, History, Literature' },
      preference: { minAge: 27, maxAge: 32, minHeight: 172, maxHeight: 188, minIncome: '25 Lakhs and above', religions: '["HINDU"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'priya.nair@example.com',
        mobile: '+919811122202',
        profileCreatedFor: 'DAUGHTER',
      },
      profile: {
        fullName: 'Priya Nair',
        gender: 'FEMALE',
        dateOfBirth: new Date('1998-08-22'),
        height: 162,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Senior Product Designer at a leading fintech unicorn in Bengaluru. Completed Bachelor of Design from NID Ahmedabad. Passionate about art exhibitions, Kathakali, hiking and specialty coffee. Believes in mutual respect and emotional intelligence in a relationship.',
        profileSummary: 'NID graduate, Senior Product Designer at Razorpay Bengaluru.',
        isCompleted: true,
        completionPercentage: 95,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Nair', caste: 'Menon', motherTongue: 'Malayalam', manglik: 'NO' },
      education: { highestEducation: 'B.Des (Design)', educationField: 'Interaction Design', collegeName: 'NID Ahmedabad', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Staff UX Designer', companyName: 'Razorpay', annualIncome: '30-40 Lakhs' },
      location: { country: 'India', state: 'Karnataka', city: 'Bengaluru', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'LIBERAL', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Naval Commander (Retd)', motherOccupation: 'High School Principal', brothersCount: 0, brothersMarried: 0, sistersCount: 1, sistersMarried: 1, aboutFamily: 'Respectable defense background, well-educated and culturally grounded.' },
      lifestyle: { diet: 'EGGETARIAN', smoking: 'NO', drinking: 'OCCASIONALLY', hobbies: 'UI Illustration, Pottery, Trekking, Badminton', interests: 'Design Thinking, World Cinema, Animal Welfare' },
      preference: { minAge: 27, maxAge: 33, minHeight: 168, maxHeight: 185, minIncome: '20 Lakhs and above', religions: '["HINDU"]', diet: 'ANY' }
    },
    {
      user: {
        email: 'simran.kaur@example.com',
        mobile: '+919811122203',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Simran Kaur',
        gender: 'FEMALE',
        dateOfBirth: new Date('1996-11-10'),
        height: 168,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Chartered Accountant working with Deloitte Global. Cheerful, ambitious and caring. I enjoy Gurbani kirtan, long road trips, interior styling and marathon running. Seeking a partner who is grounded, driven, kind-hearted and cherishes family togetherness.',
        profileSummary: 'Chartered Accountant (Deloitte), marathon runner, Chandigarh & Gurugram.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'SIKH', community: 'Khatri', caste: 'Arora', motherTongue: 'Punjabi', manglik: 'DONT_KNOW' },
      education: { highestEducation: 'Chartered Accountant (CA) & B.Com', educationField: 'Finance & Taxation', collegeName: 'ICAI / SRCC Delhi', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Manager - Mergers & Acquisitions', companyName: 'Deloitte India', annualIncome: '25-35 Lakhs' },
      location: { country: 'India', state: 'Haryana', city: 'Gurugram', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'JOINT', familyValues: 'MODERATE', familyStatus: 'AFFLUENT', fatherOccupation: 'Industrialist (Textiles)', motherOccupation: 'Homemaker', brothersCount: 1, brothersMarried: 1, sistersCount: 0, sistersMarried: 0, aboutFamily: 'Well-established business family based in Chandigarh with modern family values.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'Marathon Running, Piano, Interior Decor, Travel', interests: 'Financial Markets, Fitness, Photography' },
      preference: { minAge: 28, maxAge: 34, minHeight: 175, maxHeight: 190, minIncome: '25 Lakhs and above', religions: '["SIKH", "HINDU"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'fatima.khan@example.com',
        mobile: '+919811122204',
        profileCreatedFor: 'SISTER',
      },
      profile: {
        fullName: 'Fatima Zohra Khan',
        gender: 'FEMALE',
        dateOfBirth: new Date('1997-02-18'),
        height: 160,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Software Architect at Microsoft Hyderabad. B.Tech Computer Science from IIIT Hyderabad. Humble, pious, values honesty and humor. Loves reading Urdu poetry, mentoring students in STEM and baking gourmet pastries.',
        profileSummary: 'IIIT Hyderabad alumna, Software Architect at Microsoft.',
        isCompleted: true,
        completionPercentage: 90,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'MUSLIM', community: 'Sunni', caste: 'Pathan', motherTongue: 'Urdu', manglik: 'DONT_KNOW' },
      education: { highestEducation: 'B.Tech / M.Tech Dual Degree', educationField: 'Computer Science', collegeName: 'IIIT Hyderabad', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Senior Software Architect', companyName: 'Microsoft', annualIncome: '40-50 Lakhs' },
      location: { country: 'India', state: 'Telangana', city: 'Hyderabad', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'TRADITIONAL', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Senior Civil Judge (Retd)', motherOccupation: 'Senior Research Scientist', brothersCount: 1, brothersMarried: 1, sistersCount: 1, sistersMarried: 0, aboutFamily: 'Educated, cultured and dignified family residing in Jubilee Hills, Hyderabad.' },
      lifestyle: { diet: 'NON_VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'Urdu Poetry, Raspberry Pi Robotics, Tennis', interests: 'Artificial Intelligence, Astronomy, Baking' },
      preference: { minAge: 28, maxAge: 35, minHeight: 170, maxHeight: 188, minIncome: '30 Lakhs and above', religions: '["MUSLIM"]', diet: 'NON_VEGETARIAN' }
    },
    {
      user: {
        email: 'rhea.fernandes@example.com',
        mobile: '+919811122205',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Rhea Fernandes',
        gender: 'FEMALE',
        dateOfBirth: new Date('1995-09-05'),
        height: 167,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Corporate Lawyer at an international law firm in Mumbai. Passionate about civil rights, marine conservation and acoustic guitar. Love cozy Sunday brunches, theater and exploring new destinations. Looking for an empathetic partner with good humor.',
        profileSummary: 'Corporate Attorney at Shardul Amarchand Mangaldas, Mumbai.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'CHRISTIAN', community: 'Catholic', caste: 'Goan Catholic', motherTongue: 'English', manglik: 'DONT_KNOW' },
      education: { highestEducation: 'LL.M (Corporate Law)', educationField: 'International Business Law', collegeName: 'NLSIU Bengaluru / Oxford', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Principal Legal Associate', companyName: 'SAM & Co.', annualIncome: '35-45 Lakhs' },
      location: { country: 'India', state: 'Maharashtra', city: 'Mumbai', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'LIBERAL', familyStatus: 'AFFLUENT', fatherOccupation: 'Architectural Consultant', motherOccupation: 'Fashion Curator', brothersCount: 1, brothersMarried: 0, sistersCount: 0, sistersMarried: 0, aboutFamily: 'Broad-minded, artistic family based in Bandra, Mumbai.' },
      lifestyle: { diet: 'NON_VEGETARIAN', smoking: 'NO', drinking: 'OCCASIONALLY', hobbies: 'Acoustic Guitar, Scuba Diving, Playwriting, Tennis', interests: 'Art, Environmental Conservation, Literature' },
      preference: { minAge: 29, maxAge: 35, minHeight: 172, maxHeight: 188, minIncome: '30 Lakhs and above', religions: '["CHRISTIAN"]', diet: 'ANY' }
    },
    {
      user: {
        email: 'tanvi.jain@example.com',
        mobile: '+919811122206',
        profileCreatedFor: 'SON',
      },
      profile: {
        fullName: 'Tanvi Jain',
        gender: 'FEMALE',
        dateOfBirth: new Date('1999-01-25'),
        height: 164,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Data Scientist at Amazon, graduated from BITS Pilani. Simple, warm, family-oriented and ambitious. I practice Jain dietary principles strictly. Enjoy classical painting, gardening, astronomy and badminton.',
        profileSummary: 'BITS Pilani alumna, Data Scientist at Amazon Pune.',
        isCompleted: true,
        completionPercentage: 95,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'JAIN', community: 'Shwetambar', caste: 'Oswal', motherTongue: 'Gujarati', manglik: 'NO' },
      education: { highestEducation: 'B.E. & M.Sc', educationField: 'Computer Science & Mathematics', collegeName: 'BITS Pilani', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Data Scientist II', companyName: 'Amazon', annualIncome: '25-35 Lakhs' },
      location: { country: 'India', state: 'Maharashtra', city: 'Pune', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'TRADITIONAL', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Senior Chartered Accountant', motherOccupation: 'Homemaker', brothersCount: 0, brothersMarried: 0, sistersCount: 1, sistersMarried: 0, aboutFamily: 'Traditional Jain family with strong cultural roots and emphasis on education.' },
      lifestyle: { diet: 'JAIN', smoking: 'NO', drinking: 'NO', hobbies: 'Oil Painting, Yoga, Astronomy, Gardening', interests: 'Machine Learning, Ethics, Philosophy' },
      preference: { minAge: 26, maxAge: 31, minHeight: 170, maxHeight: 185, minIncome: '25 Lakhs and above', religions: '["JAIN"]', diet: 'JAIN' }
    },

    // --- MALE PROFILES ---
    {
      user: {
        email: 'aditya.verma@example.com',
        mobile: '+919811122211',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Aditya Verma',
        gender: 'MALE',
        dateOfBirth: new Date('1995-06-14'),
        height: 180,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Engineering Manager at Google Bengaluru. Alumnus of IIT Bombay (Computer Science). Calm, ambitious, family-first person who loves hiking the Western Ghats, playing badminton, and brewing pour-over coffee. Seeking a partner who is progressive, communicative and values laughter.',
        profileSummary: 'IIT Bombay CS graduate, Engineering Manager at Google Bengaluru.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Kayastha', caste: 'Srivastava', motherTongue: 'Hindi', manglik: 'NO' },
      education: { highestEducation: 'B.Tech Computer Science', educationField: 'Computer Engineering', collegeName: 'IIT Bombay', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Engineering Manager', companyName: 'Google', annualIncome: '60-75 Lakhs' },
      location: { country: 'India', state: 'Karnataka', city: 'Bengaluru', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'MODERATE', familyStatus: 'AFFLUENT', fatherOccupation: 'IAS Officer (Retd)', motherOccupation: 'Child Psychologist', brothersCount: 1, brothersMarried: 1, sistersCount: 0, sistersMarried: 0, aboutFamily: 'Distinguished administrative service background, cultured, respectful and warm.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'OCCASIONALLY', hobbies: 'Badminton, High-altitude Trekking, Specialty Coffee, Chess', interests: 'Cloud Computing, Robotics, Astrophysics' },
      preference: { minAge: 25, maxAge: 30, minHeight: 160, maxHeight: 175, minIncome: '20 Lakhs and above', religions: '["HINDU"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'rohan.mehta@example.com',
        mobile: '+919811122212',
        profileCreatedFor: 'SON',
      },
      profile: {
        fullName: 'Rohan Mehta',
        gender: 'MALE',
        dateOfBirth: new Date('1994-03-20'),
        height: 178,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Vice President at Goldman Sachs Mumbai. IIM Ahmedabad (MBA) and B.Com (Hons) SRCC. Grounded, affectionate, travel enthusiast and fitness lover. Looking for an accomplished, understanding and cheerful companion to build a loving home with.',
        profileSummary: 'IIM Ahmedabad MBA, VP at Goldman Sachs Mumbai.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Gujarati', caste: 'Vaishnav', motherTongue: 'Gujarati', manglik: 'NO' },
      education: { highestEducation: 'MBA', educationField: 'Finance & Strategy', collegeName: 'IIM Ahmedabad / SRCC Delhi', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Vice President, Investment Banking', companyName: 'Goldman Sachs', annualIncome: '75-90 Lakhs' },
      location: { country: 'India', state: 'Maharashtra', city: 'Mumbai', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'JOINT', familyValues: 'MODERATE', familyStatus: 'AFFLUENT', fatherOccupation: 'Managing Director, Mehta Logistics', motherOccupation: 'Homemaker & Philanthropist', brothersCount: 1, brothersMarried: 0, sistersCount: 1, sistersMarried: 1, aboutFamily: 'Prominent business family in South Mumbai with warm values and traditional hospitality.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'CrossFit, Swimming, Squash, Golf', interests: 'Private Equity, Economics, Art Collecting' },
      preference: { minAge: 25, maxAge: 29, minHeight: 162, maxHeight: 174, minIncome: '15 Lakhs and above', religions: '["HINDU", "JAIN"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'dr.kabir.malhotra@example.com',
        mobile: '+919811122213',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Dr. Kabir Malhotra',
        gender: 'MALE',
        dateOfBirth: new Date('1993-10-12'),
        height: 183,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Cardiothoracic Surgeon at Medanta Gurugram. MS & M.Ch from PGIMER Chandigarh. Compassionate, disciplined and deeply family-oriented. Passionate about medical camps, classical piano and long cycling rides.',
        profileSummary: 'Cardiothoracic Surgeon at Medanta, PGIMER alumnus.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Khatri', caste: 'Malhotra', motherTongue: 'Punjabi', manglik: 'DONT_KNOW' },
      education: { highestEducation: 'M.Ch / MS Surgery', educationField: 'Cardiovascular Surgery', collegeName: 'PGIMER Chandigarh', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Consultant Cardiac Surgeon', companyName: 'Medanta The Medicity', annualIncome: '50-65 Lakhs' },
      location: { country: 'India', state: 'Haryana', city: 'Gurugram', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'MODERATE', familyStatus: 'AFFLUENT', fatherOccupation: 'Senior Radiologist', motherOccupation: 'Gynecologist', brothersCount: 0, brothersMarried: 0, sistersCount: 1, sistersMarried: 1, aboutFamily: 'Family of doctors based in Delhi NCR, affectionate and deeply respected.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'OCCASIONALLY', hobbies: 'Piano, Road Cycling, Scuba Diving, Reading', interests: 'Surgical Innovations, History, Philosophy' },
      preference: { minAge: 26, maxAge: 31, minHeight: 165, maxHeight: 178, minIncome: '20 Lakhs and above', religions: '["HINDU", "SIKH"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'taranjeet.singh@example.com',
        mobile: '+919811122214',
        profileCreatedFor: 'BROTHER',
      },
      profile: {
        fullName: 'Taranjeet Singh',
        gender: 'MALE',
        dateOfBirth: new Date('1994-12-04'),
        height: 185,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Founder & CEO of an AI-driven Agritech startup backed by Sequoia. Alumnus of IIT Delhi. Energetic, optimistic, grounded in Sikh traditions. Enjoys bhangra, equestrian sports, volunteering at gurudwara langar and mountain biking.',
        profileSummary: 'IIT Delhi alumnus, Agritech Founder backed by top VCs.',
        isCompleted: true,
        completionPercentage: 95,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'SIKH', community: 'Jat', caste: 'Sandhu', motherTongue: 'Punjabi', manglik: 'DONT_KNOW' },
      education: { highestEducation: 'B.Tech', educationField: 'Mechanical & Automation', collegeName: 'IIT Delhi', occupationType: 'BUSINESS', occupationTitle: 'Founder & CEO', companyName: 'KisanTech Solutions', annualIncome: '50-70 Lakhs' },
      location: { country: 'India', state: 'Punjab', city: 'Chandigarh', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'JOINT', familyValues: 'TRADITIONAL', familyStatus: 'AFFLUENT', fatherOccupation: 'Large Landholder & Ex-MLA', motherOccupation: 'Homemaker', brothersCount: 1, brothersMarried: 0, sistersCount: 1, sistersMarried: 1, aboutFamily: 'Noble, well-known family in Punjab with extensive agricultural and real estate interests.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'Equestrian / Horse Riding, Mountain Biking, Bhangra, Farming', interests: 'Agriculture, Robotics, Philanthropy' },
      preference: { minAge: 25, maxAge: 30, minHeight: 165, maxHeight: 180, minIncome: '15 Lakhs and above', religions: '["SIKH"]', diet: 'VEGETARIAN' }
    },
    {
      user: {
        email: 'arjun.reddy@example.com',
        mobile: '+919811122215',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Arjun Reddy',
        gender: 'MALE',
        dateOfBirth: new Date('1995-02-14'),
        height: 182,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Principal Cloud Architect at AWS Hyderabad. Graduated from BITS Hyderabad. Fun-loving, passionate about photography, cinema, badminton and volunteering. Looking for a bright, cheerful partner who believes in mutual growth and joy.',
        profileSummary: 'BITS alumnus, Principal Cloud Architect at AWS Hyderabad.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Reddy', caste: 'Motati', motherTongue: 'Telugu', manglik: 'NO' },
      education: { highestEducation: 'B.E. Computer Science', educationField: 'Information Systems', collegeName: 'BITS Pilani Hyderabad Campus', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Principal Cloud Architect', companyName: 'Amazon Web Services', annualIncome: '45-60 Lakhs' },
      location: { country: 'India', state: 'Telangana', city: 'Hyderabad', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'MODERATE', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Chief Engineer, Telangana Irrigation Dept', motherOccupation: 'Lecturer in Mathematics', brothersCount: 1, brothersMarried: 0, sistersCount: 0, sistersMarried: 0, aboutFamily: 'Warm-hearted, educated nuclear family residing in Gachibowli, Hyderabad.' },
      lifestyle: { diet: 'NON_VEGETARIAN', smoking: 'NO', drinking: 'OCCASIONALLY', hobbies: 'Astrophotography, Badminton, Drone Piloting, Hiking', interests: 'Cloud Architecture, South Indian History, Cinema' },
      preference: { minAge: 24, maxAge: 29, minHeight: 160, maxHeight: 175, minIncome: '15 Lakhs and above', religions: '["HINDU"]', diet: 'ANY' }
    },
    {
      user: {
        email: 'vikram.iyer@example.com',
        mobile: '+919811122216',
        profileCreatedFor: 'MYSELF',
      },
      profile: {
        fullName: 'Vikram Iyer',
        gender: 'MALE',
        dateOfBirth: new Date('1996-07-28'),
        height: 176,
        maritalStatus: 'NEVER_MARRIED',
        aboutMe: 'Quantitative Researcher at a High Frequency Trading desk in Chennai. Alumnus of IIT Madras (Electrical). Enthusiastic Carnatic violinist, avid chess player and marathon finisher. Looking for an intelligent, warm partner with shared aesthetic and intellectual values.',
        profileSummary: 'IIT Madras alumnus, Quantitative Trader in Chennai, Carnatic Violinist.',
        isCompleted: true,
        completionPercentage: 100,
        isVerified: true,
      },
      photos: [
        { url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=800', isProfilePicture: true },
        { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800', isProfilePicture: false }
      ],
      religion: { religion: 'HINDU', community: 'Brahmin', caste: 'Iyer', subCaste: 'Vadama', motherTongue: 'Tamil', gothra: 'Kaundinya', manglik: 'NO' },
      education: { highestEducation: 'B.Tech & M.Tech', educationField: 'Electrical Engineering & Signal Processing', collegeName: 'IIT Madras', occupationType: 'PRIVATE_SECTOR', occupationTitle: 'Lead Quantitative Researcher', companyName: 'Tower Research Capital', annualIncome: '65-80 Lakhs' },
      location: { country: 'India', state: 'Tamil Nadu', city: 'Chennai', citizenship: 'Indian', residentialStatus: 'CITIZEN' },
      family: { familyType: 'NUCLEAR', familyValues: 'TRADITIONAL', familyStatus: 'UPPER_MIDDLE_CLASS', fatherOccupation: 'Senior Scientist, ISRO (Retd)', motherOccupation: 'Carnatic Vocalist & Music Teacher', brothersCount: 0, brothersMarried: 0, sistersCount: 1, sistersMarried: 1, aboutFamily: 'Cultured TamBrahm family with profound appreciation for arts, science and dharma.' },
      lifestyle: { diet: 'VEGETARIAN', smoking: 'NO', drinking: 'NO', hobbies: 'Carnatic Violin, Competitive Chess, Distance Running, Filter Coffee', interests: 'Stochastic Calculus, Indian Classical Music, Sanskrit' },
      preference: { minAge: 24, maxAge: 29, minHeight: 158, maxHeight: 172, minIncome: '15 Lakhs and above', religions: '["HINDU"]', diet: 'VEGETARIAN' }
    }
  ];

  const createdUsers = [];

  for (const item of profilesData) {
    const user = await prisma.user.create({
      data: {
        email: item.user.email,
        mobile: item.user.mobile,
        passwordHash: passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        profileCreatedFor: item.user.profileCreatedFor,
        emailVerified: true,
        mobileVerified: true,
        profile: {
          create: {
            ...item.profile,
            religionCommunity: { create: item.religion },
            educationCareer: { create: item.education },
            location: { create: item.location },
            familyDetails: { create: item.family },
            lifestyleDetails: { create: item.lifestyle },
            partnerPreference: { create: item.preference },
            photos: {
              create: item.photos.map((p, idx) => ({
                url: p.url,
                isProfilePicture: p.isProfilePicture,
                orderIndex: idx,
                status: 'APPROVED'
              }))
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    createdUsers.push(user);
  }

  console.log(`Created ${createdUsers.length} user profiles.`);

  // 5. Attach Subscriptions to key users
  console.log('Attaching subscriptions...');
  // Aditya Verma has Gold
  await prisma.subscription.create({
    data: {
      userId: createdUsers[6].id,
      planId: planGold.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      interestsRemaining: 145,
      viewsRemaining: 480,
      contactsRemaining: 70,
    }
  });

  // Dr. Ananya Sharma has Silver
  await prisma.subscription.create({
    data: {
      userId: createdUsers[0].id,
      planId: planSilver.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      interestsRemaining: 45,
      viewsRemaining: 190,
      contactsRemaining: 23,
    }
  });

  // Free subscriptions for others
  for (let i = 1; i < createdUsers.length; i++) {
    if (i !== 6) {
      await prisma.subscription.create({
        data: {
          userId: createdUsers[i].id,
          planId: planFree.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          interestsRemaining: 10,
          viewsRemaining: 50,
          contactsRemaining: 2,
        }
      });
    }
  }

  // 6. Create realistic Interactions: Interests, Shortlists, Views, Conversations
  console.log('Creating sample connections, interests, and chats...');

  // Aditya Verma (index 6) sent Interest to Dr. Ananya Sharma (index 0) -> ACCEPTED
  await prisma.interest.create({
    data: {
      senderId: createdUsers[6].id,
      receiverId: createdUsers[0].id,
      status: 'ACCEPTED',
      message: 'Namaste Ananya ji, I found your profile deeply inspiring. Would love to connect and introduce our families.',
    }
  });

  // Rohan Mehta (index 7) sent Interest to Priya Nair (index 1) -> PENDING
  await prisma.interest.create({
    data: {
      senderId: createdUsers[7].id,
      receiverId: createdUsers[1].id,
      status: 'PENDING',
      message: 'Hello Priya, your work in product design is wonderful! Let us connect if our preferences align.',
    }
  });

  // Vikram Iyer (index 11) sent Interest to Dr. Ananya Sharma (index 0) -> PENDING
  await prisma.interest.create({
    data: {
      senderId: createdUsers[11].id,
      receiverId: createdUsers[0].id,
      status: 'PENDING',
      message: 'Vanakkam Ananya, your profile reflects immense grace and education. Looking forward to connecting.',
    }
  });

  // Shortlists
  await prisma.shortlist.create({
    data: {
      userId: createdUsers[6].id,
      shortlistedUserId: createdUsers[0].id,
    }
  });
  await prisma.shortlist.create({
    data: {
      userId: createdUsers[6].id,
      shortlistedUserId: createdUsers[2].id, // Simran Kaur
    }
  });
  await prisma.shortlist.create({
    data: {
      userId: createdUsers[0].id,
      shortlistedUserId: createdUsers[6].id,
    }
  });

  // Profile Views
  await prisma.profileView.create({
    data: {
      viewerId: createdUsers[6].id,
      viewedUserId: createdUsers[0].id,
    }
  });
  await prisma.profileView.create({
    data: {
      viewerId: createdUsers[7].id,
      viewedUserId: createdUsers[0].id,
    }
  });
  await prisma.profileView.create({
    data: {
      viewerId: createdUsers[0].id,
      viewedUserId: createdUsers[6].id,
    }
  });

  // Conversation between Aditya Verma (6) and Ananya Sharma (0)
  const conversation = await prisma.conversation.create({
    data: {
      user1Id: createdUsers[6].id,
      user2Id: createdUsers[0].id,
      lastMessageAt: new Date(),
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: createdUsers[6].id,
      content: 'Hello Ananya! Thank you for accepting my interest. How is your day at Apollo Hospital going?',
      isRead: true,
      readAt: new Date(),
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: createdUsers[0].id,
      content: 'Hello Aditya! It has been quite busy in pediatrics today. Thank you for reaching out, I read through your profile and was very impressed by your journey with IIT and Google.',
      isRead: true,
      readAt: new Date(),
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: createdUsers[6].id,
      content: 'That is so kind of you! Both our families seem to share very similar values. Would you like to have a brief phone call or video chat this weekend?',
      isRead: false,
    }
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'INTEREST_ACCEPTED',
      title: 'Interest Accepted',
      message: 'Aditya Verma and you are now connected! You can start messaging.',
      link: '/dashboard/messages',
      isRead: false,
    }
  });
  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'NEW_MESSAGE',
      title: 'New Message from Aditya',
      message: 'Would you like to have a brief phone call or video chat this weekend?',
      link: '/dashboard/messages',
      isRead: false,
    }
  });
  await prisma.notification.create({
    data: {
      userId: createdUsers[1].id,
      type: 'INTEREST_RECEIVED',
      title: 'New Interest Request',
      message: 'Rohan Mehta has expressed interest in your profile.',
      link: '/dashboard/received-interests',
      isRead: false,
    }
  });

  // 7. Create Success Stories
  console.log('Creating Success Stories...');
  const successStories = [
    {
      groomName: 'Devrat & Radhika Singhania',
      brideName: 'Radhika Singhania',
      weddingDate: new Date('2024-11-20'),
      story: 'We connected on Kalyanam after our parents shortlisted each other\'s profiles. What began as polite weekend calls soon turned into the realization that we share identical values, love for classical arts, and lifelong ambitions. Our wedding in Udaipur was a dream come true for both families!',
      couplePhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      isActive: true,
    },
    {
      groomName: 'Dr. Kunal & Dr. Meera Deshmukh',
      brideName: 'Dr. Meera Deshmukh',
      weddingDate: new Date('2024-12-14'),
      story: 'As doctors with demanding schedules, finding someone who genuinely understands the lifestyle felt impossible. Kalyanam\'s education and profession filters brought us together. We bonded over our shared passion for healthcare and tied the knot with our families\' joyful blessings.',
      couplePhoto: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      isActive: true,
    },
    {
      groomName: 'Harshvardhan & Sneha Kapoor',
      brideName: 'Sneha Kapoor',
      weddingDate: new Date('2025-01-18'),
      story: 'Harsh was in London and I was in Bengaluru. Kalyanam verified profiles gave our parents absolute peace of mind. After months of virtual coffee dates and family video calls, we celebrated our grand Punjabi-Brahmin wedding in Jaipur. Forever thankful!',
      couplePhoto: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      isActive: true,
    }
  ];

  for (const story of successStories) {
    await prisma.successStory.create({ data: story });
  }

  // 8. Create Testimonials
  console.log('Creating Testimonials...');
  const testimonials = [
    {
      authorName: 'Sunita & Rameshwar Agarwal',
      authorLocation: 'Jaipur, Rajasthan',
      quote: 'We were looking for a cultured match for our son who is in Seattle. Kalyanam provided verified profiles, excellent privacy settings and courteous relationship assistance. Within 4 months, we found our wonderful daughter-in-law.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      isActive: true,
    },
    {
      authorName: 'Varun & Shalini Khurana',
      authorLocation: 'Gurugram, Haryana',
      quote: 'The search filters and family background details are leagues ahead of other portals. It feels respectful, secure and tailored for families seeking serious, lifelong alliances. 10/10 recommend!',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      isActive: true,
    },
    {
      authorName: 'Brigadier K. S. Pillai (Retd)',
      authorLocation: 'Kochi, Kerala',
      quote: 'The level of authenticity and photo moderation on Kalyanam is exemplary. As a father, privacy was my number one priority, and the platform gave our daughter complete control over who views her contact information.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      isActive: true,
    }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // 9. Create FAQs
  console.log('Creating FAQs...');
  const faqs = [
    {
      question: 'How does Kalyanam verify profiles and ensure security?',
      answer: 'Every profile on Kalyanam undergoes a multi-layer verification process including mobile OTP authentication, official ID validation, and manual moderation of photographs and professional credentials by our team.',
      category: 'Safety & Verification',
      orderIndex: 1,
      isActive: true,
    },
    {
      question: 'Can parents or siblings register on behalf of a bride or groom?',
      answer: 'Yes! During registration, you can choose whether you are creating the profile for Myself, Son, Daughter, Brother, Sister, Relative or Friend. The profile will clearly reflect who manages the account.',
      category: 'Registration',
      orderIndex: 2,
      isActive: true,
    },
    {
      question: 'Who can view my phone number and email address?',
      answer: 'Your contact details are strictly protected. By default, your phone number and email are concealed. Only verified members with whom an interest request has been mutually accepted (or paid members within plan allowances) can request to view contact details.',
      category: 'Privacy',
      orderIndex: 3,
      isActive: true,
    },
    {
      question: 'What is the difference between Free and Premium Memberships?',
      answer: 'A Free membership allows you to create your profile, get verified, browse profiles, and send limited interests. Premium plans (Silver, Gold, Platinum) unlock direct messaging, higher interest limits, contact number reveals, spotlight search badges, and dedicated relationship managers.',
      category: 'Membership',
      orderIndex: 4,
      isActive: true,
    },
    {
      question: 'How does the Matchmaking algorithm work?',
      answer: 'Our smart matchmaking algorithm analyzes your Partner Preferences (age range, community, mother tongue, education, career, lifestyle, and dietary habits) to present you with daily high-compatibility matches.',
      category: 'Matchmaking',
      orderIndex: 5,
      isActive: true,
    }
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

