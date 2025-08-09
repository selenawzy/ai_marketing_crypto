const express = require('express');
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for content creator
// @access  Private (Content creators)
router.get('/dashboard', protect, authorize('content_creator', 'admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let dateFilter = new Date();
    if (period === '7d') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === '30d') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (period === '90d') {
      dateFilter.setDate(dateFilter.getDate() - 90);
    }

    // Get content statistics
    const contentStats = await db('content')
      .where('creator_id', req.user.id)
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as total_content'),
        db.raw('SUM(total_views) as total_views'),
        db.raw('SUM(paid_views) as paid_views'),
        db.raw('SUM(total_revenue) as total_revenue')
      )
      .first();

    // Get access logs analytics
    const accessAnalytics = await db('access_logs')
      .join('content', 'access_logs.content_id', 'content.id')
      .where('content.creator_id', req.user.id)
      .where('access_logs.created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as total_accesses'),
        db.raw('COUNT(DISTINCT ai_agent_id) as unique_ai_agents'),
        db.raw('COUNT(DISTINCT user_id) as unique_users')
      )
      .first();

    // Get top performing content
    const topContent = await db('content')
      .where('creator_id', req.user.id)
      .where('created_at', '>=', dateFilter)
      .orderBy('total_views', 'desc')
      .limit(5)
      .select('id', 'title', 'content_type', 'total_views', 'paid_views', 'total_revenue');

    // Get AI agent interactions
    const aiAgentStats = await db('access_logs')
      .join('content', 'access_logs.content_id', 'content.id')
      .join('ai_agents', 'access_logs.ai_agent_id', 'ai_agents.id')
      .where('content.creator_id', req.user.id)
      .where('access_logs.created_at', '>=', dateFilter)
      .groupBy('ai_agents.id', 'ai_agents.name')
      .select(
        'ai_agents.id',
        'ai_agents.name',
        db.raw('COUNT(*) as access_count'),
        db.raw('SUM(access_logs.amount_paid) as total_paid')
      )
      .orderBy('access_count', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        period,
        content_stats: {
          total_content: parseInt(contentStats.total_content) || 0,
          total_views: parseInt(contentStats.total_views) || 0,
          paid_views: parseInt(contentStats.paid_views) || 0,
          total_revenue: parseFloat(contentStats.total_revenue) || 0
        },
        access_analytics: {
          total_accesses: parseInt(accessAnalytics.total_accesses) || 0,
          unique_ai_agents: parseInt(accessAnalytics.unique_ai_agents) || 0,
          unique_users: parseInt(accessAnalytics.unique_users) || 0
        },
        top_content: topContent,
        ai_agent_stats: aiAgentStats
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/content/:id
// @desc    Get detailed analytics for specific content
// @access  Private (Content owner or admin)
router.get('/content/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Verify content ownership
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
        message: 'Not authorized to view this content analytics'
      });
    }

    // Calculate date range
    let dateFilter = new Date();
    if (period === '7d') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === '30d') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (period === '90d') {
      dateFilter.setDate(dateFilter.getDate() - 90);
    }

    // Get access logs for the content
    const accessLogs = await db('access_logs')
      .leftJoin('ai_agents', 'access_logs.ai_agent_id', 'ai_agents.id')
      .leftJoin('users', 'access_logs.user_id', 'users.id')
      .where('access_logs.content_id', id)
      .where('access_logs.created_at', '>=', dateFilter)
      .select(
        'access_logs.*',
        'ai_agents.name as ai_agent_name',
        'users.username'
      )
      .orderBy('access_logs.created_at', 'desc');

    // Get access statistics
    const accessStats = await db('access_logs')
      .where('content_id', id)
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as total_accesses'),
        db.raw('COUNT(DISTINCT ai_agent_id) as unique_ai_agents'),
        db.raw('COUNT(DISTINCT user_id) as unique_users'),
        db.raw('SUM(amount_paid) as total_revenue'),
        db.raw('COUNT(CASE WHEN access_type = \'paid\' THEN 1 END) as paid_accesses')
      )
      .first();

    // Get hourly access pattern
    const hourlyPattern = await db('access_logs')
      .where('content_id', id)
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('EXTRACT(hour FROM created_at) as hour'),
        db.raw('COUNT(*) as access_count')
      )
      .groupBy(db.raw('EXTRACT(hour FROM created_at)'))
      .orderBy('hour');

    res.json({
      success: true,
      data: {
        content: {
          id: content.id,
          title: content.title,
          content_type: content.content_type,
          price_per_access: content.price_per_access
        },
        access_stats: {
          total_accesses: parseInt(accessStats.total_accesses) || 0,
          unique_ai_agents: parseInt(accessStats.unique_ai_agents) || 0,
          unique_users: parseInt(accessStats.unique_users) || 0,
          total_revenue: parseFloat(accessStats.total_revenue) || 0,
          paid_accesses: parseInt(accessStats.paid_accesses) || 0
        },
        recent_access_logs: accessLogs.slice(0, 20),
        hourly_pattern: hourlyPattern
      }
    });
  } catch (error) {
    console.error('Content analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/platform
// @desc    Get platform-wide analytics
// @access  Private (Admin only)
router.get('/platform', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let dateFilter = new Date();
    if (period === '7d') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === '30d') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (period === '90d') {
      dateFilter.setDate(dateFilter.getDate() - 90);
    }

    // Get platform statistics
    const platformStats = await db('content')
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as total_content'),
        db.raw('COUNT(DISTINCT creator_id) as active_creators'),
        db.raw('SUM(total_views) as total_views'),
        db.raw('SUM(total_revenue) as total_revenue')
      )
      .first();

    // Get user statistics
    const userStats = await db('users')
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as new_users'),
        db.raw('COUNT(CASE WHEN role = \'content_creator\' THEN 1 END) as new_creators'),
        db.raw('COUNT(CASE WHEN role = \'ai_agent\' THEN 1 END) as new_ai_agents')
      )
      .first();

    // Get transaction statistics
    const transactionStats = await db('transactions')
      .where('created_at', '>=', dateFilter)
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('SUM(amount) as total_volume'),
        db.raw('AVG(amount) as average_transaction')
      )
      .first();

    // Get top content by views
    const topContent = await db('content')
      .join('users', 'content.creator_id', 'users.id')
      .where('content.created_at', '>=', dateFilter)
      .select(
        'content.id',
        'content.title',
        'content.content_type',
        'content.total_views',
        'content.total_revenue',
        'users.username as creator_username'
      )
      .orderBy('content.total_views', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        period,
        platform_stats: {
          total_content: parseInt(platformStats.total_content) || 0,
          active_creators: parseInt(platformStats.active_creators) || 0,
          total_views: parseInt(platformStats.total_views) || 0,
          total_revenue: parseFloat(platformStats.total_revenue) || 0
        },
        user_stats: {
          new_users: parseInt(userStats.new_users) || 0,
          new_creators: parseInt(userStats.new_creators) || 0,
          new_ai_agents: parseInt(userStats.new_ai_agents) || 0
        },
        transaction_stats: {
          total_transactions: parseInt(transactionStats.total_transactions) || 0,
          total_volume: parseFloat(transactionStats.total_volume) || 0,
          average_transaction: parseFloat(transactionStats.average_transaction) || 0
        },
        top_content: topContent
      }
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;