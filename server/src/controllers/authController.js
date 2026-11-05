const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      gender,
      profileCreatedFor,
      dateOfBirth,
      religion,
      motherTongue,
    } = req.body;

    if (!fullName || !email || !mobile || !password || !gender) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check duplicate email or mobile
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { mobile: cleanMobile }],
      },
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        return errorResponse(res, 'An account with this email address already exists', 409);
      }
      return errorResponse(res, 'An account with this mobile number already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const dob = dateOfBirth ? new Date(dateOfBirth) : new Date('1998-01-01');

    // Fetch free plan
    const freePlan = await prisma.membershipPlan.findUnique({
      where: { planCode: 'FREE' },
    });

    // Create user and profile transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          mobile: cleanMobile,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          profileCreatedFor: profileCreatedFor || 'MYSELF',
          emailVerified: true,
          mobileVerified: true,
          profile: {
            create: {
              fullName,
              gender: gender.toUpperCase(),
              dateOfBirth: dob,
              height: 168,
              maritalStatus: 'NEVER_MARRIED',
              aboutMe: `Hello, this profile is managed for ${fullName}. We are looking for an educated and understanding partner.`,
              profileSummary: `${fullName}, looking for a suitable life partner.`,
              isCompleted: false,
              completionPercentage: 35,
              religionCommunity: {
                create: {
                  religion: religion ? religion.toUpperCase() : 'HINDU',
                  community: 'Not Specified',
                  motherTongue: motherTongue || 'Hindi',
                }
              },
              educationCareer: {
                create: {
                  highestEducation: 'Bachelor',
                  occupationTitle: 'Professional',
                  annualIncome: 'Not Disclosed',
                }
              },
              location: {
                create: {
                  country: 'India',
                  state: 'Delhi',
                  city: 'New Delhi',
                }
              },
              familyDetails: {
                create: {
                  familyType: 'NUCLEAR',
                  familyStatus: 'MIDDLE_CLASS',
                }
              },
              lifestyleDetails: {
                create: {
                  diet: 'VEGETARIAN',
                }
              },
              partnerPreference: {
                create: {
                  minAge: 21,
                  maxAge: 35,
                  minHeight: 150,
                  maxHeight: 195,
                }
              }
            }
          }
        },
        include: {
          profile: {
            include: {
              photos: true,
              religionCommunity: true,
              educationCareer: true,
              location: true,
              familyDetails: true,
              lifestyleDetails: true,
              partnerPreference: true,
            }
          }
        }
      });

      if (freePlan) {
        await tx.subscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            interestsRemaining: freePlan.interestLimit,
            viewsRemaining: freePlan.profileViewLimit,
            contactsRemaining: freePlan.contactViewLimit,
          }
        });
      }

      // Welcome Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: 'Welcome to Kalyanam!',
          message: 'Your profile has been created successfully. Complete your details and add photos to receive high-compatibility matches.',
          link: '/dashboard/edit-profile',
        }
      });

      return user;
    });

    const token = generateToken(newUser.id, newUser.role);

    return successResponse(
      res,
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          mobile: newUser.mobile,
          role: newUser.role,
          profileCreatedFor: newUser.profileCreatedFor,
          profile: newUser.profile,
        },
        token,
      },
      'Registration successful! Welcome to Kalyanam Matrimony.',
      201
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body; // identifier can be email or mobile

    if (!identifier || !password) {
      return errorResponse(res, 'Email/Mobile and Password are required', 400);
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { mobile: cleanIdentifier }
        ]
      },
      include: {
        profile: {
          include: {
            photos: true,
            religionCommunity: true,
            educationCareer: true,
            location: true,
            familyDetails: true,
            lifestyleDetails: true,
            partnerPreference: true,
          }
        },
        subscriptions: {
          where: { status: 'ACTIVE', endDate: { gte: new Date() } },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (user.status === 'SUSPENDED') {
      return errorResponse(res, 'Your account is suspended. Please contact customer support.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user.id, user.role);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          profileCreatedFor: user.profileCreatedFor,
          profile: user.profile,
          subscription: user.subscriptions[0] || null,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: {
          include: {
            photos: true,
            religionCommunity: true,
            educationCareer: true,
            location: true,
            familyDetails: true,
            lifestyleDetails: true,
            partnerPreference: true,
          }
        },
        subscriptions: {
          where: { status: 'ACTIVE', endDate: { gte: new Date() } },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const { passwordHash, ...safeUser } = user;
    return successResponse(res, {
      ...safeUser,
      subscription: user.subscriptions[0] || null,
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Please provide your registered email', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal account existence for security
      return successResponse(res, {}, 'If an account exists with this email, password reset instructions have been sent.');
    }

    // In development / demo, we generate a reset token and return message
    const resetToken = jwt.sign({ userId: user.id, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '1h' });

    return successResponse(res, { resetToken }, 'Password reset instructions have been generated.');
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return errorResponse(res, 'Valid reset token and new password (min 6 chars) are required', 400);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'reset-password') {
      return errorResponse(res, 'Invalid reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });

    return successResponse(res, {}, 'Password has been reset successfully. Please login with your new password.');
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return errorResponse(res, 'Current password and new password (min 6 characters) are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return successResponse(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
};

