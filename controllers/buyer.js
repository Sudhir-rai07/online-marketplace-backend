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


// GET order
export const order = async (req, res) =>{
    const {id: orderId} = req.params
    try {
        const order = await prisma.order.findUnique({where:{
            id: orderId,
        }})

        const product = await prisma.product.findUnique({where:{
            id: order.productId
        }})

        if(!order) {
            sendErrorResponse(res, 404, "Order not found")
            return
        }

        const data = {
            orderId: order.id,
            product: product.name,
            quentity: order.quantity,
            total: order.total,
            status: order.status,
            payment: order.paymentStatus,
            orderAt: order.createdAt,
        }

        res.status(200).json(data)
    } catch (error) {
        console.log("ERROR in User Orders route", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}