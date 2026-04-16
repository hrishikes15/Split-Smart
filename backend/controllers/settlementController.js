const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { minimizeTransactions } = require('../utils/settlementAlgorithm');

// @desc    Get group balances
// @route   GET /api/groups/:groupId/balances
// @access  Private
const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verify user is in group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expenses = await Expense.find({ groupId, deletedAt: null });

    // Calculate Net Balances
    // Balance > 0 means user is owed money (creditor)
    // Balance < 0 means user owes money (debtor)
    const balances = {};

    // Initialize all members with 0 balance
    group.members.forEach(memberId => {
      balances[memberId.toString()] = 0;
    });

    expenses.forEach(expense => {
      // The person who paid getting positive balance
      const paidByStr = expense.paidBy.toString();
      if (balances[paidByStr] !== undefined) {
          balances[paidByStr] += expense.amount;
      } else {
          balances[paidByStr] = expense.amount;
      }

      // Everyone who partakes in the split getting negative balance
      expense.splits.forEach(split => {
        const splitUserStr = split.user.toString();
        if (balances[splitUserStr] !== undefined) {
             balances[splitUserStr] -= split.amount;
        } else {
             balances[splitUserStr] = -split.amount;
        }
      });
    });

    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get optimal settlements (who pays whom)
// @route   GET /api/groups/:groupId/settlements
// @access  Private
const getSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Validate group access
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expenses = await Expense.find({ groupId, deletedAt: null });

    const balances = {};

    // Calculate balances
    expenses.forEach(expense => {
      const paidByStr = expense.paidBy.toString();
      balances[paidByStr] = (balances[paidByStr] || 0) + expense.amount;

      expense.splits.forEach(split => {
        const splitUserStr = split.user.toString();
        balances[splitUserStr] = (balances[splitUserStr] || 0) - split.amount;
      });
    });

    // Run greedy algorithm
    const transactions = minimizeTransactions(balances);

    // Now populate user info for readable output
    const populatedTransactions = await Promise.all(
      transactions.map(async (t) => {
         const fromUser = await Group.db.model('User').findById(t.from).select('name email');
         const toUser = await Group.db.model('User').findById(t.to).select('name email');
         return {
           from: fromUser,
           to: toUser,
           amount: t.amount
         };
      })
    );

    res.json(populatedTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroupBalances,
  getSettlements
};
