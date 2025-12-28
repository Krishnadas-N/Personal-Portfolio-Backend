import { Request, Response } from 'express';
import { NewsletterSubscriber, NewsletterCampaign } from '../models';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

// ==================== SUBSCRIBERS ====================

// @desc    Get newsletter subscribers (Admin)
// @route   GET /api/admin/newsletter/subscribers
// @access  Private (Admin)
export const getNewsletterSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
        filter.$or = [
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } }
        ];
    }

    const subscribers = await NewsletterSubscriber.find(filter)
        .sort({ subscribedAt: -1 })
        .limit(parseInt(limit as string) * 1)
        .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const totalSubscribers = await NewsletterSubscriber.countDocuments(filter);

    // Get subscriber statistics
    const stats = await NewsletterSubscriber.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            subscribers,
            pagination: {
                current: parseInt(page as string),
                pages: Math.ceil(totalSubscribers / parseInt(limit as string)),
                total: totalSubscribers
            },
            stats: stats.reduce((acc: Record<string, number>, stat: any) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {} as Record<string, number>)
        }
    });
});

// @desc    Manually subscribe an email (Admin)
// @route   POST /api/admin/newsletter/subscribe
// @access  Private (Admin)
export const manualSubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { email, firstName, lastName, tags } = req.body;

    let subscriber = await NewsletterSubscriber.findOne({ email });

    if (subscriber) {
        if (subscriber.status === 'subscribed') {
            throw new AppError('Email is already subscribed', 400);
        }
        subscriber.status = 'subscribed';
        subscriber.firstName = firstName || subscriber.firstName;
        subscriber.lastName = lastName || subscriber.lastName;
        subscriber.tags = tags || subscriber.tags;
        subscriber.subscribedAt = new Date();
        subscriber.unsubscribedAt = undefined;
        await subscriber.save();
    } else {
        subscriber = await NewsletterSubscriber.create({
            email,
            firstName,
            lastName,
            tags: tags || ['manual-entry'],
            source: 'admin',
            status: 'subscribed'
        });
    }

    res.status(201).json({
        success: true,
        message: 'Subscriber added successfully',
        data: subscriber
    });
});

// @desc    Toggle subscriber status (Admin)
// @route   POST /api/admin/newsletter/toggle-status
// @access  Private (Admin)
export const toggleSubscriptionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
        throw new AppError('Subscriber not found', 404);
    }

    // Toggle status
    if (subscriber.status === 'subscribed') {
        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date();
    } else {
        // If unsubscribed or pending, switch to subscribed
        subscriber.status = 'subscribed';
        subscriber.unsubscribedAt = undefined;
        // Ensure subscribedAt is set if it wasn't
        if (!subscriber.subscribedAt) {
            subscriber.subscribedAt = new Date();
        }
    }

    await subscriber.save();

    res.json({
        success: true,
        message: `Subscriber ${subscriber.status} successfully`,
        data: subscriber
    });
});

// @desc    Update subscriber status (Admin)
// @route   PATCH /api/admin/newsletter/subscribers/:id/status
// @access  Private (Admin)
export const updateSubscriberStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['subscribed', 'unsubscribed', 'pending'].includes(status)) {
        throw new AppError('Invalid status', 400);
    }

    const subscriber = await NewsletterSubscriber.findById(id);

    if (!subscriber) {
        throw new AppError('Subscriber not found', 404);
    }

    subscriber.status = status;
    if (status === 'unsubscribed') {
        subscriber.unsubscribedAt = new Date();
    } else if (status === 'subscribed' && !subscriber.subscribedAt) {
        subscriber.subscribedAt = new Date();
    }

    await subscriber.save();

    res.json({
        success: true,
        message: 'Subscriber status updated',
        data: subscriber
    });
});

// @desc    Export subscribers (Admin)
// @route   GET /api/admin/newsletter/subscribers/export
// @access  Private (Admin)
export const exportSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const subscribers = await NewsletterSubscriber.find({ status: 'subscribed' })
        .select('email firstName lastName subscribedAt tags');

    // In a real app, you might generate a CSV file here
    // For now, we return JSON which the frontend can convert to CSV
    res.json({
        success: true,
        data: subscribers
    });
});

// ==================== CAMPAIGNS ====================

// @desc    Get newsletter campaigns (Admin)
// @route   GET /api/admin/newsletter/campaigns
// @access  Private (Admin)
export const getNewsletterCampaigns = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const campaigns = await NewsletterCampaign.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string) * 1)
        .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const totalCampaigns = await NewsletterCampaign.countDocuments(filter);

    res.json({
        success: true,
        data: {
            campaigns,
            pagination: {
                current: parseInt(page as string),
                pages: Math.ceil(totalCampaigns / parseInt(limit as string)),
                total: totalCampaigns
            }
        }
    });
});

// @desc    Create a new campaign
// @route   POST /api/admin/newsletter/campaigns
// @access  Private (Admin)
export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { title, subject, content, htmlContent, tags, segments, scheduledAt } = req.body;

    const campaign = await NewsletterCampaign.create({
        title,
        subject,
        content,
        htmlContent,
        tags,
        segments,
        scheduledAt,
        status: scheduledAt ? 'scheduled' : 'draft'
    });

    res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign
    });
});

// @desc    Get campaign by ID
// @route   GET /api/admin/newsletter/campaigns/:id
// @access  Private (Admin)
export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
    const campaign = await NewsletterCampaign.findById(req.params.id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404);
    }

    res.json({
        success: true,
        data: campaign
    });
});

// @desc    Update campaign
// @route   PUT /api/admin/newsletter/campaigns/:id
// @access  Private (Admin)
export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, subject, content, htmlContent, tags, segments, scheduledAt } = req.body;

    let campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404);
    }

    if (['sending', 'sent'].includes(campaign.status)) {
        throw new AppError('Cannot edit a campaign that is sending or sent', 400);
    }

    campaign.title = title || campaign.title;
    campaign.subject = subject || campaign.subject;
    campaign.content = content || campaign.content;
    campaign.htmlContent = htmlContent || campaign.htmlContent;
    campaign.tags = tags || campaign.tags;
    campaign.segments = segments || campaign.segments;

    if (scheduledAt) {
        campaign.scheduledAt = scheduledAt;
        campaign.status = 'scheduled';
    }

    await campaign.save();

    res.json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign
    });
});

// @desc    Update campaign status
// @route   PATCH /api/admin/newsletter/campaigns/:id/status
// @access  Private (Admin)
export const updateCampaignStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404);
    }

    // Simple state transition logic
    if (status === 'sent' && campaign.status !== 'sending') {
        // Usually handled by a background job, but allowing manual override if needed
    }

    campaign.status = status;
    await campaign.save();

    res.json({
        success: true,
        message: `Campaign status updated to ${status}`,
        data: campaign
    });
});

// @desc    Delete campaign
// @route   DELETE /api/admin/newsletter/campaigns/:id
// @access  Private (Admin)
export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
        throw new AppError('Campaign not found', 404);
    }

    if (['sending'].includes(campaign.status)) {
        throw new AppError('Cannot delete a campaign that is currently sending', 400);
    }

    await NewsletterCampaign.findByIdAndDelete(id);

    res.json({
        success: true,
        message: 'Campaign deleted successfully'
    });
});
