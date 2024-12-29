import { Router } from "express";
import { GetProducts } from "../controllers/seller.js";


const router = Router()


router.get("/", GetProducts)


export default router