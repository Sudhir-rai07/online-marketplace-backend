import {Router} from 'express';
import { GetAllOrders, UpdateOrder } from '../controllers/orders.js';

const router = Router()

router.get("/", GetAllOrders) // Get all orders
router.patch("/:id", UpdateOrder) // Update order

export default router