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


