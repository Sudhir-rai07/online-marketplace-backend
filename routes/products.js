import { Router } from 'express'
import { GetAllProducts, GetProduct } from '../controllers/products.js'
import { BuyProduct } from '../controllers/products.js'
import buyer from '../middleware/ProtectBuyer.js'
import { ProtectRoute } from '../middleware/protectRoute.js'

const router = Router()

router.get('/', GetAllProducts) // Get All Products
router.get('/:id', GetProduct) // Get Product

router.post('/buy/:id',ProtectRoute, buyer, BuyProduct) // Buy a product

export default router
