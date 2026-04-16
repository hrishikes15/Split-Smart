const express = require('express');
const router = express.Router();
const { registerUser, loginUser, searchUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/search', protect, searchUsers);

module.exports = router;
