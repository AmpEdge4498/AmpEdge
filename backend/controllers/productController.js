const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all active products (paginated)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tier) filter.tier = req.query.tier;
  if (req.query.brand) filter.brand = { $regex: escapeRegex(req.query.brand), $options: 'i' };
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  let sortBy = { createdAt: -1 };
  if (req.query.sort === 'price_asc') sortBy = { basePrice: 1 };
  if (req.query.sort === 'price_desc') sortBy = { basePrice: -1 };
  if (req.query.sort === 'popular') sortBy = { popularity: -1 };
  if (req.query.sort === 'rating') sortBy = { rating: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products,
  });
});

// @desc    Get all products (Admin)
// @route   GET /api/v1/products/admin/all
// @access  Private/Admin
exports.getAllProductsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    filter.name = { $regex: safe, $options: 'i' };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: products.length, total, page, data: products });
});

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Delete (soft) product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  product.isActive = false;
  await product.save();
  res.status(200).json({ success: true, data: {} });
});
