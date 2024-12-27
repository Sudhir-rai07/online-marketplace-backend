import sendErrorResponse from "../helper/response.js"
import jwt from 'jsonwebtoken'

export const ProtectRoute = async (req, res, next) => {
    try {

        // Get the token from authorization header
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1] || req.cookies["auth-token"]
        if (!token) return sendErrorResponse(res, 401, "Auth token is missing")


        const verify = jwt.verify(token, process.env.JWT_SECRET)
        if (!verify) return sendErrorResponse(res, 401, "Unauthorized - Invalid access token")

        req.user = verify.userId

        next()

    } catch (error) {
        console.log("ERROR IN PROTECT ROUTE ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}