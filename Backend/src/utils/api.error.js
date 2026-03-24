class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.name = "ApiError";

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
