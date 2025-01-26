import { prisma } from "../index.js"
import sendErrorResponse from "../helper/response.js"

export const orders = async (req, res) =>{
    try {
        const orders = await prisma.order.findMany({where:{
            userId: req.user.id
        }})

        const data = {
            message: "Fetched all orders",
            items: orders.length,
            orders: orders
        }
        res.status(200).json(data)
    } catch (error) {
        console.log("ERROR in User Orders route", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}