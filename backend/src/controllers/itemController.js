const itemRepository = require('../repositories/itemRepository');
const storeRepository = require('../repositories/storeRepository');
const { formatResponse } = require('../utils/responseFormatter');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxincp0vo',
  api_key: '586264858438214',
  api_secret: 'XGLG6mmN400RZKZGPB9keWBzVNA'
});

class ItemController {
  constructor() {
    // Bind methods to ensure 'this' is available in async callbacks
    this.getAllItems = this.getAllItems.bind(this);
    this.getItemById = this.getItemById.bind(this);
    this.getItemsByStoreId = this.getItemsByStoreId.bind(this);
    this.createItem = this.createItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this._uploadImageToCloudinary = this._uploadImageToCloudinary.bind(this);
  }

  async getAllItems(req, res) {
    try {
      const items = await itemRepository.findAll();
      res.status(200).json(formatResponse(true, "Items found", items));
    } catch (err) {
      console.error('Error in getAllItems:', err);
      res.status(500).json(formatResponse(false, "Error retrieving items", null));
    }
  }

  async getItemById(req, res) {
    try {
      const result = await itemRepository.findById(req.params.id);
      
      if (result.length === 0) {
        return res.status(404).json(formatResponse(false, "Item not found", null));
      }
      
      res.status(200).json(formatResponse(true, "Item found", result[0]));
    } catch (err) {
      console.error('Error in getItemById:', err);
      res.status(500).json(formatResponse(false, "Error retrieving item", null));
    }
  }

  async getItemsByStoreId(req, res) {
    try {
      const storeId = req.params.storeId;
      
      // Check if the store exists
      const storeExists = await storeRepository.findById(storeId);
      if (storeExists.length === 0) {
        return res.status(404).json(formatResponse(false, "Store not found", null));
      }
      
      const items = await itemRepository.findByStoreId(storeId);
      res.status(200).json(formatResponse(true, "Items retrieved successfully", items));
    } catch (err) {
      console.error('Error in getItemsByStoreId:', err);
      res.status(500).json(formatResponse(false, "Error retrieving items", null));
    }
  }

  async createItem(req, res) {
    try {
      console.log('Request body:', req.body);
      console.log('Request file:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file');
      
      // Get form-data fields
      let { name, price, store_id, stock } = req.body;
      const imageFile = req.file;
      
      // Trim any whitespace from the store_id
      if (store_id) {
        store_id = store_id.trim();
        console.log('Trimmed store_id:', store_id);
      }
      
      // Validate required fields
      if (!name || !price || !store_id || !stock) {
        return res.status(400).json(formatResponse(false, "Name, price, store_id, and stock are required", null));
      }
      
      // Check if store exists
      try {
        console.log('Checking if store exists with ID:', store_id);
        const storeExists = await storeRepository.findById(store_id);
        console.log('Store exists check result:', storeExists);
        
        if (storeExists.length === 0) {
          return res.status(404).json(formatResponse(false, "Store doesn't exist", null));
        }
      } catch (storeError) {
        console.error('Error checking store existence:', storeError);
        return res.status(400).json(formatResponse(false, "Invalid store_id format", null));
      }
      
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        try {
          console.log('Uploading image to Cloudinary:', imageFile.originalname);
          imageUrl = await this._uploadImageToCloudinary(imageFile);
          console.log('Image uploaded successfully, URL:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          
          // Fall back to placeholder image instead of failing the whole request
          imageUrl = `https://via.placeholder.com/300?text=${encodeURIComponent(imageFile.originalname)}`;
          console.log('Using placeholder image instead:', imageUrl);
        }
      }
      
      // Parse numeric values
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);
      
      if (isNaN(parsedPrice) || isNaN(parsedStock)) {
        return res.status(400).json(formatResponse(false, "Price and stock must be valid numbers", null));
      }
      
      // Create item
      console.log('Creating item with values:', {
        name,
        price: parsedPrice,
        store_id,
        imageUrl,
        stock: parsedStock
      });
      
      const newItem = await itemRepository.create(
        name,
        parsedPrice,
        store_id,
        imageUrl,
        parsedStock
      );
      
      console.log('Item created successfully:', newItem);
      return res.status(201).json(formatResponse(true, "Item created", newItem));
    } catch (err) {
      console.error('Error in createItem:', err);
      res.status(500).json(formatResponse(false, "Error creating item: " + err.message, null));
    }
  }

  async updateItem(req, res) {
    try {
      let { id, name, price, store_id, stock } = req.body;
      const imageFile = req.file;
      
      // Trim any whitespace from IDs
      if (id) id = id.trim();
      if (store_id) store_id = store_id.trim();
      
      if (!id) {
        return res.status(400).json(formatResponse(false, "Item ID is required", null));
      }
      
      // Check if item exists
      try {
        const itemExists = await itemRepository.findById(id);
        if (itemExists.length === 0) {
          return res.status(404).json(formatResponse(false, "Item not found", null));
        }
      } catch (idError) {
        return res.status(400).json(formatResponse(false, "Invalid item ID format", null));
      }
      
      // Check if store exists if store_id is provided
      if (store_id) {
        try {
          const storeExists = await storeRepository.findById(store_id);
          if (storeExists.length === 0) {
            return res.status(404).json(formatResponse(false, "Store doesn't exist", null));
          }
        } catch (storeIdError) {
          return res.status(400).json(formatResponse(false, "Invalid store ID format", null));
        }
      }
      
      // Upload image if provided
      let imageUrl = undefined;
      if (imageFile) {
        try {
          console.log('Uploading image to Cloudinary for update:', imageFile.originalname);
          imageUrl = await this._uploadImageToCloudinary(imageFile);
          console.log('Image uploaded successfully for update, URL:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary for update:', uploadError);
          
          // Fall back to a placeholder
          imageUrl = `https://via.placeholder.com/300?text=${encodeURIComponent(imageFile.originalname)}`;
          console.log('Using placeholder image instead for update:', imageUrl);
        }
      }
      
      // Parse numeric values if provided
      let parsedPrice = undefined;
      let parsedStock = undefined;
      
      if (price !== undefined) {
        parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
          return res.status(400).json(formatResponse(false, "Price must be a valid number", null));
        }
      }
      
      if (stock !== undefined) {
        parsedStock = parseInt(stock);
        if (isNaN(parsedStock)) {
          return res.status(400).json(formatResponse(false, "Stock must be a valid number", null));
        }
      }
      
      // Prepare fields for update
      const fieldsToUpdate = {
        name,
        price: parsedPrice,
        store_id,
        image_url: imageUrl,
        stock: parsedStock
      };
      
      // Filter out undefined fields
      const filteredFields = Object.fromEntries(
        Object.entries(fieldsToUpdate).filter(([_, v]) => v !== undefined)
      );
      
      if (Object.keys(filteredFields).length === 0) {
        return res.status(400).json(formatResponse(false, "No fields to update", null));
      }
      
      const updatedItem = await itemRepository.update(id, filteredFields);
      return res.status(200).json(formatResponse(true, "Item updated", updatedItem));
      
    } catch (err) {
      console.error('Error in updateItem:', err);
      res.status(500).json(formatResponse(false, "Error updating item: " + err.message, null));
    }
  }

  async deleteItem(req, res) {
    try {
      let id = req.params.id;
      
      // Trim any whitespace from the ID
      if (id) id = id.trim();
      
      if (!id) {
        return res.status(400).json(formatResponse(false, "Item ID is required", null));
      }
      
      try {
        const deletedItem = await itemRepository.delete(id);
        
        if (!deletedItem) {
          return res.status(404).json(formatResponse(false, "Item not found", null));
        }
        
        return res.status(200).json(formatResponse(true, "Item deleted", deletedItem));
      } catch (idError) {
        return res.status(400).json(formatResponse(false, "Invalid item ID format", null));
      }
    } catch (err) {
      console.error('Error in deleteItem:', err);
      res.status(500).json(formatResponse(false, "Error deleting item: " + err.message, null));
    }
  }

  async _uploadImageToCloudinary(file) {
    return new Promise((resolve, reject) => {
      console.log('Starting Cloudinary upload process');
      
      // Create a readable stream from the buffer
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Signal the end of the stream
      
      // Create upload stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'express-tp-items', // Folder in Cloudinary to store images
          resource_type: 'auto',      // Let Cloudinary determine the type
          public_id: `item_${Date.now()}` // Unique identifier for the image
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
            return;
          }
          
          console.log('Cloudinary upload successful - URL:', result.secure_url);
          resolve(result.secure_url);
        }
      );
      
      // Pipe the readable stream to the upload stream
      stream.pipe(uploadStream);
    });
  }
}

module.exports = new ItemController();