const express = require('express');
const { getServices, getAllServicesAdmin, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('ADMIN'), createService);

router.get('/admin/all', protect, authorize('ADMIN'), getAllServicesAdmin);

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorize('ADMIN'), updateService)
  .delete(protect, authorize('ADMIN'), deleteService);

module.exports = router;
