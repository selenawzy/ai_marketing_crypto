const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { setCache, getCache } = require('../config/redis');

const router = express.Router();

// Validation schemas
const createContentSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().optional(),
  url: Joi.string().uri().required(),
  content_type: Joi.string().valid('article', 'video', 'image', 'data').required(),
  price_per_access: Joi.number().min(0).max(1000).required(),
  requires_payment: Joi.boolean().default(false),
  metadata: Joi.object().optional(),
  access_rules: Joi.object().optional()
});

const updateContentSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  price_per_access: Joi.number().min(0).max(1000).optional(),
  requires_payment: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
  access_rules: Joi.object().optional()
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private (Content creators)
router.post('/', protect, authorize('content_creator', 'admin'), async (req, res) => {
  try {
    const { error, value } = createContentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const contentData = {
      ...value,
      creator_id: req.user.id
    };

    const [contentId] = await db('content').insert(contentData);

    const content = await db('content')
      .where('id', contentId)
      .first();

    // Clear cache
    await setCache(`content:${contentId}`, content, 3600);

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: { content }
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/content
// @desc    Get all content (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      content_type,
      creator_id,
      requires_payment,
      min_price,
      max_price,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    let query = db('content')
      .join('users', 'content.creator_id', 'users.id')
      .select(
        'content.*',
        'users.username as creator_username',
        'users.wallet_address as creator_wallet'
      )
      .where('content.is_active', true);

    // Apply filters
    if (content_type) {
      query = query.where('content.content_type', content_type);
    }
    if (creator_id) {
      query = query.where('content.creator_id', creator_id);
    }
    if (requires_payment !== undefined) {
      query = query.where('content.requires_payment', requires_payment === 'true');
    }
    if (min_price) {
      query = query.where('content.price_per_access', '>=', min_price);
    }
    if (max_price) {
      query = query.where('content.price_per_access', '<=', max_price);
    }
    if (search) {
      query = query.where(function() {
        this.where('content.title', 'ilike', `%${search}%`)
          .orWhere('content.description', 'ilike', `%${search}%`);
      });
    }

    const total = await query.clone().count('* as count').first();
    const content = await query
      .orderBy('content.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/content/:id
// @desc    Get content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get from cache first
    const cachedContent = await getCache(`content:${id}`);
    if (cachedContent) {
      return res.json({
        success: true,
        data: { content: cachedContent }
      });
    }

    const content = await db('content')
      .join('users', 'content.creator_id', 'users.id')
      .select(
        'content.*',
        'users.username as creator_username',
        'users.wallet_address as creator_wallet'
      )
      .where('content.id', id)
      .where('content.is_active', true)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Cache the result
    await setCache(`content:${id}`, content, 3600);

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private (Content owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateContentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if content exists and user owns it
    const existingContent = await db('content')
      .where('id', id)
      .first();

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (existingContent.creator_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this content'
      });
    }

    await db('content')
      .where('id', id)
      .update(value);

    const updatedContent = await db('content')
      .where('id', id)
      .first();

    // Update cache
    await setCache(`content:${id}`, updatedContent, 3600);

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: { content: updatedContent }
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (Content owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const content = await db('content')
      .where('id', id)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    if (content.creator_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this content'
      });
    }

    await db('content')
      .where('id', id)
      .del();

    // Clear cache
    await setCache(`content:${id}`, null, 1);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/content/:id/access
// @desc    Request access to content (for AI agents)
// @access  Public
router.post('/:id/access', async (req, res) => {
  try {
    const { id } = req.params;
    const { ai_agent_id, user_id, access_type = 'free' } = req.body;

    const content = await db('content')
      .where('id', id)
      .where('is_active', true)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Log access
    const accessLog = {
      content_id: id,
      user_id: user_id || null,
      ai_agent_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      access_type,
      amount_paid: access_type === 'paid' ? content.price_per_access : 0,
      access_details: {
        timestamp: new Date().toISOString(),
        headers: req.headers
      }
    };

    await db('access_logs').insert(accessLog);

    // Update content stats
    await db('content')
      .where('id', id)
      .increment('total_views', 1);

    if (access_type === 'paid') {
      await db('content')
        .where('id', id)
        .increment('paid_views', 1)
        .increment('total_revenue', content.price_per_access);
    }

    res.json({
      success: true,
      message: 'Access granted',
      data: {
        content_url: content.url,
        access_type,
        amount_paid: access_type === 'paid' ? content.price_per_access : 0
      }
    });
  } catch (error) {
    console.error('Content access error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 