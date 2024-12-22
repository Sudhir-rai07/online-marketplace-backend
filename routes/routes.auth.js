import { Router } from "express";
import { Register } from "../controllers/auth.controllers.js";


const router = Router()

router.post("/register", Register)



export default router