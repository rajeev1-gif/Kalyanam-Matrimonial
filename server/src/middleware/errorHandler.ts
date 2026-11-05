const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds maximum limit of 5MB', 400);
    }
    return errorResponse(res, err.message, 400);
  }

  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation failed', 400, formattedErrors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
}

export default errorHandler;

