const jwt = require("jsonwebtoken");

class AuthJwt {
  async authJwt(req, res, next) {
    try {
      const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

      if (!token) {
        return res.status(400).json({
          message: "Token is required",
        });
      }

      jwt.verify(token, "MERN2024", (err, data) => {
        if (err) {
          return res.status(401).json({
            message: "Token is expired or invalid",
          });
        }

        req.user = data;
        return next();
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

module.exports = new AuthJwt();
