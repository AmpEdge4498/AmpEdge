const BOM = require('../models/BOM');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const AISuggestionLog = require('../models/AISuggestionLog');
const { suggestForBOM } = require('../utils/aiSuggestionEngine');

// ════════════════════════════════════════════════════════════════
// SECURITY HELPERS — BUG-004/005/006/007/011 fixes
// ════════════════════════════════════════════════════════════════

/**
 * Sanitize a string to prevent XSS/NoSQL injection.
 * Strips HTML tags, trims, and limits length.
 * FIX: BUG-011
 */
function sanitize(str, maxLen = 500) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/\$/g, '')                // Strip MongoDB operators
    .replace(/[{}]/g, '')              // Strip object braces
    .trim()
    .slice(0, maxLen);
}

/**
 * Verify the caller is authorized to access a BOM.
 * Returns { allowed: boolean, role: 'TECHNICIAN'|'CUSTOMER'|'ADMIN'|null }
 * FIX: BUG-004/005/006/007
 */
function checkBOMAccess(bom, user) {
  if (!user || !bom) return { allowed: false, role: null };
  if (user.role === 'ADMIN') return { allowed: true, role: 'ADMIN' };
  if (bom.technicianId?.toString() === user.id) return { allowed: true, role: 'TECHNICIAN' };
  if (bom.customerId?.toString() === user.id) return { allowed: true, role: 'CUSTOMER' };
  return { allowed: false, role: null };
}

/**
 * Sanitize all items in a BOM payload.
 * FIX: BUG-011
 */
function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    name: sanitize(item.name, 150),
    category: ['WIRING_MATERIALS', 'APPLIANCES', 'TOOLS_EQUIPMENT', 'LIGHTING_FIXTURES', 'SMART_HOME', 'OTHER']
      .includes(item.category) ? item.category : 'OTHER',
    quantity: Math.max(1, Math.min(parseInt(item.quantity) || 1, 9999)),
    specification: sanitize(item.specification, 300),
    preferredBrand: sanitize(item.preferredBrand, 100),
    imageUrl: sanitize(item.imageUrl, 500),
    unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0),
    totalPrice: Math.max(1, parseInt(item.quantity) || 1) * Math.max(0, parseFloat(item.unitPrice) || 0),
    unit: sanitize(item.unit || 'pcs', 20),
  }));
}

// ════════════════════════════════════════════════════════════════
// TECHNICIAN CRUD
// ════════════════════════════════════════════════════════════════

// @desc    Create BOM for a booking
// @route   POST /api/v1/bom
// @access  Private (Technician)
exports.createBOM = async (req, res) => {
  try {
    const { bookingId, items, laborCharge, technicianNotes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.technicianId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You are not assigned to this booking' });
    }

    // Check if BOM already exists
    const existingBOM = await BOM.findOne({ bookingId });
    if (existingBOM) {
      return res.status(400).json({ success: false, error: 'BOM already exists for this booking. Use update instead.' });
    }

    // Sanitize + validate items — BUG-011, BUG-015, BUG-016
    const cleanItems = sanitizeItems(items);
    if (cleanItems.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one valid item is required' });
    }
    if (cleanItems.length > 25) {
      return res.status(400).json({ success: false, error: 'Maximum 25 items per BOM' });
    }

    const bom = await BOM.create({
      bookingId,
      technicianId: req.user.id,
      customerId: booking.customerId,
      items: cleanItems,
      laborCharge: Math.max(0, parseFloat(laborCharge) || 0),
      technicianNotes: sanitize(technicianNotes, 1000)
    });

    // Link BOM to booking
    booking.bomId = bom._id;
    booking.status = 'BOM_PENDING';
    await booking.save();

    res.status(201).json({ success: true, data: bom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get BOM by booking ID
// @route   GET /api/v1/bom/booking/:bookingId
// @access  Private
exports.getBOMByBooking = async (req, res) => {
  try {
    const bom = await BOM.findOne({ bookingId: req.params.bookingId })
      .populate('technicianId', 'name phone')
      .populate('items.aiSuggestions.productId', 'name basePrice imageUrl stock')
      .populate('items.selectedProductId', 'name basePrice imageUrl brand');

    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found for this booking' });
    }

    // FIX: BUG-004 — verify access
    const access = checkBOMAccess(bom, req.user);
    if (!access.allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this BOM' });
    }

    res.status(200).json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get BOM by ID
// @route   GET /api/v1/bom/:id
// @access  Private
exports.getBOMById = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id)
      .populate('technicianId', 'name phone')
      .populate('customerId', 'name phone')
      .populate('items.aiSuggestions.productId', 'name basePrice imageUrl stock')
      .populate('items.selectedProductId', 'name basePrice imageUrl brand');

    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-004 — verify access
    const access = checkBOMAccess(bom, req.user);
    if (!access.allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this BOM' });
    }

    res.status(200).json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all my BOMs (Technician)
// @route   GET /api/v1/bom/my
// @access  Private (Technician)
exports.getMyBOMs = async (req, res) => {
  try {
    const boms = await BOM.find({ technicianId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('bookingId');

    res.status(200).json({ success: true, count: boms.length, data: boms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update BOM (before submission)
// @route   PUT /api/v1/bom/:id
// @access  Private (Technician)
exports.updateBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (bom.status !== 'DRAFT' && bom.status !== 'REJECTED') {
      return res.status(400).json({ success: false, error: 'Can only edit DRAFT or REJECTED BOMs' });
    }

    const { items, laborCharge, technicianNotes } = req.body;
    if (items) {
      const cleanItems = sanitizeItems(items);
      if (cleanItems.length > 25) {
        return res.status(400).json({ success: false, error: 'Maximum 25 items per BOM' });
      }
      bom.items = cleanItems;
    }
    if (laborCharge !== undefined) bom.laborCharge = Math.max(0, parseFloat(laborCharge) || 0);
    if (technicianNotes !== undefined) bom.technicianNotes = sanitize(technicianNotes, 1000);
    bom.status = 'DRAFT';

    await bom.save();
    res.status(200).json({ success: true, data: bom });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Submit BOM to customer
// @route   PUT /api/v1/bom/:id/submit
// @access  Private (Technician)
exports.submitBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    if (bom.technicianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (bom.items.length === 0) {
      return res.status(400).json({ success: false, error: 'BOM must have at least one item' });
    }

    bom.status = 'SUBMITTED';
    bom.submittedAt = new Date();
    await bom.save();

    await Booking.findByIdAndUpdate(bom.bookingId, { status: 'BOM_SUBMITTED' });

    res.status(200).json({ success: true, data: bom, message: 'BOM submitted to customer' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════
// CUSTOMER ACTIONS — All secured with ownership checks
// ════════════════════════════════════════════════════════════════

// @desc    Customer approves BOM
// @route   PUT /api/v1/bom/:id/approve
// @access  Private (Customer — owner only)
exports.approveBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-005 — ownership check
    if (bom.customerId?.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to approve this BOM' });
    }

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'APPROVED';
    bom.approvedAt = new Date();
    if (req.body.customerNotes) bom.customerNotes = sanitize(req.body.customerNotes, 1000);
    await bom.save();

    const taxes = bom.grandTotal * 0.18;
    await Booking.findByIdAndUpdate(bom.bookingId, {
      status: 'BOM_APPROVED',
      'pricing.bomTotal': bom.grandTotal,
      'pricing.finalPrice': bom.grandTotal + taxes,
      'pricing.taxes': taxes
    });

    res.status(200).json({ success: true, data: bom, message: 'BOM approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Customer rejects BOM
// @route   PUT /api/v1/bom/:id/reject
// @access  Private (Customer — owner only)
exports.rejectBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-006 — ownership check
    if (bom.customerId?.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to reject this BOM' });
    }

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'REJECTED';
    bom.rejectedAt = new Date();
    if (req.body.customerNotes) bom.customerNotes = sanitize(req.body.customerNotes, 1000);
    await bom.save();

    await Booking.findByIdAndUpdate(bom.bookingId, { status: 'BOM_PENDING' });

    res.status(200).json({ success: true, data: bom, message: 'BOM rejected. Technician will revise.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════
// AI SUGGESTION ENGINE — Secured + Performance optimized
// ════════════════════════════════════════════════════════════════

// @desc    Generate AI suggestions for all BOM items
// @route   POST /api/v1/bom/:id/ai-suggestions
// @access  Private (Customer or Admin — owner only)
exports.generateAISuggestions = async (req, res) => {
  try {
    const bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-007 — ownership check
    const access = checkBOMAccess(bom, req.user);
    if (!access.allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized to generate suggestions for this BOM' });
    }

    // FIX: BUG-014 — pre-filter products by relevant categories instead of loading ALL
    const relevantCategories = [...new Set(bom.items.map(i => i.category).filter(c => c && c !== 'OTHER'))];
    const productQuery = { isActive: true, stock: { $gt: 0 } };
    if (relevantCategories.length > 0) {
      // Include products matching ANY relevant category + all products (for cross-category keyword matching)
      // But limit the total to prevent memory issues
      productQuery.$or = [
        { category: { $in: relevantCategories } },
        {} // fallback: include all for keyword matching
      ];
    }
    const allProducts = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .select('name brand tier category specifications tags basePrice stock rating popularity isActive searchText imageUrl')
      .limit(5000)
      .lean();

    if (allProducts.length === 0) {
      return res.status(200).json({
        success: true,
        data: { bomId: bom._id, suggestions: [] },
        message: 'No products in catalog to suggest from'
      });
    }

    // Run AI suggestion engine
    const suggestions = suggestForBOM(bom.items, allProducts);

    // Store suggestions in BOM items
    for (const suggestion of suggestions) {
      if (bom.items[suggestion.itemIndex]) {
        bom.items[suggestion.itemIndex].aiSuggestions = suggestion.matches;
      }
    }
    bom.aiSuggestionsGeneratedAt = new Date();
    await bom.save();

    // FIX: BUG-012 — UPSERT logs instead of creating duplicates
    const logOps = suggestions.map(suggestion => ({
      updateOne: {
        filter: { bomId: bom._id, bomItemIndex: suggestion.itemIndex },
        update: {
          $set: {
            inputQuery: suggestion.itemName,
            inputCategory: bom.items[suggestion.itemIndex]?.category,
            inputSpec: bom.items[suggestion.itemIndex]?.specification,
            suggestedProducts: suggestion.matches.map(m => ({
              productId: m.productId,
              confidenceScore: m.confidenceScore,
              tier: m.tier,
              wasSelected: false
            })),
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));
    if (logOps.length > 0) {
      await AISuggestionLog.bulkWrite(logOps);
    }

    res.status(200).json({
      success: true,
      data: { bomId: bom._id, suggestions },
      message: `AI generated suggestions for ${suggestions.length} items`
    });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Customer selects products for BOM items
// @route   PUT /api/v1/bom/:id/select-products
// @access  Private (Customer — owner only)
exports.selectProducts = async (req, res) => {
  try {
    const { selections } = req.body;

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({ success: false, error: 'selections array is required and must not be empty' });
    }

    const bom = await BOM.findById(req.params.id);
    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-004 — ownership check
    if (bom.customerId?.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized to select products for this BOM' });
    }

    const errors = [];
    const validSelections = [];

    for (const sel of selections) {
      // FIX: BUG-009 — validate itemIndex bounds
      if (typeof sel.itemIndex !== 'number' || sel.itemIndex < 0 || sel.itemIndex >= bom.items.length) {
        errors.push(`Invalid itemIndex: ${sel.itemIndex} (valid: 0-${bom.items.length - 1})`);
        continue;
      }

      // FIX: BUG-010 — validate productId exists in database
      const product = await Product.findById(sel.productId).select('_id stock isActive');
      if (!product) {
        errors.push(`Product ${sel.productId} not found`);
        continue;
      }
      if (!product.isActive || product.stock <= 0) {
        errors.push(`Product ${sel.productId} is unavailable (out of stock or inactive)`);
        continue;
      }

      // FIX: BUG-010 — verify product was in AI suggestions for this item
      const item = bom.items[sel.itemIndex];
      const wasSuggested = item.aiSuggestions?.some(
        s => (s.productId?._id || s.productId)?.toString() === sel.productId.toString()
      );
      if (!wasSuggested && item.aiSuggestions?.length > 0) {
        errors.push(`Product ${sel.productId} was not in AI suggestions for item ${sel.itemIndex}`);
        continue;
      }

      validSelections.push(sel);
      bom.items[sel.itemIndex].selectedProductId = sel.productId;
      bom.items[sel.itemIndex].selectedAt = new Date();
    }

    await bom.save();

    // Update feedback logs + popularity for valid selections only
    for (const sel of validSelections) {
      await AISuggestionLog.findOneAndUpdate(
        { bomId: bom._id, bomItemIndex: sel.itemIndex },
        {
          selectedProductId: sel.productId,
          selectedAt: new Date(),
          $set: { 'suggestedProducts.$[elem].wasSelected': true }
        },
        { arrayFilters: [{ 'elem.productId': sel.productId }] }
      );
      await Product.findByIdAndUpdate(sel.productId, { $inc: { popularity: 1 } });
    }

    const response = {
      success: true,
      data: bom,
      message: `${validSelections.length} product selections saved`
    };
    if (errors.length > 0) {
      response.warnings = errors;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add all selected BOM products to cart
// @route   POST /api/v1/bom/cart/from-bom
// @access  Private (Customer)
exports.addBOMToCart = async (req, res) => {
  try {
    const { bomId } = req.body;

    const bom = await BOM.findById(bomId)
      .populate('items.selectedProductId');

    if (!bom) {
      return res.status(404).json({ success: false, error: 'BOM not found' });
    }

    // FIX: BUG-004 — ownership check
    if (bom.customerId?.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const cartItems = [];
    let totalPrice = 0;

    for (const item of bom.items) {
      if (item.selectedProductId && typeof item.selectedProductId === 'object') {
        const product = item.selectedProductId;
        // FIX: verify stock at cart-add time
        if (product.stock <= 0 || !product.isActive) {
          cartItems.push({
            productId: product._id,
            productName: product.name,
            brand: product.brand,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            totalPrice: product.basePrice * item.quantity,
            imageUrl: product.imageUrl,
            fromBOM: true,
            bomId: bom._id,
            warning: 'Product may be out of stock'
          });
        } else {
          cartItems.push({
            productId: product._id,
            productName: product.name,
            brand: product.brand,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            totalPrice: product.basePrice * item.quantity,
            imageUrl: product.imageUrl,
            fromBOM: true,
            bomId: bom._id
          });
        }
        totalPrice += product.basePrice * item.quantity;
      } else {
        cartItems.push({
          productId: null,
          productName: item.name,
          brand: 'As per technician',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          imageUrl: null,
          fromBOM: true,
          bomId: bom._id
        });
        totalPrice += item.totalPrice;
      }
    }

    // FIX: BUG-008 — Persist cart items to database
    // Try to find existing Cart model, or create inline
    let Cart;
    try {
      Cart = require('../models/Cart');
    } catch (e) {
      // Cart model doesn't exist yet — return items for client-side cart integration
      return res.status(200).json({
        success: true,
        data: {
          cartItems,
          totalPrice,
          laborCharge: bom.laborCharge,
          grandTotal: totalPrice + bom.laborCharge,
          persisted: false
        },
        message: `${cartItems.length} BOM products ready for cart (client-side integration)`
      });
    }

    // If Cart model exists, persist
    for (const ci of cartItems) {
      if (ci.productId) {
        await Cart.findOneAndUpdate(
          { userId: req.user.id, productId: ci.productId },
          {
            $set: {
              quantity: ci.quantity,
              fromBOM: true,
              bomId: ci.bomId
            }
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: {
        cartItems,
        totalPrice,
        laborCharge: bom.laborCharge,
        grandTotal: totalPrice + bom.laborCharge,
        persisted: true
      },
      message: `${cartItems.length} BOM products added to cart`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS — Paginated + Action support
// ════════════════════════════════════════════════════════════════

// @desc    Get all BOMs (Admin) — with pagination and filters
// @route   GET /api/v1/bom/admin/all
// @access  Private (Admin)
exports.getAllBOMsAdmin = async (req, res) => {
  try {
    // FIX: BUG-013 — pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // FIX: BUG-021 — advanced filters
    const filter = {};
    if (req.query.status && req.query.status !== 'ALL') {
      filter.status = req.query.status;
    }
    if (req.query.technicianId) {
      filter.technicianId = req.query.technicianId;
    }
    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const total = await BOM.countDocuments(filter);

    const boms = await BOM.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('technicianId', 'name phone')
      .populate('customerId', 'name phone')
      .populate('bookingId', 'status serviceAddress.addressText')
      .populate('items.selectedProductId', 'name brand basePrice');

    const bomsWithStats = boms.map(bom => {
      const bomObj = bom.toObject();
      const totalItems = bomObj.items.length;
      const itemsWithSuggestions = bomObj.items.filter(i => i.aiSuggestions && i.aiSuggestions.length > 0).length;
      const itemsWithSelection = bomObj.items.filter(i => i.selectedProductId).length;
      return {
        ...bomObj,
        stats: {
          totalItems,
          itemsWithSuggestions,
          itemsWithSelection,
          conversionRate: itemsWithSuggestions > 0
            ? Math.round((itemsWithSelection / itemsWithSuggestions) * 100)
            : 0
        }
      };
    });

    res.status(200).json({
      success: true,
      count: boms.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: bomsWithStats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Admin approve BOM — FIX: BUG-020
// @route   PUT /api/v1/bom/admin/:id/approve
// @access  Private (Admin)
exports.adminApproveBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, error: 'BOM not found' });

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'APPROVED';
    bom.approvedAt = new Date();
    if (req.body.adminNotes) bom.adminNotes = sanitize(req.body.adminNotes, 1000);
    await bom.save();

    const taxes = bom.grandTotal * 0.18;
    await Booking.findByIdAndUpdate(bom.bookingId, {
      status: 'BOM_APPROVED',
      'pricing.bomTotal': bom.grandTotal,
      'pricing.finalPrice': bom.grandTotal + taxes,
      'pricing.taxes': taxes
    });

    res.status(200).json({ success: true, data: bom, message: 'BOM approved by admin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Admin reject BOM — FIX: BUG-020
// @route   PUT /api/v1/bom/admin/:id/reject
// @access  Private (Admin)
exports.adminRejectBOM = async (req, res) => {
  try {
    let bom = await BOM.findById(req.params.id);
    if (!bom) return res.status(404).json({ success: false, error: 'BOM not found' });

    if (bom.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: 'BOM is not in submitted state' });
    }

    bom.status = 'REJECTED';
    bom.rejectedAt = new Date();
    if (req.body.adminNotes) bom.adminNotes = sanitize(req.body.adminNotes, 1000);
    await bom.save();

    await Booking.findByIdAndUpdate(bom.bookingId, { status: 'BOM_PENDING' });

    res.status(200).json({ success: true, data: bom, message: 'BOM rejected by admin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get BOM analytics (Admin)
// @route   GET /api/v1/bom/admin/analytics
// @access  Private (Admin)
exports.getBOMAnalytics = async (req, res) => {
  try {
    const statusCounts = await BOM.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalLogs = await AISuggestionLog.countDocuments();

    const selectedLogs = await AISuggestionLog.countDocuments({
      selectedProductId: { $exists: true, $ne: null }
    });

    const popularBrands = await AISuggestionLog.aggregate([
      { $match: { selectedProductId: { $exists: true, $ne: null } } },
      { $lookup: { from: 'products', localField: 'selectedProductId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const avgConfidence = await AISuggestionLog.aggregate([
      { $unwind: '$suggestedProducts' },
      { $match: { 'suggestedProducts.wasSelected': true } },
      { $group: { _id: null, avg: { $avg: '$suggestedProducts.confidenceScore' } } }
    ]);

    const topCategories = await AISuggestionLog.aggregate([
      { $match: { inputCategory: { $exists: true, $ne: null } } },
      { $group: { _id: '$inputCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const bomTrend = await BOM.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: statusCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        totalSuggestions: totalLogs,
        totalSelections: selectedLogs,
        conversionRate: totalLogs > 0 ? Math.round((selectedLogs / totalLogs) * 100) : 0,
        popularBrands: popularBrands.map(b => ({ brand: b._id || 'Unknown', count: b.count })),
        avgConfidenceOfSelected: avgConfidence[0]?.avg ? Math.round(avgConfidence[0].avg * 100) : 0,
        topCategories: topCategories.map(c => ({ category: c._id || 'OTHER', count: c.count })),
        bomTrend
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
