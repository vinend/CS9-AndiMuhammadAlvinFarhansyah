const storeRepository = require('../repositories/storeRepository');

class StoreController {
  async getAllStores(req, res) {
    try {
      const stores = await storeRepository.findAll();
      res.json(stores);
    } catch (err) {
      console.error('Error in getAllStores:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getStoreById(req, res) {
    try {
      const result = await storeRepository.findById(req.params.id);
      
      if (result.length === 0) {
        return res.status(200).json({ 
          message: "Store not found",
          success: false,
          payload: "null"
        });
      }
      
      res.status(200).json({ 
        message: "Store found",
        success: true,
        payload: result
      });
    } catch (err) {
      console.error('Error in getStoreById:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async createStore(req, res) {
    const { name, address } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }
    
    try {
      const store = await storeRepository.create(name, address);
      res.status(201).json(store);
    } catch (err) {
      console.error('Error in createStore:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async updateStore(req, res) {
    const { id, name, address } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "ID is required!" });
    }
    
    try {
      const storeExists = await storeRepository.findById(id);
      
      if (storeExists.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Store not found", 
          payload: null 
        });
      }
      
      const updatedStore = await storeRepository.update(id, name, address);
      
      res.status(200).json({ 
        success: true, 
        message: "Store updated", 
        payload: updatedStore 
      });
    } catch (err) {
      console.error('Error in updateStore:', err);
      res.status(500).json({ 
        success: false, 
        message: "Error updating store", 
        payload: null 
      });
    }
  }

  async deleteStore(req, res) {
    const id = req.params.id;

    if(!id) {
      return res.status(400).json({ 
        success: false,
        message: "ID is required!",
        payload: null
      });
    }

    try {
      const deletedStore = await storeRepository.delete(id);
      
      if (!deletedStore) {
        return res.status(404).json({
          success: false,
          message: "Store not deleted",
          payload: null
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Store deleted",
        payload: deletedStore
      });
    } catch(err) {
      console.error('Error in deleteStore:', err);
      res.status(500).json({
        success: false, 
        message: "Error deleting store", 
        payload: null
      });
    }
  }
}

module.exports = new StoreController();