// Image utilities for consistent image loading across the app
import calciImg from "../assets/Calci.jpg";
import drafterImg from "../assets/Drafter.jpeg";
import chartHolderImg from "../assets/chart holder.jpg";
import mechCoatImg from "../assets/Mechanical.jpeg";
import chemCoatImg from "../assets/Chemical.jpeg";

// Image mapping for products
export const productImages = {
  // Direct filename mapping (for backend cart items)
  'Calci.jpg': calciImg,
  'Drafter.jpeg': drafterImg,
  'chart holder.jpg': chartHolderImg,
  'Chemical.jpeg': chemCoatImg,
  'Mechanical.jpeg': mechCoatImg,
  
  // Product name mapping (for frontend sell cart items)
  'calculator': calciImg,
  'drafter': drafterImg,
  'chartbox': chartHolderImg,
  'white_lab_coat': chemCoatImg,
  'brown_lab_coat': mechCoatImg
};

// Get proper image path for any product
export const getProductImage = (imageIdentifier) => {
  if (!imageIdentifier) {
    return '/default-product.jpg';
  }
  
  // Check direct mapping first
  if (productImages[imageIdentifier]) {
    return productImages[imageIdentifier];
  }
  
  // Case-insensitive search for filename
  const foundImage = Object.keys(productImages).find(key => 
    key.toLowerCase() === imageIdentifier.toLowerCase()
  );
  
  if (foundImage) {
    return productImages[foundImage];
  }
  
  // If it's a full path, return as is
  if (imageIdentifier.includes('/') || imageIdentifier.includes('\\')) {
    return imageIdentifier;
  }
  
  // Default fallback
  return '/default-product.jpg';
};

// Normalize product data to ensure consistent image handling
export const normalizeProductData = (product, source = 'unknown') => {
  let imageIdentifier;
  
  if (source === 'backend') {
    // Backend provides product_images as filename
    imageIdentifier = product.product_images || product.image;
  } else if (source === 'frontend') {
    // Frontend might provide product name or direct image
    imageIdentifier = product.image || product.name || product.product_name;
  } else {
    // Auto-detect source
    imageIdentifier = product.product_images || product.image || product.name || product.product_name;
  }
  
  return {
    ...product,
    image: getProductImage(imageIdentifier)
  };
};