import { Router } from "express";
import { Login, Register, VerifyAccount } from "../controllers/auth.js";


const router = Router()

router.post("/register", Register)
router.get("/login", Login)
router.patch("/verify-account", VerifyAccount)



export default router