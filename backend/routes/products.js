const express = require('express');
const { 
  getProducts, 
  getAllProductsAdmin, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('ADMIN'), createProduct);

router.get('/admin/all', protect, authorize('ADMIN'), getAllProductsAdmin);

router.route('/:id')
  .put(protect, authorize('ADMIN'), updateProduct)
  .delete(protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
