const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  countProducts,
  upload 
} = require("../controllers/productController");
const multer = require('multer');


const router = express.Router();

router.post("/", upload.single('productImage'), createProduct);
router.get("/", getAllProducts);
router.get("/count", countProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single('productImage'), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
