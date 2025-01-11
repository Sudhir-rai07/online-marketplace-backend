import { Router } from "express";
import { GetAllProducts, GetProduct } from "../controllers/products.js";
import { BuyProduct } from "../controllers/products.js";
import protectBuyerRoute from "../middleware/ProtectBuyer.js";
import { ProtectRoute } from "../middleware/protectRoute.js";


const router = Router()

router.get("/", GetAllProducts) // Get All Products
router.get("/:id", GetProduct) // Get Product

router.post("/buy/:id",ProtectRoute ,protectBuyerRoute, BuyProduct) // Buy a product


export default router