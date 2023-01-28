const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode
    ? res.statusCode === 200
      ? 500
      : res.statusCode
    : 500;

  res.status(statusCode);

  const responseObj =
    process.env.NODE_ENV === "development"
      ? {
          status: "fail",
          message: err.message,
          stack: err.stack,
        }
      : {
          status: "fail",
          message: err.message,
        };

  res.json(responseObj);
};

module.exports = errorHandler;
