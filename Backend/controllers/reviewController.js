const Product = require('../models/Product');
const Order = require('../models/Order');

// Create new review
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      // Check if user has shipped or delivered order for this product
      const eligibleOrder = await Order.findOne({
        user: req.user.id,
        status: { $in: ['shipped', 'delivered'] },
        'orderItems.product': req.params.id,
      });

      if (!eligibleOrder) {
        return res.status(403).json({
          message: 'You can only review products from orders that have been shipped or delivered'
        });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user.id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

    if (product) {
      res.json(product.reviews);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if user can review product (has shipped order)
const canUserReview = async (req, res) => {
  try {
    const eligibleOrder = await Order.findOne({
      user: req.user.id,
      status: { $in: ['shipped', 'delivered'] },
      'orderItems.product': req.params.id,
    });

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );

    res.json({
      canReview: !!eligibleOrder && !alreadyReviewed,
      hasEligibleOrder: !!eligibleOrder,
      alreadyReviewed: !!alreadyReviewed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const reviewIndex = product.reviews.findIndex(
        (r) => r._id.toString() === req.params.reviewId
      );

      if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user owns the review or is admin
      if (
        product.reviews[reviewIndex].user.toString() !== req.user.id.toString() &&
        !req.user.isAdmin
      ) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      product.reviews.splice(reviewIndex, 1);
      product.numReviews = product.reviews.length;

      if (product.reviews.length > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProductReview,
  getProductReviews,
  canUserReview,
  deleteReview,
};