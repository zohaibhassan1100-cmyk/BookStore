// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('❌', err.message);
  let status  = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'ER_DUP_ENTRY') { status = 409; message = 'Duplicate entry — record already exists'; }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired, please login again'; }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });

module.exports = { errorHandler, notFound };
