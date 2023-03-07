const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.params.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication").json({
      success: "false",
      message: "Token required",
      error: {
        statusCode: 403,
        message: "A token is required for authentication",
      },
    });
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      success: "false",
      message: "Invalid token",
      error: {
        statusCode: 401,
        message: "Please send a valid token",
      },
    });
  }
  return next();
};

module.exports = verifyToken;
