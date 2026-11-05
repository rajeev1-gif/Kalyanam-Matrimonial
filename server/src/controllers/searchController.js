const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function searchProfiles(req, res, next) {
  try {
    const {
      gender,
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      religion,
      community,
      maritalStatus,
      highestEducation,
      occupation,
      country,
      state,
      city,
      motherTongue,
      diet,
      keyword,
      sortBy = 'recent', // 'recent', 'age_asc', 'age_desc', 'completeness'
      page = 1,
      limit = 12,
    } = req.query;

    const currentUserId = req.user?.id;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    // Build block list
    let excludedUserIds = [];
    if (currentUserId) {
      excludedUserIds.push(currentUserId);
      const blocks = await prisma.block.findMany({
        where: {
          OR: [{ blockerId: currentUserId }, { blockedUserId: currentUserId }],
        },
      });
      blocks.forEach((b) => {
        excludedUserIds.push(b.blockerId, b.blockedUserId);
      });
    }

    // Build where conditions
    const profileWhere = {
      user: {
        id: { notIn: excludedUserIds },
        status: 'ACTIVE',
      },
      isVisible: true,
    };

    // Gender filter
    if (gender) {
      profileWhere.gender = gender.toUpperCase();
    } else if (req.user?.profile?.gender) {
      // Default to opposite gender if user is logged in and didn't specify
      profileWhere.gender = req.user.profile.gender === 'MALE' ? 'FEMALE' : 'MALE';
    }

    // Age filter (calculated from dateOfBirth)
    if (ageMin || ageMax) {
      const now = new Date();
      profileWhere.dateOfBirth = {};
      if (ageMax) {
        // Oldest birthdate: now - (ageMax + 1) years
        const minDob = new Date(now.getFullYear() - parseInt(ageMax) - 1, now.getMonth(), now.getDate());
        profileWhere.dateOfBirth.gte = minDob;
      }
      if (ageMin) {
        // Youngest birthdate: now - ageMin years
        const maxDob = new Date(now.getFullYear() - parseInt(ageMin), now.getMonth(), now.getDate());
        profileWhere.dateOfBirth.lte = maxDob;
      }
    }

    // Height filter
    if (heightMin || heightMax) {
      profileWhere.height = {};
      if (heightMin) profileWhere.height.gte = parseInt(heightMin);
      if (heightMax) profileWhere.height.lte = parseInt(heightMax);
    }

    // Marital Status
    if (maritalStatus) {
      profileWhere.maritalStatus = maritalStatus;
    }

    // Keyword search in name or about
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      profileWhere.OR = [
        { fullName: { contains: kw, mode: 'insensitive' } },
        { aboutMe: { contains: kw, mode: 'insensitive' } },
        { profileSummary: { contains: kw, mode: 'insensitive' } },
      ];
    }

    // Relational filters
    const religionFilter = {};
    if (religion) religionFilter.religion = religion.toUpperCase();
    if (community) religionFilter.community = { contains: community, mode: 'insensitive' };
    if (motherTongue) religionFilter.motherTongue = { contains: motherTongue, mode: 'insensitive' };
    if (Object.keys(religionFilter).length > 0) {
      profileWhere.religionCommunity = religionFilter;
    }

    const educationFilter = {};
    if (highestEducation) educationFilter.highestEducation = { contains: highestEducation, mode: 'insensitive' };
    if (occupation) educationFilter.occupationTitle = { contains: occupation, mode: 'insensitive' };
    if (Object.keys(educationFilter).length > 0) {
      profileWhere.educationCareer = educationFilter;
    }

    const locationFilter = {};
    if (country) locationFilter.country = { contains: country, mode: 'insensitive' };
    if (state) locationFilter.state = { contains: state, mode: 'insensitive' };
    if (city) locationFilter.city = { contains: city, mode: 'insensitive' };
    if (Object.keys(locationFilter).length > 0) {
      profileWhere.location = locationFilter;
    }

    const lifestyleFilter = {};
    if (diet) lifestyleFilter.diet = diet.toUpperCase();
    if (Object.keys(lifestyleFilter).length > 0) {
      profileWhere.lifestyleDetails = lifestyleFilter;
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'age_asc') {
      orderBy = { dateOfBirth: 'desc' }; // younger first
    } else if (sortBy === 'age_desc') {
      orderBy = { dateOfBirth: 'asc' }; // older first
    } else if (sortBy === 'completeness') {
      orderBy = { completionPercentage: 'desc' };
    }

    const [total, profiles] = await Promise.all([
      prisma.profile.count({ where: profileWhere }),
      prisma.profile.findMany({
        where: profileWhere,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              profileCreatedFor: true,
              role: true,
            }
          },
          photos: {
            where: { status: 'APPROVED' },
            orderBy: { orderIndex: 'asc' }
          },
          religionCommunity: true,
          educationCareer: true,
          location: true,
          lifestyleDetails: true,
        }
      })
    ]);

    // Check interests & shortlists for the viewing user
    let userInterests = new Map();
    let userShortlists = new Set();

    if (currentUserId) {
      const targetUserIds = profiles.map(p => p.userId);
      const [interests, shortlists] = await Promise.all([
        prisma.interest.findMany({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: { in: targetUserIds } },
              { senderId: { in: targetUserIds }, receiverId: currentUserId },
            ]
          }
        }),
        prisma.shortlist.findMany({
          where: {
            userId: currentUserId,
            shortlistedUserId: { in: targetUserIds },
          }
        })
      ]);

      interests.forEach(i => {
        if (i.status === 'ACCEPTED') {
          userInterests.set(i.senderId === currentUserId ? i.receiverId : i.senderId, 'ACCEPTED');
        } else if (i.senderId === currentUserId) {
          userInterests.set(i.receiverId, i.status === 'PENDING' ? 'PENDING_SENT' : i.status);
        } else {
          userInterests.set(i.senderId, i.status === 'PENDING' ? 'PENDING_RECEIVED' : i.status);
        }
      });

      shortlists.forEach(s => userShortlists.add(s.shortlistedUserId));
    }

    const enrichedProfiles = profiles.map(p => ({
      ...p,
      connectionStatus: userInterests.get(p.userId) || 'NONE',
      isShortlisted: userShortlists.has(p.userId),
    }));

    return successResponse(res, {
      profiles: enrichedProfiles,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getRecommendedMatches(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const userProfile = req.user.profile;

    if (!userProfile) {
      return errorResponse(res, 'User profile required for matchmaking', 400);
    }

    const targetGender = userProfile.gender === 'MALE' ? 'FEMALE' : 'MALE';
    const preference = await prisma.partnerPreference.findUnique({
      where: { profileId: userProfile.id }
    });

    const now = new Date();
    const minAge = preference?.minAge || 21;
    const maxAge = preference?.maxAge || 35;
    const minDob = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
    const maxDob = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());

    const matches = await prisma.profile.findMany({
      where: {
        userId: { not: currentUserId },
        gender: targetGender,
        user: { status: 'ACTIVE' },
        isVisible: true,
        dateOfBirth: {
          gte: minDob,
          lte: maxDob,
        }
      },
      take: 8,
      orderBy: { completionPercentage: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            profileCreatedFor: true,
          }
        },
        photos: {
          where: { status: 'APPROVED' },
          orderBy: { orderIndex: 'asc' }
        },
        religionCommunity: true,
        educationCareer: true,
        location: true,
      }
    });

    return successResponse(res, matches);
  } catch (error) {
    next(error);
  }
}

async function getFeaturedProfiles(req, res, next) {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        isVerified: true,
        isVisible: true,
        user: { status: 'ACTIVE' },
        photos: { some: { isProfilePicture: true } },
      },
      take: 8,
      orderBy: { completionPercentage: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            profileCreatedFor: true,
          }
        },
        photos: {
          where: { status: 'APPROVED' },
          orderBy: { orderIndex: 'asc' }
        },
        religionCommunity: true,
        educationCareer: true,
        location: true,
      }
    });

    return successResponse(res, profiles);
  } catch (error) {
    next(error);
  }
}

async function getRecentProfiles(req, res, next) {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        isVisible: true,
        user: { status: 'ACTIVE' },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            profileCreatedFor: true,
          }
        },
        photos: {
          where: { status: 'APPROVED' },
          orderBy: { orderIndex: 'asc' }
        },
        religionCommunity: true,
        educationCareer: true,
        location: true,
      }
    });

    return successResponse(res, profiles);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchProfiles,
  getRecommendedMatches,
  getFeaturedProfiles,
  getRecentProfiles,
};

