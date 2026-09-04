class ErrorApi extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ErrorApi";
    this.statusCode = statusCode;
  }
}

export default ErrorApi;
