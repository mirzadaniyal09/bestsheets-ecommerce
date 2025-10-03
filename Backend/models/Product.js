const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      }
    ],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Cotton', 'Silk', 'Linen', 'Microfiber', 'Bamboo', 'Polyester'],
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sizes: {
      type: [String],
      enum: ['Twin', 'Full', 'Queen', 'King', 'California King'],
      default: ['Queen'],
    },
    colors: [
      {
        name: String,
        hexCode: String,
      }
    ],
    material: {
      type: String,
      required: true,
    },
    threadCount: {
      type: Number,
    },
    care: {
      type: String,
      default: 'Machine wash cold, tumble dry low',
    },
    features: [String], // e.g., ['Hypoallergenic', 'Wrinkle-resistant', 'Deep pocket']
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;