const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    // Case-insensitive category matching
    const category = req.params.category;
    const products = await Product.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    console.log(`Searching for category: ${category}, Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create product (Admin)
const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);

    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      material,
      threadCount,
      sizes,
      colors,
      features,
      slug
    } = req.body;

    // Validate required fields
    if (!name || !brand || !category || !description || price == null || countInStock == null) {
      return res.status(400).json({
        message: 'Missing required fields: name, brand, category, description, price, and countInStock are required'
      });
    }

    // Validate category against allowed values
    const allowedCategories = ['Cotton', 'Silk', 'Linen', 'Microfiber', 'Bamboo', 'Polyester'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${allowedCategories.join(', ')}`
      });
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      user: req.user.id,
      image: image || `/images/${category.toLowerCase()}-sheets.jpg`,
      brand,
      category, // This should now be properly assigned
      countInStock: parseInt(countInStock),
      numReviews: 0,
      rating: 0,
      description,
      material: material || `100% ${category}`,
      threadCount: threadCount ? parseInt(threadCount) : undefined,
      sizes: sizes || ['Queen'],
      colors: colors || [{ name: 'White', hexCode: '#FFFFFF' }],
      features: features || [],
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    });

    console.log('About to save product:', product);
    const createdProduct = await product.save();
    console.log('Product created successfully:', createdProduct._id);

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, 'with data:', req.body);

    const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
      material,
      threadCount,
      sizes,
      colors,
      features,
      slug
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Validate category if provided
      if (category) {
        const allowedCategories = ['Cotton', 'Silk', 'Linen', 'Microfiber', 'Bamboo', 'Polyester'];
        if (!allowedCategories.includes(category)) {
          return res.status(400).json({
            message: `Invalid category. Must be one of: ${allowedCategories.join(', ')}`
          });
        }
      }

      // Update all fields
      product.name = name || product.name;
      product.price = price != null ? parseFloat(price) : product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock = countInStock != null ? parseInt(countInStock) : product.countInStock;
      product.material = material || product.material;
      product.threadCount = threadCount ? parseInt(threadCount) : product.threadCount;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.features = features || product.features;
      product.slug = slug || product.slug;

      const updatedProduct = await product.save();
      console.log('Product updated successfully:', updatedProduct._id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};