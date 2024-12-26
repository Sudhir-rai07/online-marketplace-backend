import bcrypt from 'bcryptjs'
import sendErrorResponse from "../helper/response.js"
import { PrismaClient } from "@prisma/client"
import GenToken, { GenerateJwtToken } from '../helper/generateToken.js'
import { SendVerificationMail } from '../helper/mail.js'

const prisma = new PrismaClient()

// Registers a user in database and returns a jwt token
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
        const token = await GenerateJwtToken(newUser.id)
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
                tokenExpires: new Date(Date.now() + (60 * 60 * 1000)) // Token expires in 1hr
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


export const Login = async (req, res) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            return sendErrorResponse(res, 400, "Missing auth credentials")
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) return sendErrorResponse(res, 400, "Can not find user")

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return sendErrorResponse(res, 400, "Username or password is incorrect")


        // isVerified
        const isVerified = user.verified
        if (!isVerified) {
            const verifyAccountToken = await prisma.token.create({data: {
                userId: user.id,
                token: await GenToken(),
                type: "AccountVerification",
                tokenExpires: new Date(Date.now() + (60 * 60 * 1000)) // Token expires in 1hr
            }
        })

            SendVerificationMail(user.email, verifyAccountToken.token)
            return res.status(200).json({ message: "A verification email has been sent to your registered email. Please verify" })
        }

        // setCookie
        res.cookie("auth-token", token, {
            httpOnly: true, // prevents client side scripting
            secure: true, // ensures the cookie is sent over the HTTPs
            sameSite: 'strict', // Prevents cross site request forgery
            maxAge: 7 * 24 * 60 * 10 * 1000 // Cookie expires in 7 days
        })
        // sendTokenResponse
        res.status(200).json({ token: token })
    } catch (error) {
        console.log("Error in Login controller ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}

export const VerifyAccount = async (req, res) => {
    const { token } = req.query

    try {
        if (!token) return sendErrorResponse(res, 400, "VerificationToken is missing")
        // find Token
        const vToken = await prisma.token.findUnique({
            where: {
                token: token
            }
        })

        if (!vToken) return sendErrorResponse(res, 400, "No token found")

        if (vToken.type != 'AccountVerification') return sendErrorResponse(res, 400, "Invalid token")

        // Check if the token is expired
        if (new Date(vToken.tokenExpires) < new Date()) {
            await prisma.token.deleteMany({
                where: {
                    tokenExpires: {
                        lt: new Date()
                    }
                }
            })

            return sendErrorResponse(res, 500, "Your verification token has been expired")
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                id: vToken.userId
            }
        })

        if (!user) return sendErrorResponse(res, 400, "User not found")
        // Update user.verified field
        await prisma.user.update({
            where: {
                id: user.id
            }, data: {
                verified: true
            }
        })

        // Delete token
        await prisma.token.delete({
            where: {
                id: vToken.id
            }
        })


        res.status(200).json({ message: "Your account has been verified" })
    } catch (error) {
        console.log('Error in VerifyAccount controller ', error)
        sendErrorResponse(res, 500, "Internal server Error")
    }
}