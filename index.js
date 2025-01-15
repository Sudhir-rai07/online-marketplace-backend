import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { ProtectRoute } from './middleware/protectRoute.js'
import { PrismaClient } from '@prisma/client'

dotenv.config() // To use .env file

export const prisma = new PrismaClient() // Prisma Client
const app = express() // Express App
const PORT = process.env.PORT || 5000 // Port

// Middlewares
app.use(express.json()) // To parse JSON data
app.use(cookieParser()) // To parse cookies
app.use(cors()) // To enable cors

// routes middleware
import authRoutes from './routes/auth.js' // Importing auth routes
import sellerRoutes from './routes/seller.js' // Importing seller routes
import seller from './middleware/ProtectSeller.js'
import buyer from './middleware/ProtectBuyer.js'
import productRoutes from './routes/products.js' // Importing product routes

app.use('/api/auth/', authRoutes) // Using auth routes --> Register, Login, Verify Account, Change Password, Reset Password
app.use('/api/user/seller/products/', ProtectRoute, seller, sellerRoutes) // Using seller routes --> Add, Delete, Update, Get All Products
// app.use('/api/user/buyer/', ProtectRoute, buyer, buyerRoutes) // Using seller routes --> Add, Delete, Update, Get All Products
app.use('/api/products', productRoutes) // Using product routes

// Home Route
app.get('/', async (req, res) => {
  res.json('Welcome to E-commerce API')
})

// Invalid Route
app.get('*', (req, res) => {
  res.send('Not a valid route')
})

// Server
app.listen(PORT, () => console.log(`Server is listening in port ${PORT}`))
