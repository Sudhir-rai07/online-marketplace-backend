import { Router } from "express";
import { ChangePassword, Login, me, Register, ReqResetPassword, ResetPassword, VerifyAccount } from "../controllers/auth.js";
import { ProtectRoute } from "../middleware/protectRoute.js";


const router = Router() // Router

//auth Routes
router.post("/register", Register) // Register
router.get("/login", Login) // Login
router.patch("/verify-account", VerifyAccount) // Verify Account
router.put("/password/change", ProtectRoute, ChangePassword) // Change Password
router.get("/password/reset", ReqResetPassword)  // Request Reset Password
router.patch("/password/reset", ResetPassword) // Reset Password

router.get("/me",ProtectRoute,me)


export default router