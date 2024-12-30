import sendErrorResponse from "../helper/response.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
/**
 * TODO: For seller, Add product, delete product, update product, get-all-products, view-orders, update-orders,
 */

export const AddProduct = async (req, res) => {
    const { id: userId } = req.user
    const { 
        name,
        description,
        price,
        discount,
        stock,
        category,
        images
    } = req.body

try {
        if(!name || !description || !price || !discount || !stock || !category || !images) return sendErrorResponse(res, 400, "Please provide proper data from products")
    
        await prisma.product.create({data: {
            name,
            description,
            price,
            discount,
            stock,
            category,
            images: images.length>0?images:null,
            sellerId: userId
    
        }})
    
        res.status(200).json({message: "Product added"})
        
    
} catch (error) {
    console.log("Error in AddProduct Controller ", error)
    sendErrorResponse(res, 500, "Internal server error")
}
}


export const DeletelProduct = async (req, res) =>{
    const {id: productId} = req.params
    const {id: userId} = req.user
    try {
        if (!productId) return sendErrorResponse(res, 400, "Product id is missing")
        
        // Find Product
        const product = await prisma.product.findUnique({where:{
            id: productId
        }})
        if(!product) return sendErrorResponse(res, 400, "Product not found")
        
        // Verify User
        if(product.sellerId !== userId) return sendErrorResponse(res, 401, "You are not authorized to perform this action")
        // Delete product
        await prisma.product.delete({where:{
            id: productId
        }})
        // Send Response
        res.status(200).json({message: `Product ${productId} deleted`})
    } catch (error) {
        console.log("ERROR IN DELETE PRODUCT CONTROLLER ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}

