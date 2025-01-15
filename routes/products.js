import { Router } from 'express'
import { GetAllProducts, GetProduct, GetProductsByCategory, SearchProduct } from '../controllers/products.js'

const router = Router()

router.get('/', GetAllProducts) // Get All Products
router.get('/search', SearchProduct) // Search a product
router.get('/:id', GetProduct) // Get Product by id
router.get('/category/:category', GetProductsByCategory)

// router.post('/buy/:id',ProtectRoute, buyer, BuyProduct) // Buy a product

export default router
