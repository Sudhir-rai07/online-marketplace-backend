import bcrypt from 'bcryptjs'
import sendErrorResponse from "../helper/response.js"
import { PrismaClient } from "@prisma/client"
import GenToken, { GenerateJwtToken } from '../helper/generateToken.js'
import { SendVerificationMail } from '../helper/mail.js'

const prisma = new PrismaClient()

export const Register = async (req, res) => {

    const { username, email, password } = req.body
    try {
        // Check for user credentials
        if (!email || !username || !password) {
            return sendErrorResponse(res, 400, "Please fill all fields")
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const test = emailRegex.test(email)

        if (!test) return sendErrorResponse(res, 400, "Please enter a valid email")

        if (username.length < 3) {
            return sendErrorResponse(res, 400, "Username must be at least 4 characters long")
        }

        if (password.length < 6) {
            return sendErrorResponse(res, 400, "Password must be at least 6 characters long")
        }

        // Checks if email is already registered
        const isMatch = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        // Chaecks if email is already registered and retruns an error
        if (isMatch) return sendErrorResponse(res, 409, "This email is already in use")

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword
            }
        })

        // generate jwt
        const token =await GenerateJwtToken(newUser.id)
        // setCookie
        res.cookie("auth-token", token, {
            httpOnly: true, // prevents client side scripting
            secure: true, // ensures the cookie is sent over the HTTPs
            sameSite: 'strict', // Prevents cross site request forgery
            maxAge: 7 * 24 * 60 * 10 * 1000 // Cookie expires in 7 days
        })

        // generate token 
        const verifyAccountToken = await prisma.token.create({
            data: {
                userId: newUser.id,
                token: await GenToken(),
                type: "AccountVerification",
                tokenExpires: new Date(Date.now()+(60*60*1000)) // Token expires in 1hr
            }
        })
        // send verification email
        SendVerificationMail(newUser.email, verifyAccountToken.token)

        // send response -- jwt token
        res.status(201).json({ token: token })
    } catch (error) {
        console.log("Error in Register controller : ", error)
        sendErrorResponse(res, 500, "Internal Server Error")
    }
}