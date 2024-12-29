import { Router } from "express";
import { ChangePassword, Login, Register, ReqResetPassword, ResetPassword, VerifyAccount } from "../controllers/auth.js";
import { ProtectRoute } from "../middleware/protectRoute.js";


const router = Router()

// AUTH
router.post("/register", Register)
router.get("/login", Login)
router.patch("/verify-account", VerifyAccount)
router.put("/password/change", ProtectRoute, ChangePassword)
router.get("/password/reset", ReqResetPassword) 
router.patch("/password/reset", ResetPassword)


export default router