const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class ItemRepository {
  async findAll() {
    try {
      const result = await db.query("SELECT * FROM items");
      return result.rows;
    } catch (error) {
      console.error('Error in ItemRepository.findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await db.query("SELECT * FROM items WHERE id = $1", [id]);
      return result.rows;
    } catch (error) {
      console.error('Error in ItemRepository.findById:', error);
      throw error;
    }
  }

  async findByStoreId(storeId) {
    try {
      const result = await db.query("SELECT * FROM items WHERE store_id = $1", [storeId]);
      return result.rows;
    } catch (error) {
      console.error('Error in ItemRepository.findByStoreId:', error);
      throw error;
    }
  }

  async create(name, price, storeId, imageUrl, stock) {
    try {
      const id = uuidv4();
      const result = await db.query(
        "INSERT INTO items (id, name, price, store_id, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [id, name, price, storeId, imageUrl, stock]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.create:', error);
      throw error;
    }
  }

  async update(id, fields) {
    try {
      const { updateFields, queryParams } = this._buildUpdateQuery(fields);
      queryParams.push(id);
      
      const updateQuery = `
        UPDATE items 
        SET ${updateFields.join(', ')} 
        WHERE id = $${queryParams.length} 
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, queryParams);
      return result.rows[0];
    } catch (error) {
      console.error('Error in ItemRepository.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const item = await this.findById(id);
      if (item.length === 0) return null;
      
      await db.query("DELETE FROM items WHERE id = $1", [id]);
      return item[0];
    } catch (error) {
      console.error('Error in ItemRepository.delete:', error);
      throw error;
    }
  }

  _buildUpdateQuery(fields) {
    const updateFields = [];
    const queryParams = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && key !== 'id') {
        updateFields.push(`${key} = $${paramCount}`);
        queryParams.push(value);
        paramCount++;
      }
    }
    
    return { updateFields, queryParams };
  }
}

// Export a new instance of the repository
const itemRepository = new ItemRepository();
module.exports = itemRepository;