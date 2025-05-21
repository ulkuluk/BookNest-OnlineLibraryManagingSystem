export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: "Akses ditolak. Tidak punya izin." });
    }

    next();
  };
};