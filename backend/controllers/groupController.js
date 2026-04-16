const Group = require('../models/Group');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    
    // Auto-include owner if not in members
    let memberIds = members || [];
    if (!memberIds.includes(req.user._id.toString())) {
      memberIds.push(req.user._id);
    }

    const group = await Group.create({
      name,
      owner: req.user._id,
      members: memberIds,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 
      members: req.user._id 
    }).populate('members', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('owner', 'name email');

    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // Check if user is part of group
    if (!group.members.some(m => m._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized for this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to group
// @route   PUT /api/groups/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { memberId, email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    // Only owner or existing members can add
    if (!group.members.includes(req.user._id) && !group.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let userIdToAdd = memberId;

    // If email is provided instead of memberId, look up the user
    if (!userIdToAdd && email) {
      const User = require('../models/User');
      const foundUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!foundUser) {
        return res.status(404).json({ message: 'No user found with that email. They need to register first.' });
      }
      userIdToAdd = foundUser._id;
    }

    if (!userIdToAdd) {
      return res.status(400).json({ message: 'Please provide a member email or ID' });
    }

    // Check if already a member
    const alreadyMember = group.members.some(m => m.toString() === userIdToAdd.toString());
    if (alreadyMember) {
      return res.status(400).json({ message: 'This user is already a member of the group' });
    }

    group.members.push(userIdToAdd);
    await group.save();

    // Return populated group
    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('owner', 'name email');

    res.json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a group completely
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    // Importing the service functionally to avoid circular dependencies if any occur 
    const { deleteGroupById } = require('../services/groupService');
    await deleteGroupById(groupId, userId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ message: 'Not authorized: Only the group owner can delete it' });
    }
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  deleteGroup
};
