import sendErrorResponse from "../helper/response.js"
import {prisma} from "../index.js"


export const GetAllOrders = async (req, res) => {
    const {id: userId} = req.user
    try {
        // Get All Orders
        const orders = await prisma.order.findMany({
            where:{
                sellerId: userId
            }
        })
        // Send Response
        res.status(200).json({orders})
    } catch (error) {
        console.log("ERROR IN GET ALL ORDERS CONTROLLER ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}

// Get All Orders
export const UpdateOrder = async (req, res) => {
    const {id: orderId} = req.params
    const {status} = req.body
    const {id: userId} = req.user
    try {
        if(!status) return sendErrorResponse(res, 400, "Please provide status")
        
        // Find Order
        const order = await prisma.order.findUnique({where:{
            id: orderId
        }})
        if(!order) return sendErrorResponse(res, 400, "Order not found")
        
        // Verify User
        if(order.sellerId !== userId) return sendErrorResponse(res, 401, "You are not authorized to perform this action")
        // Update Order
        await prisma.order.update({where:{
            id: orderId
        }, data:{
            status
        }})
        // Send Response
        res.status(200).json({message: `Order ${orderId} updated`})
    } catch (error) {
        console.log("ERROR IN UPDATE ORDER CONTROLLER ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}