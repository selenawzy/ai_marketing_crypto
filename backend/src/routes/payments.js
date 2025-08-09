const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createPaymentSchema = Joi.object({
  content_id: Joi.number().integer().required(),
  amount: Joi.number().min(0).required(),
  currency: Joi.string().valid('ETH', 'USDC', 'USD').default('ETH'),
  payment_method: Joi.string().valid('crypto', 'stripe').required(),
  transaction_hash: Joi.string().optional(),
  payment_intent_id: Joi.string().optional()
});

// @route   POST /api/payments
// @desc    Create a payment transaction
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { content_id, amount, currency, payment_method, transaction_hash, payment_intent_id } = value;

    // Verify content exists
    const content = await db('content').where('id', content_id).first();
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create payment record
    const paymentData = {
      user_id: req.user.id,
      content_id,
      creator_id: content.creator_id,
      amount,
      currency,
      payment_method,
      transaction_hash,
      payment_intent_id,
      status: 'pending'
    };

    const [paymentId] = await db('transactions').insert(paymentData);

    const payment = await db('transactions')
      .where('id', paymentId)
      .first();

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: { payment }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments
// @desc    Get user's payment history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db('transactions')
      .join('content', 'transactions.content_id', 'content.id')
      .select(
        'transactions.*',
        'content.title as content_title',
        'content.content_type'
      )
      .where('transactions.user_id', req.user.id);

    if (status) {
      query = query.where('transactions.status', status);
    }

    const total = await query.clone().count('* as count').first();
    const payments = await query
      .orderBy('transactions.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/payments/:id/confirm
// @desc    Confirm payment transaction
// @access  Private
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_hash, block_number } = req.body;

    const payment = await db('transactions')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await db('transactions')
      .where('id', id)
      .update({
        status: 'completed',
        transaction_hash,
        block_number,
        confirmed_at: new Date()
      });

    // Update content revenue
    await db('content')
      .where('id', payment.content_id)
      .increment('total_revenue', payment.amount);

    const updatedPayment = await db('transactions')
      .where('id', id)
      .first();

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: { payment: updatedPayment }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/earnings
// @desc    Get creator earnings
// @access  Private
router.get('/earnings', protect, async (req, res) => {
  try {
    const earnings = await db('transactions')
      .where('creator_id', req.user.id)
      .where('status', 'completed')
      .sum('amount as total_earned')
      .count('id as total_transactions')
      .first();

    const recentEarnings = await db('transactions')
      .join('content', 'transactions.content_id', 'content.id')
      .join('users', 'transactions.user_id', 'users.id')
      .select(
        'transactions.*',
        'content.title as content_title',
        'users.username as buyer_username'
      )
      .where('transactions.creator_id', req.user.id)
      .where('transactions.status', 'completed')
      .orderBy('transactions.created_at', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        total_earned: earnings.total_earned || 0,
        total_transactions: earnings.total_transactions || 0,
        recent_earnings: recentEarnings
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;