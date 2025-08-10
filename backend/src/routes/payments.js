const express = require('express');
const router = express.Router();

// Placeholder endpoints
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Payments route healthy' });
});

module.exports = router;