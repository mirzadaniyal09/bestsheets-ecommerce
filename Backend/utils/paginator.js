// Paginate function to handle pagination logic
const paginate = (page = 1, limit = 10, totalItems) => {
  const currentPage = Math.max(1, parseInt(page));
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 items per page
  const skip = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    skip,
    limit: itemsPerPage,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
  };
};

// Generate pagination info for API responses
const getPaginationData = (page, limit, totalItems) => {
  const paginationInfo = paginate(page, limit, totalItems);

  return {
    pagination: {
      currentPage: paginationInfo.currentPage,
      totalPages: paginationInfo.totalPages,
      totalItems: paginationInfo.totalItems,
      itemsPerPage: paginationInfo.limit,
      hasNextPage: paginationInfo.hasNextPage,
      hasPrevPage: paginationInfo.hasPrevPage,
      nextPage: paginationInfo.nextPage,
      prevPage: paginationInfo.prevPage,
    },
    skip: paginationInfo.skip,
    limit: paginationInfo.limit,
  };
};

// Middleware for handling pagination in routes
const paginationMiddleware = (defaultLimit = 10) => {
  return (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || defaultLimit;

    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
    };

    next();
  };
};

module.exports = {
  paginate,
  getPaginationData,
  paginationMiddleware,
};