const mongoose = require('mongoose');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');

const deleteGroupById = async (groupId, userId) => {
  try {
    const group = await Group.findById(groupId);

    // 1. Validation: Check if group exists
    if (!group) {
      throw new Error('NOT_FOUND');
    }

    // 2. Validation: Check if the requester is the owner
    if (group.owner.toString() !== userId.toString()) {
      throw new Error('UNAUTHORIZED');
    }

    // 3. Delete all expenses tied to this group
    await Expense.deleteMany({ groupId: groupId });

    // 4. Remove group reference from all members' documents
    // Note: Assuming your User model has a `groups` array field, this $pull safely removes it. 
    await User.updateMany(
      { _id: { $in: group.members } },
      { $pull: { groups: groupId } }
    );

    // 5. Delete the group itself
    await Group.findByIdAndDelete(groupId);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  deleteGroupById,
};