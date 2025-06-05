const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Requires Admin Role!" });
  }
  next();
};

const isReceptionist = (req, res, next) => {
  if (req.userRole !== "receptionist" && req.userRole !== "admin") {
    return res.status(403).json({ message: "Requires Receptionist Role!" });
  }
  next();
};

const isGuest = (req, res, next) => {
  if (
    req.userRole !== "guest" &&
    req.userRole !== "admin" &&
    req.userRole !== "receptionist"
  ) {
    return res.status(403).json({ message: "Requires Guest Role!" });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isReceptionist,
  isGuest,
};
