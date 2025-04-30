const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// Get all transactions (add this line)
router.get('/', transactionController.getAllTransactions);
// Existing routes
router.post('/create', transactionController.createTransaction);
router.post('/pay/:id', transactionController.payTransaction); 
router.post('/pay', transactionController.payTransaction);   
router.get('/user/:userId', transactionController.getUserTransactions);
router.get('/:id', transactionController.getTransactionById);  
router.put('/status/:id', transactionController.updateTransactionStatus);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;