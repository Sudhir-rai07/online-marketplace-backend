import { Router } from "express";
import {AddProduct, DeletelProduct} from '../controllers/seller.js'

const router = Router()

// router.get("/",GetAllProducts)
router.post("/",AddProduct)
router.delete("/:id",DeletelProduct )
export default router