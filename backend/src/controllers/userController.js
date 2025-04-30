const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');  // Add this import

class UserController {
  async register(req, res) {
    const name = req.query.name;
    const email = req.query.email;
    const password = req.query.password;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
        payload: null
      });
    }

    const validEmail = emailRegex.test(email);
    const validPassword = passwordRegex.test(password);

    if (!validEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
        payload: null
      }); 
    }

    if(!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        payload: null });
    }
    
    try {
      const emailCheck = await userRepository.findByEmail(email);
      
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
          payload: null
        });
      }
      
      // Hash the password - using promisified version for cleaner async code
      const hashedPassword = await bcrypt.hash(password, 10);
          
      // Store user with hashed password
      const user = await userRepository.create(name, email, hashedPassword);
      
      res.status(201).json({
        success: true,
        message: "User created",
        payload: user
      });
    } catch (err) {
      console.error('Error in register:', err);
      res.status(500).json({
        success: false,
        message: "Error registering user",
        payload: null
      });
    }
  }

  async login(req, res) {
    const email = req.query.email;
    const password = req.query.password;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        payload: null
      });
    }
    
    try {
      // First find the user by email
      const users = await userRepository.findByEmail(email);
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
          payload: null
        });
      }
      
      const user = users[0];
      
      // Now compare the provided password with the stored hash
      const passwordMatches = await bcrypt.compare(password, user.password);
      
      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
          payload: null
        });
      }
      
      // Password is valid, return user info
      res.status(200).json({
        success: true,
        message: "Login success",
        payload: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({
        success: false,
        message: "Error during login",
        payload: null
      });
    }
  }

  async getUserByEmail(req, res) {
    const email = req.params.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        payload: null
      });
    }
    
    try {
      const user = await userRepository.findByEmail(email);
      
      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          payload: null
        });
      }
      
      // Don't return the password hash
      const { password, ...userWithoutPassword } = user[0];
      
      res.status(200).json({
        success: true,
        message: "User found",
        payload: userWithoutPassword
      });
    } catch (err) {
      console.error('Error in getUserByEmail:', err);
      res.status(500).json({
        success: false,
        message: "Error retrieving user",
        payload: null
      });
    }
  }

  async updateUser(req, res) {
    const { id, name, email, password } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        payload: null
      });
    }
    
    try {
      const checkUser = await userRepository.findById(id);
      
      if (checkUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          payload: null
        });
      }
      
      // Prepare fields for update
      let fieldsToUpdate = {};
      
      if (name !== undefined) {
        fieldsToUpdate.name = name;
      }
      
      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: "Invalid email",
            payload: null
          });
        }
        fieldsToUpdate.email = email;
      }
      
      if (password !== undefined) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            payload: null
          });
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        fieldsToUpdate.password = hashedPassword;
      }
      
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(200).json({
          success: true,
          message: "No changes to update",
          payload: checkUser[0]
        });
      }
      
      const updatedUser = await userRepository.update(id, fieldsToUpdate);
      
      res.status(200).json({
        success: true,
        message: "User updated",
        payload: updatedUser
      });
    } catch (err) {
      console.error('Error in updateUser:', err);
      res.status(500).json({
        success: false,
        message: "Error updating user",
        payload: null
      });
    }
  }

  async deleteUser(req, res) {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        payload: null
      });
    }

    try {
      const deletedUser = await userRepository.delete(id);
      
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          payload: null
        });
      }
      
      res.status(200).json({
        success: true,
        message: "User deleted",
        payload: deletedUser
      });
    } catch(err) {
      console.error('Error in deleteUser:', err);
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        payload: null
      });
    }
  }

  async TopUpBalance(req, res) {
    try {
      // Get parameters from query string
      const id = req.query.id;
      let amount = parseInt(req.query.amount);
      
      // Validate parameters
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
          payload: null
        });
      }
      
      if (isNaN(amount)) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid number",
          payload: null
        });
      }
      
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be larger than 0",
          payload: null
        });
      }
      
      // Find user by ID
      const users = await userRepository.findById(id);
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          payload: null
        });
      }
      
      const user = users[0];
      
      // Calculate new balance
      const currentBalance = user.balance || 0;
      const newBalance = currentBalance + amount;
      
      // Update user balance in database
      const updatedUser = await userRepository.update(id, { balance: newBalance });
      
      // Return success response with updated user data
      return res.status(200).json({
        success: true,
        message: "Top up successful",
        payload: updatedUser
      });
    } catch (err) {
      console.error('Error in TopUpBalance:', err);
      return res.status(500).json({
        success: false,
        message: "Error processing top up request",
        payload: null
      });
    }
  }
}

module.exports = new UserController();