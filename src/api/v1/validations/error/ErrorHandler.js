const multer = require("multer");
const ErrorHandler = (err, req, res, next) => {
  const { status, message, errors } = err;
  let validationError = {};
  let error;
  if (errors) {
    errors.forEach((error) => {
      validationError[error.param] = error.msg;
    });
    error = errors[0].msg;
  }

  return res.status(status || 500).json({
    success: false,
    message: error || message || err,
    timestamps: Date.now(),
    path: req.originalUrl,
    error: message || err,
  });
};

module.exports = ErrorHandler;
