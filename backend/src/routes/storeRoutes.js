const express = require('express');
const storeController = require('../controllers/storeController');

const router = express.Router();

// Store routes
router.get('/getAll', storeController.getAllStores);
router.get('/get/:id', storeController.getStoreById);
router.post('/create', storeController.createStore);
router.put('/', storeController.updateStore);
router.delete('/delete/:id', storeController.deleteStore);

module.exports = router;