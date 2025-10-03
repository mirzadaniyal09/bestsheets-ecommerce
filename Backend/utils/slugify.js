// Create URL-friendly slug from string
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Remove all non-word chars
    .replace(/[^\w\-]+/g, '')
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-')
    // Trim - from start and end of text
    .replace(/^-+|-+$/g, '');
};

// Create unique slug by appending number if needed
const createUniqueSlug = async (text, Model, field = 'slug') => {
  const baseSlug = createSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists, if so append number
  while (await Model.findOne({ [field]: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Generate slug from product name with category
const generateProductSlug = (name, category) => {
  const categorySlug = createSlug(category);
  const nameSlug = createSlug(name);
  return `${categorySlug}-${nameSlug}`;
};

// Generate slug for user profile (from name and id)
const generateUserSlug = (name, userId) => {
  const nameSlug = createSlug(name);
  const shortId = userId.toString().slice(-6);
  return `${nameSlug}-${shortId}`;
};

module.exports = {
  createSlug,
  createUniqueSlug,
  generateProductSlug,
  generateUserSlug,
};