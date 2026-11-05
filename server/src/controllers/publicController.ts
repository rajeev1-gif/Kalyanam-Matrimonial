import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse } from '../utils/response';

export async function getSuccessStories(req: Request, res: Response, next: NextFunction) {
  try {
    const stories = await prisma.successStory.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, stories);
  } catch (error) {
    next(error);
  }
}

export async function getTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, testimonials);
  } catch (error) {
    next(error);
  }
}

export async function getFaqs(req: Request, res: Response, next: NextFunction) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    return successResponse(res, faqs);
  } catch (error) {
    next(error);
  }
}

export async function getHomeStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [profilesCount, storiesCount] = await Promise.all([
      prisma.profile.count(),
      prisma.successStory.count(),
    ]);

    return successResponse(res, {
      totalProfiles: Math.max(50000, profilesCount * 5000),
      totalMatches: Math.max(12000, storiesCount * 4000),
      verifiedRate: '100%',
      supportHours: '24/7',
    });
  } catch (error) {
    next(error);
  }
}


