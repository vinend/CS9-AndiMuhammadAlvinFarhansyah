const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
const itemRepository = require('../repositories/itemRepository');
const { formatResponse } = require('../utils/responseFormatter');

class TransactionController {
  constructor() {
    this.getAllTransactions = this.getAllTransactions.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.getTransactionById = this.getTransactionById.bind(this);
    this.getUserTransactions = this.getUserTransactions.bind(this);
    this.updateTransactionStatus = this.updateTransactionStatus.bind(this);
    this.payTransaction = this.payTransaction.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
  }

  async createTransaction(req, res) {
    try {
      const { user_id, item_id, quantity = 1 } = req.body;
      
      if (!user_id || !item_id) {
        return res.status(400).json(formatResponse(false, "User ID and Item ID are required", null));
      }
      
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json(formatResponse(false, "Quantity must be larger than 0", null));
      }
      
      const users = await userRepository.findById(user_id);
      if (users.length === 0) {
        return res.status(404).json(formatResponse(false, "User not found", null));
      }
      
      const items = await itemRepository.findById(item_id);
      if (items.length === 0) {
        return res.status(404).json(formatResponse(false, "Item not found", null));
      }
      const item = items[0];
      
      const total = item.price * parsedQuantity;
      
      const transaction = await transactionRepository.create(
        user_id,
        item_id,
        parsedQuantity,
        total,
        'pending' 
      );
      
      return res.status(201).json(formatResponse(true, "Transaction created", transaction));
    } catch (err) {
      console.error('Error in createTransaction:', err);
      return res.status(500).json(formatResponse(false, "Error creating transaction", null));
    }
  }

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json(formatResponse(false, "Transaction ID is required", null));
      }
      
      const transactions = await transactionRepository.findById(id);
      
      if (transactions.length === 0) {
        return res.status(404).json(formatResponse(false, "Transaction not found", null));
      }
      
      return res.status(200).json(formatResponse(true, "Transaction found", transactions[0]));
    } catch (err) {
      console.error('Error in getTransactionById:', err);
      return res.status(500).json(formatResponse(false, "Error retrieving transaction", null));
    }
  }

  async getUserTransactions(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json(formatResponse(false, "User ID is required", null));
      }
      
      const users = await userRepository.findById(userId);
      if (users.length === 0) {
        return res.status(404).json(formatResponse(false, "User not found", null));
      }
      
      const transactions = await transactionRepository.findByUserId(userId);
      
      return res.status(200).json(formatResponse(true, "Transactions retrieved successfully", transactions));
    } catch (err) {
      console.error('Error in getUserTransactions:', err);
      return res.status(500).json(formatResponse(false, "Error retrieving transactions", null));
    }
  }

  async updateTransactionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status) {
        return res.status(400).json(formatResponse(false, "Transaction ID and status are required", null));
      }
      
      const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(formatResponse(false, "Invalid status. Must be: pending, completed, cancelled, or refunded", null));
      }
      
      const transactions = await transactionRepository.findById(id);
      if (transactions.length === 0) {
        return res.status(404).json(formatResponse(false, "Transaction not found", null));
      }
      
      const updatedTransaction = await transactionRepository.updateStatus(id, status);
      
      return res.status(200).json(formatResponse(true, "Transaction status updated", updatedTransaction));
    } catch (err) {
      console.error('Error in updateTransactionStatus:', err);
      return res.status(500).json(formatResponse(false, "Error updating transaction status", null));
    }
  }

  async payTransaction(req, res) {
    try {
      let id = req.params.id || req.query.id || req.body.id;
      
      if (id) {
        id = id.trim();
      }
      
      console.log('Transaction ID for payment:', id);
      
      if (!id) {
        return res.status(400).json(formatResponse(false, "Transaction ID is required", null));
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json(formatResponse(false, "Invalid transaction ID format", null));
      }
      
      const transactions = await transactionRepository.findById(id);
      if (transactions.length === 0) {
        return res.status(404).json(formatResponse(false, "Transaction not found", null));
      }
      const transaction = transactions[0];
      
      if (transaction.status === 'paid') {
        return res.status(400).json(formatResponse(false, "Transaction is already paid", null));
      }
      
      if (transaction.status === 'cancelled') {
        return res.status(400).json(formatResponse(false, "Cannot pay a cancelled transaction", null));
      }
      
      const users = await userRepository.findById(transaction.user_id);
      if (users.length === 0) {
        return res.status(404).json(formatResponse(false, "User not found", null));
      }
      const user = users[0];
      
      if (user.balance < transaction.total) {
        return res.status(400).json(formatResponse(false, "Insufficient balance", null));
      }
      
      const newBalance = user.balance - transaction.total;
      await userRepository.update(transaction.user_id, { balance: newBalance });
      
      const items = await itemRepository.findById(transaction.item_id);
      if (items.length === 0) {
        await userRepository.update(transaction.user_id, { balance: user.balance });
        return res.status(404).json(formatResponse(false, "Item not found, payment cancelled", null));
      }
      const item = items[0];
      
      if (item.stock < transaction.quantity) {
        await userRepository.update(transaction.user_id, { balance: user.balance });
        return res.status(400).json(formatResponse(false, `Not enough stock. Available: ${item.stock}`, null));
      }
      
      const newStock = item.stock - transaction.quantity;
      await itemRepository.update(transaction.item_id, { stock: newStock });
      
      const updatedTransaction = await transactionRepository.updateStatus(id, 'paid');
      
      return res.status(200).json(formatResponse(true, "Payment successful", updatedTransaction));
    } catch (err) {
      console.error('Error in payTransaction:', err);
      return res.status(500).json(formatResponse(false, "Failed to pay", null));
    }
  }

  async deleteTransaction(req, res) {
    try {
      let id = req.params.id;
      
      if (id) {
        id = id.trim();
      }
      
      console.log('Transaction ID for deletion:', id);
      
      if (!id) {
        return res.status(400).json(formatResponse(false, "Transaction ID is required", null));
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return res.status(400).json(formatResponse(false, "Invalid transaction ID format", null));
      }
      
      const deletedTransaction = await transactionRepository.delete(id);
      
      if (!deletedTransaction) {
        return res.status(404).json(formatResponse(false, "Transaction not found", null));
      }
      
      return res.status(200).json(formatResponse(true, "Transaction deleted", deletedTransaction));
    } catch (err) {
      console.error('Error in deleteTransaction:', err);
      return res.status(500).json(formatResponse(false, "Failed to delete transaction", null));
    }
  }

  async getAllTransactions(req, res) {
    try {
      console.log('Getting all transactions with details...');
      
      const transactions = await transactionRepository.findAllWithDetails();
      
      return res.status(200).json(formatResponse(true, "Transactions found", transactions));
    } catch (err) {
      console.error('Error in getAllTransactions:', err);
      return res.status(500).json(formatResponse(false, "Error retrieving transactions", null));
    }
  }
}

module.exports = new TransactionController();