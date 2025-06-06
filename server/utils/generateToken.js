const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    }
  );
};

module.exports = generateToken; 