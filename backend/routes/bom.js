const express = require('express');
const {
  createBOM,
  getBOMByBooking,
  getBOMById,
  getMyBOMs,
  updateBOM,
  submitBOM,
  approveBOM,
  rejectBOM,
  generateAISuggestions,
  selectProducts,
  addBOMToCart,
  getAllBOMsAdmin,
  adminApproveBOM,
  adminRejectBOM,
  getBOMAnalytics
} = require('../controllers/bomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Technician CRUD
router.post('/', createBOM);
router.get('/my', getMyBOMs);
router.get('/booking/:bookingId', getBOMByBooking);

// Admin endpoints (must be before /:id to avoid route collision)
router.get('/admin/all', authorize('ADMIN'), getAllBOMsAdmin);
router.get('/admin/analytics', authorize('ADMIN'), getBOMAnalytics);
router.put('/admin/:id/approve', authorize('ADMIN'), adminApproveBOM);
router.put('/admin/:id/reject', authorize('ADMIN'), adminRejectBOM);

// BOM-to-Cart
router.post('/cart/from-bom', addBOMToCart);

// Individual BOM operations
router.route('/:id')
  .get(getBOMById)
  .put(updateBOM);

router.put('/:id/submit', submitBOM);
router.put('/:id/approve', approveBOM);
router.put('/:id/reject', rejectBOM);

// AI Suggestions
router.post('/:id/ai-suggestions', generateAISuggestions);
router.put('/:id/select-products', selectProducts);

module.exports = router;
