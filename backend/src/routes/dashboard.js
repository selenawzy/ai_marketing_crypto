const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    // For now, return mock data since we don't have the full database schema
    // In production, this would query the database for real stats
    const stats = {
      totalAgents: 3,
      totalEarnings: 24.75,
      totalCalls: 127,
      activeUsers: 45,
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
});

// GET /api/dashboard/agents
router.get('/agents', protect, async (req, res) => {
  try {
    // Mock data for now
    const agents = [
      {
        id: 1,
        name: 'Marketing Agent Alpha',
        status: 'active',
        earnings: 12.50,
        calls: 45
      },
      {
        id: 2,
        name: 'Content Curator Beta',
        status: 'active',
        earnings: 8.25,
        calls: 32
      },
      {
        id: 3,
        name: 'Trading Assistant Gamma',
        status: 'active',
        earnings: 4.00,
        calls: 50
      }
    ];

    res.json({
      success: true,
      data: { agents }
    });
  } catch (error) {
    console.error('Error fetching dashboard agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard agents'
    });
  }
});

module.exports = router; 