const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function reportUser(req, res, next) {
  try {
    const reporterId = req.user.id;
    const { reportedUserId, reason, description } = req.body;

    if (!reportedUserId || !reason) {
      return errorResponse(res, 'Reported User ID and reason are required', 400);
    }

    if (reporterId === reportedUserId) {
      return errorResponse(res, 'You cannot report your own profile', 400);
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        description: description || null,
        status: 'PENDING',
      }
    });

    return successResponse(res, report, 'Report submitted. Our trust & safety team will review this shortly.', 201);
  } catch (error) {
    next(error);
  }
}

async function blockUser(req, res, next) {
  try {
    const blockerId = req.user.id;
    const { blockedUserId, reason } = req.body;

    if (!blockedUserId) {
      return errorResponse(res, 'User ID to block is required', 400);
    }

    if (blockerId === blockedUserId) {
      return errorResponse(res, 'You cannot block your own profile', 400);
    }

    await prisma.block.upsert({
      where: {
        blockerId_blockedUserId: {
          blockerId,
          blockedUserId,
        }
      },
      create: {
        blockerId,
        blockedUserId,
        reason: reason || 'User requested block',
      },
      update: {}
    });

    return successResponse(res, {}, 'User blocked successfully');
  } catch (error) {
    next(error);
  }
}

async function unblockUser(req, res, next) {
  try {
    const blockerId = req.user.id;
    const { blockedUserId } = req.params;

    await prisma.block.deleteMany({
      where: {
        blockerId,
        blockedUserId,
      }
    });

    return successResponse(res, {}, 'User unblocked');
  } catch (error) {
    next(error);
  }
}

async function getBlockedUsers(req, res, next) {
  try {
    const blockerId = req.user.id;

    const blocks = await prisma.block.findMany({
      where: { blockerId },
      include: {
        blockedUser: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                gender: true,
                photos: { where: { isProfilePicture: true }, take: 1 }
              }
            }
          }
        }
      }
    });

    const formatted = blocks.map(b => ({
      id: b.id,
      blockedUserId: b.blockedUserId,
      name: b.blockedUser?.profile?.fullName || 'Member',
      photo: b.blockedUser?.profile?.photos?.[0]?.url || null,
      blockedAt: b.createdAt,
    }));

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  reportUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
};

