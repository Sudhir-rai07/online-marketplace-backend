import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import sendErrorResponse from './helper/response.js'
import { protectSellerRoute } from './middleware/ProtectSeller.js'
import { ProtectRoute } from './middleware/protectRoute.js'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 5500

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors())

// routes middleware
import authRoutes from './routes/auth.js'
import sellerRoutes from './routes/seller.js'
import buyerRoutes from './routes/buyer.js'
import { protectBuyerRoute } from './middleware/ProtectBuyer.js'
app.use('/api/auth/', authRoutes )
app.use('/api/s/products/',ProtectRoute, protectSellerRoute, sellerRoutes )
app.use('/api/b/products/',ProtectRoute, protectBuyerRoute, buyerRoutes )

// Home Route
app.get("/", async(req, res)=>{
    try {
        const products = await prisma.product.findMany({})
        res.status(200).json(products)
    } catch (error) {
        console.log("Error in Home Route", error)
        sendErrorResponse(res, 500, "Internal server Error")
    }
})


// INVALID ROUTE
app.get("*", (req, res)=>{
    res.send("Not a valid route")
})


// Listen server
app.listen(PORT, ()=> console.log(`Server is listening in port ${PORT}`))