function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { message: "You do not have permission to access this resource", status: 403 },
      });
    }
    next();
  };
}

module.exports = roleMiddleware;