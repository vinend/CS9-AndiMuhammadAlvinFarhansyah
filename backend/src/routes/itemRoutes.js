const express = require('express');
const itemController = require('../controllers/itemController');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  }
});

// Item routes
router.get('/', itemController.getAllItems);
router.get('/byId/:id', itemController.getItemById);
router.get('/byStoreId/:storeId', itemController.getItemsByStoreId);
router.post('/create', upload.single('image'), itemController.createItem);
router.put('/', upload.single('image'), itemController.updateItem);
router.delete('/delete/:id', itemController.deleteItem);

module.exports = router;