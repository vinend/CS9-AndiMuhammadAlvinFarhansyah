const db = require('../database/connection');

class UserRepository {
  async findByEmail(email) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows;
    } catch (error) {
      console.error('Error in UserRepository.findByEmail:', error);
      throw error;
    }
  }
  
  async findById(id) {
    try {
      const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
      return result.rows;
    } catch (error) {
      console.error('Error in UserRepository.findById:', error);
      throw error;
    }
  }

  async create(name, email, password) {
    try {
      const result = await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, balance, created_at",
        [name, email, password]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in UserRepository.create:', error);
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const result = await db.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2",
        [email, password]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in UserRepository.authenticateUser:', error);
      throw error;
    }
  }

  async update(id, fields) {
    try {
      const { updateFields, queryParams } = this._buildUpdateQuery(fields);
      queryParams.push(id);
      
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${queryParams.length} 
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, queryParams);
      return result.rows[0];
    } catch (error) {
      console.error('Error in UserRepository.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const user = await this.findById(id);
      if (user.length === 0) return null;
      
      await db.query("DELETE FROM users WHERE id = $1", [id]);
      return user[0];
    } catch (error) {
      console.error('Error in UserRepository.delete:', error);
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

module.exports = new UserRepository();