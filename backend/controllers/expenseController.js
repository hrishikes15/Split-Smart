const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc    Add expense to group
// @route   POST /api/groups/:groupId/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, amount, paidBy, splitType, splits } = req.body;

    // Verify group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate splits amount
    let totalSplit = 0;
    splits.forEach(s => totalSplit += s.amount);
    
    if (Math.abs(totalSplit - amount) > 1) { // 1 cent threshold for rounding
       return res.status(400).json({ message: `Splits do not sum up correctly. Total: ${totalSplit}, Expected: ${amount}` });
    }

    const expense = await Expense.create({
      groupId,
      title,
      amount,
      paidBy,
      splitType,
      splits
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expenses for a group
// @route   GET /api/groups/:groupId/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verify user is in group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const expenses = await Expense.find({ groupId, deletedAt: null })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete an expense
// @route   DELETE /api/groups/:groupId/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    expense.deletedAt = new Date();
    await expense.save();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense
};
