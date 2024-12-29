import { Router } from "express";
import {AddProduct} from '../controllers/seller.js'

const router = Router()

router.post("/products",AddProduct )
export default router