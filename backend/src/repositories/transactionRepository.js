const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class TransactionRepository {
  async findAll() {
    try {
      const result = await db.query("SELECT * FROM transactions");
      return result.rows;
    } catch (error) {
      console.error('Error in TransactionRepository.findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      id = id.trim(); // Ensure clean ID without whitespace
      const result = await db.query("SELECT * FROM transactions WHERE id = $1", [id]);
      return result.rows;
    } catch (error) {
      console.error('Error in TransactionRepository.findById:', error);
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const result = await db.query("SELECT * FROM transactions WHERE user_id = $1", [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error in TransactionRepository.findByUserId:', error);
      throw error;
    }
  }

  async create(userId, itemId, quantity, total, status = 'pending') {
    try {
      const id = uuidv4();
      const result = await db.query(
        "INSERT INTO transactions (id, user_id, item_id, quantity, total, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [id, userId, itemId, quantity, total, status]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.create:', error);
      throw error;
    }
  }

  async updateStatus(id, status) {
    try {
      // Validate status (optional, can do this in controller too)
      const validStatuses = ['pending', 'paid', 'completed', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid transaction status: ${status}`);
      }

      const result = await db.query(
        "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in TransactionRepository.updateStatus:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const transaction = await this.findById(id);
      if (transaction.length === 0) return null;
      
      await db.query("DELETE FROM transactions WHERE id = $1", [id]);
      return transaction[0];
    } catch (error) {
      console.error('Error in TransactionRepository.delete:', error);
      throw error;
    }
  }

  async findAllWithDetails() {
    try {
      const query = `
        SELECT 
          t.*,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'password', u.password,
            'balance', u.balance,
            'created_at', u.created_at
          ) as user,
          json_build_object(
            'id', i.id,
            'name', i.name,
            'price', i.price,
            'store_id', i.store_id,
            'image_url', i.image_url,
            'stock', i.stock,
            'created_at', i.created_at
          ) as item
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN items i ON t.item_id = i.id
        ORDER BY t.created_at DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in TransactionRepository.findAllWithDetails:', error);
      throw error;
    }
  }
}

module.exports = new TransactionRepository();