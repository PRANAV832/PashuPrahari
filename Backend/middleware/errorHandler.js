const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: messages.join(', ')
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: `Invalid ${err.path}: ${err.value}`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: err.toString()
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
