const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const secret = process.env.JWT_ACC_LOGIN;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(401).json({
          meta: {
            success: false,
            message: "invalid-token",
          },
          self: req.originalUrl,
        });
      }
      next();
    });
  } else {
    return res.status(401).json({
      meta: {
        success: false,
        message: "invalid-token",
      },
      self: req.originalUrl,
    });
  }
};

module.exports = verifyToken;