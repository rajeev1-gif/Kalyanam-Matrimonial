import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export function calculateCompletionPercentage(profile: any) {
  let score = 0;
  // Basic Info (20%)
  if (profile.fullName && profile.gender && profile.dateOfBirth && profile.height) score += 20;

  // Photos (20%)
  if (profile.photos && profile.photos.length > 0) score += 20;

  // Religion & Community (15%)
  if (profile.religionCommunity?.religion && profile.religionCommunity?.community) score += 15;

  // Education & Career (15%)
  if (profile.educationCareer?.highestEducation && profile.educationCareer?.occupationTitle) score += 15;

  // Location (10%)
  if (profile.location?.state && profile.location?.city) score += 10;

  // Family Details (10%)
  if (profile.familyDetails?.familyType && profile.familyDetails?.familyStatus) score += 10;

  // Lifestyle & About (10%)
  if (profile.lifestyleDetails?.diet && profile.aboutMe && profile.aboutMe.length > 20) score += 10;

  return Math.min(100, score);
}

export async function getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        photos: { orderBy: { orderIndex: 'asc' } },
        religionCommunity: true,
        educationCareer: true,
        location: true,
        familyDetails: true,
        lifestyleDetails: true,
        partnerPreference: true,
      }
    });

    if (!profile) {
      return errorResponse(res, 'Profile not found', 404);
    }

    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    const {
      basicInfo,
      religionCommunity,
      educationCareer,
      location,
      familyDetails,
      lifestyleDetails,
      aboutMe,
      profileSummary,
      partnerPreference,
    } = req.body;

    // Fetch existing profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: true,
        religionCommunity: true,
        educationCareer: true,
        location: true,
        familyDetails: true,
        lifestyleDetails: true,
        partnerPreference: true,
      }
    });

    if (!existingProfile) {
      return errorResponse(res, 'Profile not found', 404);
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      // 1. Basic & About Me
      const profileUpdateData: any = {};
      if (basicInfo?.fullName) profileUpdateData.fullName = basicInfo.fullName;
      if (basicInfo?.gender) profileUpdateData.gender = basicInfo.gender.toUpperCase();
      if (basicInfo?.dateOfBirth) profileUpdateData.dateOfBirth = new Date(basicInfo.dateOfBirth);
      if (basicInfo?.height) profileUpdateData.height = parseInt(basicInfo.height);
      if (basicInfo?.maritalStatus) profileUpdateData.maritalStatus = basicInfo.maritalStatus;
      if (aboutMe !== undefined) profileUpdateData.aboutMe = aboutMe;
      if (profileSummary !== undefined) profileUpdateData.profileSummary = profileSummary;

      // 2. Religion & Community
      if (religionCommunity) {
        await tx.religionCommunity.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            religion: religionCommunity.religion?.toUpperCase() || 'HINDU',
            community: religionCommunity.community || 'Not Specified',
            caste: religionCommunity.caste || null,
            subCaste: religionCommunity.subCaste || null,
            motherTongue: religionCommunity.motherTongue || 'Hindi',
            gothra: religionCommunity.gothra || null,
            manglik: religionCommunity.manglik || 'DONT_KNOW',
          },
          update: {
            ...(religionCommunity.religion && { religion: religionCommunity.religion.toUpperCase() }),
            ...(religionCommunity.community !== undefined && { community: religionCommunity.community }),
            ...(religionCommunity.caste !== undefined && { caste: religionCommunity.caste }),
            ...(religionCommunity.subCaste !== undefined && { subCaste: religionCommunity.subCaste }),
            ...(religionCommunity.motherTongue !== undefined && { motherTongue: religionCommunity.motherTongue }),
            ...(religionCommunity.gothra !== undefined && { gothra: religionCommunity.gothra }),
            ...(religionCommunity.manglik !== undefined && { manglik: religionCommunity.manglik }),
          }
        });
      }

      // 3. Education & Career
      if (educationCareer) {
        await tx.educationCareer.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            highestEducation: educationCareer.highestEducation || 'Bachelor',
            educationField: educationCareer.educationField || null,
            collegeName: educationCareer.collegeName || null,
            occupationType: educationCareer.occupationType || 'PRIVATE_SECTOR',
            occupationTitle: educationCareer.occupationTitle || 'Professional',
            companyName: educationCareer.companyName || null,
            annualIncome: educationCareer.annualIncome || 'Not Disclosed',
            currency: educationCareer.currency || 'INR',
          },
          update: {
            ...(educationCareer.highestEducation !== undefined && { highestEducation: educationCareer.highestEducation }),
            ...(educationCareer.educationField !== undefined && { educationField: educationCareer.educationField }),
            ...(educationCareer.collegeName !== undefined && { collegeName: educationCareer.collegeName }),
            ...(educationCareer.occupationType !== undefined && { occupationType: educationCareer.occupationType }),
            ...(educationCareer.occupationTitle !== undefined && { occupationTitle: educationCareer.occupationTitle }),
            ...(educationCareer.companyName !== undefined && { companyName: educationCareer.companyName }),
            ...(educationCareer.annualIncome !== undefined && { annualIncome: educationCareer.annualIncome }),
            ...(educationCareer.currency !== undefined && { currency: educationCareer.currency }),
          }
        });
      }

      // 4. Location
      if (location) {
        await tx.location.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            country: location.country || 'India',
            state: location.state || 'Delhi',
            city: location.city || 'New Delhi',
            citizenship: location.citizenship || 'Indian',
            residentialStatus: location.residentialStatus || 'CITIZEN',
          },
          update: {
            ...(location.country !== undefined && { country: location.country }),
            ...(location.state !== undefined && { state: location.state }),
            ...(location.city !== undefined && { city: location.city }),
            ...(location.citizenship !== undefined && { citizenship: location.citizenship }),
            ...(location.residentialStatus !== undefined && { residentialStatus: location.residentialStatus }),
          }
        });
      }

      // 5. Family Details
      if (familyDetails) {
        await tx.familyDetails.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            familyType: familyDetails.familyType || 'NUCLEAR',
            familyValues: familyDetails.familyValues || 'MODERATE',
            familyStatus: familyDetails.familyStatus || 'MIDDLE_CLASS',
            fatherOccupation: familyDetails.fatherOccupation || null,
            motherOccupation: familyDetails.motherOccupation || null,
            brothersCount: parseInt(familyDetails.brothersCount || 0),
            brothersMarried: parseInt(familyDetails.brothersMarried || 0),
            sistersCount: parseInt(familyDetails.sistersCount || 0),
            sistersMarried: parseInt(familyDetails.sistersMarried || 0),
            aboutFamily: familyDetails.aboutFamily || null,
          },
          update: {
            ...(familyDetails.familyType !== undefined && { familyType: familyDetails.familyType }),
            ...(familyDetails.familyValues !== undefined && { familyValues: familyDetails.familyValues }),
            ...(familyDetails.familyStatus !== undefined && { familyStatus: familyDetails.familyStatus }),
            ...(familyDetails.fatherOccupation !== undefined && { fatherOccupation: familyDetails.fatherOccupation }),
            ...(familyDetails.motherOccupation !== undefined && { motherOccupation: familyDetails.motherOccupation }),
            ...(familyDetails.brothersCount !== undefined && { brothersCount: parseInt(familyDetails.brothersCount) }),
            ...(familyDetails.brothersMarried !== undefined && { brothersMarried: parseInt(familyDetails.brothersMarried) }),
            ...(familyDetails.sistersCount !== undefined && { sistersCount: parseInt(familyDetails.sistersCount) }),
            ...(familyDetails.sistersMarried !== undefined && { sistersMarried: parseInt(familyDetails.sistersMarried) }),
            ...(familyDetails.aboutFamily !== undefined && { aboutFamily: familyDetails.aboutFamily }),
          }
        });
      }

      // 6. Lifestyle Details
      if (lifestyleDetails) {
        await tx.lifestyleDetails.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            diet: lifestyleDetails.diet || 'VEGETARIAN',
            smoking: lifestyleDetails.smoking || 'NO',
            drinking: lifestyleDetails.drinking || 'NO',
            hobbies: lifestyleDetails.hobbies || null,
            interests: lifestyleDetails.interests || null,
          },
          update: {
            ...(lifestyleDetails.diet !== undefined && { diet: lifestyleDetails.diet }),
            ...(lifestyleDetails.smoking !== undefined && { smoking: lifestyleDetails.smoking }),
            ...(lifestyleDetails.drinking !== undefined && { drinking: lifestyleDetails.drinking }),
            ...(lifestyleDetails.hobbies !== undefined && { hobbies: lifestyleDetails.hobbies }),
            ...(lifestyleDetails.interests !== undefined && { interests: lifestyleDetails.interests }),
          }
        });
      }

      // 7. Partner Preferences
      if (partnerPreference) {
        await tx.partnerPreference.upsert({
          where: { profileId: existingProfile.id },
          create: {
            profileId: existingProfile.id,
            minAge: parseInt(partnerPreference.minAge || 21),
            maxAge: parseInt(partnerPreference.maxAge || 35),
            minHeight: parseInt(partnerPreference.minHeight || 150),
            maxHeight: parseInt(partnerPreference.maxHeight || 195),
            maritalStatus: partnerPreference.maritalStatus ? JSON.stringify(partnerPreference.maritalStatus) : null,
            religions: partnerPreference.religions ? JSON.stringify(partnerPreference.religions) : null,
            communities: partnerPreference.communities || null,
            motherTongues: partnerPreference.motherTongues || null,
            minIncome: partnerPreference.minIncome || null,
            country: partnerPreference.country || null,
            state: partnerPreference.state || null,
            city: partnerPreference.city || null,
            diet: partnerPreference.diet || null,
          },
          update: {
            ...(partnerPreference.minAge !== undefined && { minAge: parseInt(partnerPreference.minAge) }),
            ...(partnerPreference.maxAge !== undefined && { maxAge: parseInt(partnerPreference.maxAge) }),
            ...(partnerPreference.minHeight !== undefined && { minHeight: parseInt(partnerPreference.minHeight) }),
            ...(partnerPreference.maxHeight !== undefined && { maxHeight: parseInt(partnerPreference.maxHeight) }),
            ...(partnerPreference.maritalStatus !== undefined && { maritalStatus: JSON.stringify(partnerPreference.maritalStatus) }),
            ...(partnerPreference.religions !== undefined && { religions: JSON.stringify(partnerPreference.religions) }),
            ...(partnerPreference.communities !== undefined && { communities: partnerPreference.communities }),
            ...(partnerPreference.motherTongues !== undefined && { motherTongues: partnerPreference.motherTongues }),
            ...(partnerPreference.minIncome !== undefined && { minIncome: partnerPreference.minIncome }),
            ...(partnerPreference.country !== undefined && { country: partnerPreference.country }),
            ...(partnerPreference.state !== undefined && { state: partnerPreference.state }),
            ...(partnerPreference.city !== undefined && { city: partnerPreference.city }),
            ...(partnerPreference.diet !== undefined && { diet: partnerPreference.diet }),
          }
        });
      }

      // Update Profile root
      return await tx.profile.update({
        where: { id: existingProfile.id },
        data: profileUpdateData,
        include: {
          photos: true,
          religionCommunity: true,
          educationCareer: true,
          location: true,
          familyDetails: true,
          lifestyleDetails: true,
          partnerPreference: true,
        }
      });
    });

    // Recompute completeness score
    const completionPercentage = calculateCompletionPercentage(updatedProfile);
    const isCompleted = completionPercentage >= 80;

    const finalProfile = await prisma.profile.update({
      where: { id: updatedProfile.id },
      data: {
        completionPercentage,
        isCompleted,
      },
      include: {
        photos: { orderBy: { orderIndex: 'asc' } },
        religionCommunity: true,
        educationCareer: true,
        location: true,
        familyDetails: true,
        lifestyleDetails: true,
        partnerPreference: true,
      }
    });

    return successResponse(res, finalProfile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user.id;
    let photoUrl = '';

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.url) {
      photoUrl = req.body.url;
    } else {
      return errorResponse(res, 'No photo uploaded or URL provided', 400);
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });

    if (!profile) {
      return errorResponse(res, 'Profile not found', 404);
    }

    const isFirstPhoto = profile.photos.length === 0;

    const photo = await prisma.profilePhoto.create({
      data: {
        profileId: profile.id,
        url: photoUrl,
        isProfilePicture: isFirstPhoto,
        orderIndex: profile.photos.length,
        status: 'APPROVED',
      }
    });

    // Recalculate completeness
    const allPhotos = [...profile.photos, photo];
    const completionPercentage = calculateCompletionPercentage({ ...profile, photos: allPhotos });

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        completionPercentage,
        isCompleted: completionPercentage >= 80,
      }
    });

    return successResponse(res, photo, 'Photo uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function deletePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { photoId } = req.params as any;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { photos: true }
    });

    const photo = profile?.photos.find(p => p.id === photoId);
    if (!photo) {
      return errorResponse(res, 'Photo not found', 404);
    }

    await prisma.profilePhoto.delete({
      where: { id: photoId }
    });

    // If was primary photo, assign first available as primary
    if (photo.isProfilePicture) {
      const remaining = profile.photos.filter(p => p.id !== photoId);
      if (remaining.length > 0) {
        await prisma.profilePhoto.update({
          where: { id: remaining[0].id },
          data: { isProfilePicture: true }
        });
      }
    }

    return successResponse(res, {}, 'Photo deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function setPrimaryPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { photoId } = req.params as any;
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { photos: true }
    });

    const photo = profile?.photos.find(p => p.id === photoId);
    if (!photo) {
      return errorResponse(res, 'Photo not found', 404);
    }

    await prisma.$transaction([
      prisma.profilePhoto.updateMany({
        where: { profileId: profile.id },
        data: { isProfilePicture: false }
      }),
      prisma.profilePhoto.update({
        where: { id: photoId },
        data: { isProfilePicture: true }
      })
    ]);

    return successResponse(res, {}, 'Primary profile photo updated');
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params as any;
    const viewerId = req.user?.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            photos: { orderBy: { orderIndex: 'asc' } },
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
          take: 1
        }
      }
    });

    if (!targetUser || !targetUser.profile || targetUser.status !== 'ACTIVE') {
      return errorResponse(res, 'Profile not found or inactive', 404);
    }

    // Check relationship status if viewer is logged in
    let connectionStatus = 'NONE'; // NONE, PENDING_SENT, PENDING_RECEIVED, ACCEPTED, REJECTED
    let isShortlisted = false;
    let isBlocked = false;
    let canViewContact = false;

    if (viewerId && viewerId !== userId) {
      // Check block
      const blockExists = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: viewerId, blockedUserId: userId },
            { blockerId: userId, blockedUserId: viewerId },
          ]
        }
      });
      if (blockExists) {
        return errorResponse(res, 'This profile is currently unavailable', 403);
      }

      // Check interest
      const interest = await prisma.interest.findFirst({
        where: {
          OR: [
            { senderId: viewerId, receiverId: userId },
            { senderId: userId, receiverId: viewerId },
          ]
        }
      });

      if (interest) {
        if (interest.status === 'ACCEPTED') {
          connectionStatus = 'ACCEPTED';
          canViewContact = true;
        } else if (interest.status === 'PENDING') {
          connectionStatus = interest.senderId === viewerId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
        } else {
          connectionStatus = interest.status;
        }
      }

      // Check shortlist
      const shortlist = await prisma.shortlist.findUnique({
        where: {
          userId_shortlistedUserId: {
            userId: viewerId,
            shortlistedUserId: userId,
          }
        }
      });
      isShortlisted = !!shortlist;

      // Track profile view (skip duplicate views within 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentView = await prisma.profileView.findFirst({
        where: {
          viewerId,
          viewedUserId: userId,
          viewedAt: { gte: oneHourAgo }
        }
      });

      if (!recentView) {
        await prisma.profileView.create({
          data: {
            viewerId,
            viewedUserId: userId,
          }
        });

        // Trigger Notification to viewed user
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'PROFILE_VIEW',
            title: 'Profile Viewed',
            message: `${req.user.profile?.fullName || 'A member'} viewed your profile.`,
            link: `/profile/${viewerId}`,
          }
        });
      }

      // Check if viewer has paid subscription with remaining contact views
      const viewerSub = req.user.subscriptions?.[0];
      if (viewerSub && viewerSub.contactsRemaining > 0 && viewerSub.plan?.planCode !== 'FREE') {
        canViewContact = true;
      }
    }

    // Mask sensitive contact details unless authorized
    const safeUser = {
      id: targetUser.id,
      profileCreatedFor: targetUser.profileCreatedFor,
      role: targetUser.role,
      email: canViewContact ? targetUser.email : '••••••••@•••••.com (Unlock via Match or Plan)',
      mobile: canViewContact ? targetUser.mobile : '+91 ••••• ••••• (Unlock via Match or Plan)',
      canViewContact,
    };

    return successResponse(res, {
      user: safeUser,
      profile: targetUser.profile,
      connectionStatus,
      isShortlisted,
      isBlocked,
    });
  } catch (error) {
    next(error);
  }
}


