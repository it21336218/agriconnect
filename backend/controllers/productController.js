const Product = require("../models/Product");
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

exports.upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});


// Create Product
exports.createProduct = async (req, res) => {
  try {
    // Create a new product with the request body
    const productData = { ...req.body };
    
    // If image was uploaded, add the path
    if (req.file) {
      // Get the file path to save in the database
      const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
      productData.image = imagePath;
    }
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = { ...req.body };
    
    // If image was uploaded, add the path
    if (req.file) {
      // Get the file path to save in the database
      const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
      productData.image = imagePath;
      
      // Find the old product to delete its image if it exists
      const oldProduct = await Product.findById(productId);
      if (oldProduct && oldProduct.image && oldProduct.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      productData, 
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find the product to get its image path
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the image file if it exists
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the product from the database
    await Product.findByIdAndDelete(productId);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.countProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


