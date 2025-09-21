const { db, query, run } = require('../config/db');
const { 
  validateRequiredFields, 
  sanitizeUserInput 
} = require('../utils/validation');

// Get all products (Public route)
const getAllProducts = async (req, res) => {
  try {
    const [products] = await query(`
      SELECT 
        product_id, 
        product_name, 
        product_variant, 
        product_code, 
        product_price, 
        product_images, 
        quantity,
        created_at,
        updated_at
      FROM products 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      message: '✅ Products retrieved successfully',
      count: products.length,
      products: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Get single product by ID (Public route)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid product ID',
        field: 'product_id'
      });
    }

    const [products] = await query(`
      SELECT 
        product_id, 
        product_name, 
        product_variant, 
        product_code, 
        product_price, 
        product_images, 
        quantity,
        created_at,
        updated_at
      FROM products 
      WHERE product_id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Product not found',
        productId: id
      });
    }

    res.json({
      success: true,
      message: '✅ Product retrieved successfully',
      product: products[0]
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Create new product (Seller/Admin only)
const createProduct = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeUserInput(req.body);
    
    const {
      product_name,
      product_variant,
      product_code,
      product_price,
      product_images,
      quantity
    } = sanitizedData;

    // Validate required fields
    const requiredFields = ['product_name', 'product_variant', 'product_price', 'quantity'];
    const fieldValidation = validateRequiredFields(sanitizedData, requiredFields);
    
    if (!fieldValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: '❌ Missing required fields',
        details: fieldValidation.message,
        missingFields: fieldValidation.missingFields,
        requiredFields: requiredFields
      });
    }

    // Validate product_name enum
    const validProductNames = ['drafter', 'white_lab_coat', 'brown_lab_coat', 'calculator'];
    if (!validProductNames.includes(product_name)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid product name',
        field: 'product_name',
        validOptions: validProductNames
      });
    }

    // Validate product_variant enum based on product_name
    const validVariants = {
      'drafter': ['premium_drafter', 'standard_drafter', 'budget_drafter'],
      'white_lab_coat': ['S', 'M', 'L', 'XL', 'XXL'],
      'brown_lab_coat': ['S', 'M', 'L', 'XL', 'XXL'],
      'calculator': ['MS', 'ES', 'ES-Plus']
    };

    if (!validVariants[product_name].includes(product_variant)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid product variant for this product',
        field: 'product_variant',
        validOptions: validVariants[product_name],
        productName: product_name
      });
    }

    // Validate price and quantity
    if (isNaN(product_price) || product_price <= 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Product price must be a positive number',
        field: 'product_price'
      });
    }

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: '❌ Quantity must be a non-negative number',
        field: 'quantity'
      });
    }

    // Check if product_code already exists (if provided)
    if (product_code) {
      const [existingProduct] = await query(
        'SELECT product_id FROM products WHERE product_code = ?',
        [product_code]
      );

      if (existingProduct.length > 0) {
        return res.status(409).json({
          success: false,
          message: '❌ Product code already exists',
          field: 'product_code',
          suggestion: 'Use a different product code'
        });
      }
    }

    // Insert new product
    const [result] = await run(`
      INSERT INTO products 
      (product_name, product_variant, product_code, product_price, product_images, quantity) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      product_name,
      product_variant,
      product_code,
      parseFloat(product_price),
      product_images,
      parseInt(quantity)
    ]);

    res.status(201).json({
      success: true,
      message: '✅ Product created successfully',
      product: {
        productId: result.insertId,
        product_name,
        product_variant,
        product_code,
        product_price: parseFloat(product_price),
        product_images,
        quantity: parseInt(quantity)
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Update product (Seller/Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sanitizedData = sanitizeUserInput(req.body);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid product ID',
        field: 'product_id'
      });
    }

    // Check if product exists
    const [existingProduct] = await query(
      'SELECT product_id FROM products WHERE product_id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Product not found',
        productId: id
      });
    }

    const {
      product_name,
      product_variant,
      product_code,
      product_price,
      product_images,
      quantity
    } = sanitizedData;

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (product_name !== undefined) {
      const validProductNames = ['drafter', 'white_lab_coat', 'brown_lab_coat', 'calculator'];
      if (!validProductNames.includes(product_name)) {
        return res.status(400).json({
          success: false,
          message: '❌ Invalid product name',
          field: 'product_name',
          validOptions: validProductNames
        });
      }
      updateFields.push('product_name = ?');
      updateValues.push(product_name);
    }

    if (product_variant !== undefined) {
      updateFields.push('product_variant = ?');
      updateValues.push(product_variant);
    }

    if (product_code !== undefined) {
      // Check if product_code already exists for different product
      const [codeCheck] = await query(
        'SELECT product_id FROM products WHERE product_code = ? AND product_id != ?',
        [product_code, id]
      );

      if (codeCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: '❌ Product code already exists',
          field: 'product_code'
        });
      }

      updateFields.push('product_code = ?');
      updateValues.push(product_code);
    }

    if (product_price !== undefined) {
      if (isNaN(product_price) || product_price <= 0) {
        return res.status(400).json({
          success: false,
          message: '❌ Product price must be a positive number',
          field: 'product_price'
        });
      }
      updateFields.push('product_price = ?');
      updateValues.push(parseFloat(product_price));
    }

    if (product_images !== undefined) {
      updateFields.push('product_images = ?');
      updateValues.push(product_images);
    }

    if (quantity !== undefined) {
      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: '❌ Quantity must be a non-negative number',
          field: 'quantity'
        });
      }
      updateFields.push('quantity = ?');
      updateValues.push(parseInt(quantity));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '❌ No fields to update',
        suggestion: 'Provide at least one field to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE product_id = ?`;
    
    const [result] = await run(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Product not found or no changes made',
        productId: id
      });
    }

    // Get updated product
    const [updatedProduct] = await query(
      'SELECT * FROM products WHERE product_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: '✅ Product updated successfully',
      product: updatedProduct[0]
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid product ID',
        field: 'product_id'
      });
    }

    // Check if product exists
    const [existingProduct] = await query(
      'SELECT product_id, product_name, product_variant FROM products WHERE product_id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Product not found',
        productId: id
      });
    }

    // Check if product is referenced in orders or cart
    const [orderCheck] = await query(
      'SELECT COUNT(*) as order_count FROM orders WHERE product_id = ?',
      [id]
    );

    const [cartCheck] = await query(
      'SELECT COUNT(*) as cart_count FROM cart WHERE product_id = ?',
      [id]
    );

    if (orderCheck[0].order_count > 0 || cartCheck[0].cart_count > 0) {
      return res.status(409).json({
        success: false,
        message: '❌ Cannot delete product - it has existing orders or cart items',
        suggestion: 'Set quantity to 0 to disable the product instead',
        productId: id,
        orderCount: orderCheck[0].order_count,
        cartCount: cartCheck[0].cart_count
      });
    }

    const [result] = await run('DELETE FROM products WHERE product_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '❌ Product not found',
        productId: id
      });
    }

    res.json({
      success: true,
      message: '🗑️ Product deleted successfully',
      deletedProduct: {
        productId: id,
        product_name: existingProduct[0].product_name,
        product_variant: existingProduct[0].product_variant
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Get products by category/filter (Public route)
const getProductsByFilter = async (req, res) => {
  try {
    const { product_name, product_variant, min_price, max_price, in_stock } = req.query;

    let sql = `
      SELECT 
        product_id, 
        product_name, 
        product_variant, 
        product_code, 
        product_price, 
        product_images, 
        quantity,
        created_at,
        updated_at
      FROM products 
      WHERE 1=1
    `;
    const queryParams = [];

    if (product_name) {
      sql += ' AND product_name = ?';
      queryParams.push(product_name);
    }

    if (product_variant) {
      sql += ' AND product_variant = ?';
      queryParams.push(product_variant);
    }

    if (min_price) {
      sql += ' AND product_price >= ?';
      queryParams.push(parseFloat(min_price));
    }

    if (max_price) {
      sql += ' AND product_price <= ?';
      queryParams.push(parseFloat(max_price));
    }

    if (in_stock === 'true') {
      sql += ' AND quantity > 0';
    }

    sql += ' ORDER BY created_at DESC';

    const [products] = await query(sql, queryParams);

    res.json({
      success: true,
      message: '✅ Products filtered successfully',
      count: products.length,
      filters: {
        product_name,
        product_variant,
        min_price,
        max_price,
        in_stock
      },
      products: products
    });

  } catch (error) {
    console.error('Filter products error:', error);
    res.status(500).json({ 
      success: false,
      message: '❌ Error filtering products',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFilter
};