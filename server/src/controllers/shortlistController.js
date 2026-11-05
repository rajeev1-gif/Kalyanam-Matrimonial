const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function toggleShortlist(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return errorResponse(res, 'Target user ID is required', 400);
    }

    if (currentUserId === targetUserId) {
      return errorResponse(res, 'You cannot shortlist yourself', 400);
    }

    const existing = await prisma.shortlist.findUnique({
      where: {
        userId_shortlistedUserId: {
          userId: currentUserId,
          shortlistedUserId: targetUserId,
        }
      }
    });

    if (existing) {
      await prisma.shortlist.delete({
        where: { id: existing.id }
      });
      return successResponse(res, { isShortlisted: false }, 'Profile removed from shortlist');
    } else {
      await prisma.shortlist.create({
        data: {
          userId: currentUserId,
          shortlistedUserId: targetUserId,
        }
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'SHORTLISTED',
          title: 'Profile Shortlisted',
          message: `${req.user.profile?.fullName || 'A member'} shortlisted your profile.`,
          link: `/profile/${currentUserId}`,
        }
      });

      return successResponse(res, { isShortlisted: true }, 'Profile added to shortlist');
    }
  } catch (error) {
    next(error);
  }
}

async function getMyShortlists(req, res, next) {
  try {
    const currentUserId = req.user.id;

    const shortlists = await prisma.shortlist.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        shortlistedUser: {
          select: {
            id: true,
            profile: {
              include: {
                photos: { where: { isProfilePicture: true } },
                religionCommunity: true,
                educationCareer: true,
                location: true,
              }
            }
          }
        }
      }
    });

    const profiles = shortlists
      .filter(s => s.shortlistedUser?.profile)
      .map(s => ({
        ...s.shortlistedUser.profile,
        shortlistedAt: s.createdAt,
        isShortlisted: true,
      }));

    return successResponse(res, profiles);
  } catch (error) {
    next(error);
  }
}

async function getProfileViews(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { type = 'who_viewed_me' } = req.query; // 'who_viewed_me' or 'viewed_by_me'

    if (type === 'who_viewed_me') {
      const views = await prisma.profileView.findMany({
        where: { viewedUserId: currentUserId },
        orderBy: { viewedAt: 'desc' },
        take: 50,
        include: {
          viewer: {
            select: {
              id: true,
              profile: {
                include: {
                  photos: { where: { isProfilePicture: true } },
                  religionCommunity: true,
                  educationCareer: true,
                  location: true,
                }
              }
            }
          }
        }
      });

      // Group by viewer to show latest view
      const uniqueViews = [];
      const seen = new Set();
      for (const v of views) {
        if (!seen.has(v.viewerId) && v.viewer?.profile) {
          seen.add(v.viewerId);
          uniqueViews.push({
            viewedAt: v.viewedAt,
            profile: v.viewer.profile,
            userId: v.viewer.id,
          });
        }
      }

      return successResponse(res, uniqueViews);
    } else {
      const views = await prisma.profileView.findMany({
        where: { viewerId: currentUserId },
        orderBy: { viewedAt: 'desc' },
        take: 50,
        include: {
          viewedUser: {
            select: {
              id: true,
              profile: {
                include: {
                  photos: { where: { isProfilePicture: true } },
                  religionCommunity: true,
                  educationCareer: true,
                  location: true,
                }
              }
            }
          }
        }
      });

      const uniqueViews = [];
      const seen = new Set();
      for (const v of views) {
        if (!seen.has(v.viewedUserId) && v.viewedUser?.profile) {
          seen.add(v.viewedUserId);
          uniqueViews.push({
            viewedAt: v.viewedAt,
            profile: v.viewedUser.profile,
            userId: v.viewedUser.id,
          });
        }
      }

      return successResponse(res, uniqueViews);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  toggleShortlist,
  getMyShortlists,
  getProfileViews,
};

