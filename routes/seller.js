import { Router } from 'express'
import {
  AddProduct,
  DeletelProduct,
  GetAllProducts,
  UpdateProduct,
} from '../controllers/seller.js'

const router = Router()

router.get('/', GetAllProducts) // Get All Products
router.post('/', AddProduct) // Add Product
router.put('/:id', UpdateProduct) // Update Product
router.delete('/:id', DeletelProduct) // Delete Product

export default router
