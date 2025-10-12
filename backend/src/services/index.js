/**
 * Service Layer Index
 * Central export for all service modules
 */

module.exports = {
  authService: require('./authService'),
  productService: require('./productService'),
  cartService: require('./cartService'),
  // Add more services as they are created
  // orderService: require('./orderService'),
  // userService: require('./userService'),
};