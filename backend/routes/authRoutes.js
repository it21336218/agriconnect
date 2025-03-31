const express = require('express');
const { register, login, getUserCount , deleteUser, getAllUsers} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user-count', getUserCount);
router.get('/users', getAllUsers);
router.delete('/:id',  deleteUser);

module.exports = router;
