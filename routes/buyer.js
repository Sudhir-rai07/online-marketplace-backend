import { Router } from "express";
import { orders } from "../controllers/buyer.js";

const router = Router()

router.get("/orders", orders)

export default router