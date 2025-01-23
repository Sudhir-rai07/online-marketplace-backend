import { Router } from 'express'
import { BuyProduct, GetAllProducts, GetProduct, GetProductsByCategory, SearchProduct, UpdateOrderStatus } from '../controllers/products.js'
import { ProtectRoute } from '../middleware/protectRoute.js'
import buyer from '../middleware/ProtectBuyer.js'
import { stripe } from '../helper/stripe.js'
import { prisma } from '../index.js'


const router = Router()

router.get('/', GetAllProducts) // Get All Products
router.get('/search', SearchProduct) // Search a product  {queries : query, sort}
router.get('/:id', GetProduct) // Get Product by id
router.get('/category/:category', GetProductsByCategory) // Get  products by category {queries : sort}

router.post('/checkout/:id',ProtectRoute, buyer, BuyProduct) // Buy a product
router.post('/checkout/success/:sessionId',ProtectRoute, buyer, UpdateOrderStatus)

export default router
