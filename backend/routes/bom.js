const express = require('express');
const { createBOM, getBOMByBooking, getMyBOMs, updateBOM, submitBOM, approveBOM, rejectBOM } = require('../controllers/bomController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createBOM);
router.get('/my', getMyBOMs);
router.get('/booking/:bookingId', getBOMByBooking);

router.route('/:id')
  .put(updateBOM);

router.put('/:id/submit', submitBOM);
router.put('/:id/approve', approveBOM);
router.put('/:id/reject', rejectBOM);

module.exports = router;
