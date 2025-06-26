const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Akses ditolak, tidak ada token." });
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).json({ message: "Format token tidak valid." });
  }

  const token = tokenParts[1];

  try {
    console.log("JWT_SECRET used for verification:", process.env.JWT_SECRET);
    console.log("Attempting to verify token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error("JWT Verification Error (from middleware):", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token kedaluwarsa. Silakan login kembali." });
    } else if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({
          message: "Token tidak valid (signature mismatch atau malformed).",
        });
    }
    res.status(401).json({ message: "Token tidak valid." });
  }
};
