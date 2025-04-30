const db = require('../database/connection');

class StoreRepository {
  async findAll() {
    try {
      const result = await db.query("SELECT * FROM stores");
      return result.rows;
    } catch (error) {
      console.error('Error in StoreRepository.findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await db.query("SELECT * FROM stores WHERE id = $1", [id]);
      return result.rows;
    } catch (error) {
      console.error('Error in StoreRepository.findById:', error);
      throw error;
    }
  }

  async create(name, address) {
    try {
      const result = await db.query(
        "INSERT INTO stores (name, address) VALUES ($1, $2) RETURNING *",
        [name, address]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in StoreRepository.create:', error);
      throw error;
    }
  }

  async update(id, name, address) {
    try {
      const result = await db.query(
        "UPDATE stores SET name = $1, address = $2 WHERE id = $3 RETURNING *",
        [name, address, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in StoreRepository.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const store = await this.findById(id);
      if (store.length === 0) return null;
      
      await db.query("DELETE FROM stores WHERE id = $1", [id]);
      return store[0];
    } catch (error) {
      console.error('Error in StoreRepository.delete:', error);
      throw error;
    }
  }
}

module.exports = new StoreRepository();