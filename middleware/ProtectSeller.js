import sendErrorResponse from "../helper/response.js"

export const protectSellerRoute = async (req, res, next) =>{
    const {role} = req.user
    try { 
        if(role !== "Seller") return sendErrorResponse(res, 401, "You are not authorized to perform this action")
    } catch (error) {
        console.log("Error in ProtectSeller Middleware ", error)
        sendErrorResponse(res, 500, "Internal server Error")
    }
    next()
}