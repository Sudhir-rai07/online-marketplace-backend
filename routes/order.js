import {Router} from 'express';
import { GetAllOrders, UpdateOrder } from '../controllers/orders.js';
import { protectSellerRoute } from '../middleware/ProtectSeller.js';

const router = Router()

router.get("/", protectSellerRoute, GetAllOrders) // Get all orders
router.patch("/:id", protectSellerRoute, UpdateOrder) // Update order


export default router