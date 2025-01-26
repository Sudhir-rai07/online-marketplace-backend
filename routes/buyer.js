import { Router } from "express";
import { order, orders } from "../controllers/buyer.js";

const router = Router()

router.get("/orders", orders)
router.get("/orders/:id", order)

export default router