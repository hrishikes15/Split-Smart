const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroupById, addMember, deleteGroup } = require('../controllers/groupController');
const { getGroupBalances, getSettlements } = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');
const expenseRoutes = require('./expenseRoutes');

router.route('/')
  .post(protect, createGroup)
  .get(protect, getGroups);

router.route('/:id')
  .get(protect, getGroupById)
  .delete(protect, deleteGroup);

router.route('/:id/members')
  .put(protect, addMember);

// Mount Expense Routes
router.use('/:groupId/expenses', expenseRoutes);

router.route('/:groupId/balances')
  .get(protect, getGroupBalances);

router.route('/:groupId/settlements')
  .get(protect, getSettlements);

module.exports = router;
