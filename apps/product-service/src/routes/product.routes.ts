import express, { Router } from 'express';
import {
  createDiscountCodes,
  deleteDiscountCodes,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
  createProduct,
  getShopProducts,
} from '../controllers/product.controller';
import isAuthenticated from '@packages/middlewares/isAuthenticated';

const router: Router = express.Router();

router.get('/get-categories', getCategories);
router.post('/create-discount-code', isAuthenticated, createDiscountCodes);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete(
  '/delete-discount-code/:id',
  isAuthenticated,
  deleteDiscountCodes
);
router.post('/upload-product-image', isAuthenticated, uploadProductImage);
router.delete('/delete-product-image', isAuthenticated, deleteProductImage);
router.post('/create-product', isAuthenticated, createProduct);
router.get('/get-shop-products', isAuthenticated, getShopProducts);

export default router;
