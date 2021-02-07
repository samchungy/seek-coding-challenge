/**
 * Route Error from Service to Routes Layer
 */
class RouteError extends Error {
  /**
   * Constructor
   * @param {number} statusCode
   * @param {*} response
   */
  constructor(statusCode, response) {
    super(`${statusCode} route error`);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RouteError);
    }
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Custom debugging information
    this.response = response;
  }
}

module.exports = RouteError;
