import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5500

// Middlewares
app.use(express.json())

// routes middleware
import authRoutes from './routes/auth.js'
app.use('/api/auth/', authRoutes )

// Home Route
app.get("/", (req, res)=>{
    res.status(200).json({message: `APP IS RUNNING, You are on ${req.hostname}`})
})


// INVALID ROUTE
app.get("*", (req, res)=>{
    res.send("Not a valid route")
})


// Listen server
app.listen(PORT, ()=> console.log(`Server is listening in port ${PORT}`))