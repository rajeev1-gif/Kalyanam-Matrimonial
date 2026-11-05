const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function sendInterest(req, res, next) {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return errorResponse(res, 'Receiver ID is required', 400);
    }

    if (senderId === receiverId) {
      return errorResponse(res, 'You cannot send interest to your own profile', 400);
    }

    // Check if target user exists and is active
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { profile: true }
    });

    if (!receiver || receiver.status !== 'ACTIVE') {
      return errorResponse(res, 'Target profile is unavailable or inactive', 404);
    }

    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedUserId: receiverId },
          { blockerId: receiverId, blockedUserId: senderId }
        ]
      }
    });
    if (isBlocked) {
      return errorResponse(res, 'Unable to send interest to this member', 403);
    }

    // Check existing interest
    const existingInterest = await prisma.interest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingInterest) {
      if (existingInterest.status === 'ACCEPTED') {
        return errorResponse(res, 'You are already connected with this member', 400);
      }
      if (existingInterest.status === 'PENDING') {
        if (existingInterest.senderId === senderId) {
          return errorResponse(res, 'You have already sent an interest to this member', 400);
        } else {
          // If the other user had already sent an interest to me, auto-accept it!
          const updated = await prisma.interest.update({
            where: { id: existingInterest.id },
            data: { status: 'ACCEPTED' },
          });

          // Ensure conversation exists
          const [u1, u2] = [senderId, receiverId].sort();
          await prisma.conversation.upsert({
            where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
            create: { user1Id: u1, user2Id: u2 },
            update: {}
          });

          await prisma.notification.create({
            data: {
              userId: receiverId,
              type: 'INTEREST_ACCEPTED',
              title: 'Mutual Match!',
              message: `${req.user.profile?.fullName || 'A member'} accepted your connection request.`,
              link: `/dashboard/messages`,
            }
          });

          return successResponse(res, updated, 'You both expressed interest! You are now connected.');
        }
      }
    }

    // Check subscription interest limits
    const subscription = req.user.subscriptions?.[0];
    if (subscription && subscription.interestsRemaining <= 0) {
      return errorResponse(res, 'You have reached your monthly interest limit. Please upgrade your plan.', 403);
    }

    // Create interest and decrement allowance
    const interest = await prisma.$transaction(async (tx) => {
      const created = await tx.interest.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
          message: message || 'Expressed interest in your profile.',
        }
      });

      if (subscription && subscription.interestsRemaining > 0) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            interestsRemaining: { decrement: 1 }
          }
        });
      }

      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'INTEREST_RECEIVED',
          title: 'New Interest Request',
          message: `${req.user.profile?.fullName || 'A member'} has sent you an interest request.`,
          link: '/dashboard/received-interests',
        }
      });

      return created;
    });

    return successResponse(res, interest, 'Interest sent successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function acceptInterest(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { interestId } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id: interestId }
    });

    if (!interest) {
      return errorResponse(res, 'Interest request not found', 404);
    }

    if (interest.receiverId !== currentUserId) {
      return errorResponse(res, 'You are not authorized to accept this request', 403);
    }

    const updatedInterest = await prisma.$transaction(async (tx) => {
      const updated = await tx.interest.update({
        where: { id: interestId },
        data: { status: 'ACCEPTED' },
      });

      // Create conversation
      const [u1, u2] = [interest.senderId, currentUserId].sort();
      await tx.conversation.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        create: { user1Id: u1, user2Id: u2 },
        update: {}
      });

      await tx.notification.create({
        data: {
          userId: interest.senderId,
          type: 'INTEREST_ACCEPTED',
          title: 'Interest Accepted!',
          message: `${req.user.profile?.fullName || 'A member'} accepted your interest request.`,
          link: `/dashboard/messages`,
        }
      });

      return updated;
    });

    return successResponse(res, updatedInterest, 'Interest accepted! You can now start messaging.');
  } catch (error) {
    next(error);
  }
}

async function rejectInterest(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { interestId } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id: interestId }
    });

    if (!interest) {
      return errorResponse(res, 'Interest request not found', 404);
    }

    if (interest.receiverId !== currentUserId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.interest.update({
      where: { id: interestId },
      data: { status: 'REJECTED' },
    });

    return successResponse(res, updated, 'Interest request declined');
  } catch (error) {
    next(error);
  }
}

async function withdrawInterest(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { interestId } = req.params;

    const interest = await prisma.interest.findUnique({
      where: { id: interestId }
    });

    if (!interest) {
      return errorResponse(res, 'Interest request not found', 404);
    }

    if (interest.senderId !== currentUserId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    if (interest.status !== 'PENDING') {
      return errorResponse(res, 'Only pending requests can be withdrawn', 400);
    }

    await prisma.interest.delete({
      where: { id: interestId }
    });

    return successResponse(res, {}, 'Interest request withdrawn');
  } catch (error) {
    next(error);
  }
}

async function getReceivedInterests(req, res, next) {
  try {
    const currentUserId = req.user.id;

    const interests = await prisma.interest.findMany({
      where: {
        receiverId: currentUserId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
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

    return successResponse(res, interests);
  } catch (error) {
    next(error);
  }
}

async function getSentInterests(req, res, next) {
  try {
    const currentUserId = req.user.id;

    const interests = await prisma.interest.findMany({
      where: {
        senderId: currentUserId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
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

    return successResponse(res, interests);
  } catch (error) {
    next(error);
  }
}

async function getAcceptedConnections(req, res, next) {
  try {
    const currentUserId = req.user.id;

    const connections = await prisma.interest.findMany({
      where: {
        OR: [
          { senderId: currentUserId, status: 'ACCEPTED' },
          { receiverId: currentUserId, status: 'ACCEPTED' },
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            mobile: true,
            profile: {
              include: {
                photos: { where: { isProfilePicture: true } },
                religionCommunity: true,
                educationCareer: true,
                location: true,
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            mobile: true,
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

    // Format connections relative to current user
    const formatted = connections.map(conn => {
      const isSender = conn.senderId === currentUserId;
      const partner = isSender ? conn.receiver : conn.sender;
      return {
        interestId: conn.id,
        connectedAt: conn.updatedAt,
        partnerId: partner.id,
        email: partner.email,
        mobile: partner.mobile,
        profile: partner.profile,
      };
    });

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendInterest,
  acceptInterest,
  rejectInterest,
  withdrawInterest,
  getReceivedInterests,
  getSentInterests,
  getAcceptedConnections,
};

