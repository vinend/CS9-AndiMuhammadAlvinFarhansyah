const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/topUp', userController.TopUpBalance); 
router.get('/:email', userController.getUserByEmail);
router.put('/', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;