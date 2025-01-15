import bcrypt from 'bcryptjs'
import sendErrorResponse from "../helper/response.js"
import { PrismaClient } from "@prisma/client"
import GenToken, { GenerateJwtToken } from '../helper/generateToken.js'
import { ConfirmPasswordReset, SendPasswordResetEmail, SendVerificationMail } from '../helper/mail.js'

const prisma = new PrismaClient()

// Registers a user in database and returns a jwt token
export const Register = async (req, res) => {
    const { username, email, password, role } = req.body
    try {
        // Check for user credentials
        if (!email || !username || !password || !role) {
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
                password: hashedPassword,
                role: role
            }
        })

        // generate jwt
        const token = await GenerateJwtToken(newUser)
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
            const verifyAccountToken = await prisma.token.create({
                data: {
                    userId: user.id,
                    token: await GenToken(),
                    type: "AccountVerification",
                    tokenExpires: new Date(Date.now() + (60 * 60 * 1000)) // Token expires in 1hr
                }
            })

            SendVerificationMail(user.email, verifyAccountToken.token)
            return res.status(200).json({ message: "A verification email has been sent to your registered email. Please verify" })
        }

        const jwtToken = await GenerateJwtToken(user)

        // setCookie
        res.cookie("auth-token", jwtToken, {
            httpOnly: true, // prevents client side scripting
            secure: true, // ensures the cookie is sent over the HTTPs
            sameSite: 'strict', // Prevents cross site request forgery
            maxAge: 7 * 24 * 60 * 10 * 1000 // Cookie expires in 7 days
        })
        // sendTokenResponse
        res.status(200).json({ token: jwtToken })
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

export const ChangePassword = async (req, res) => {
    const {id: userId} = req.user
    const { currentPassword, newPassword } = req.body
    try {
        // Returns error if both fields are missing
        if (!currentPassword || !newPassword) return sendErrorResponse(res, 400, "Current password and New password is required")

        // Double chack user
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) return sendErrorResponse(res, 400, "User not found")

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update old password with new passowrd
        await prisma.user.update({
            where: {
                id: userId
            }, data: {
                password: hashedPassword
            }
        })

        // send response
        res.status(200).json({ message: "Password changed" })

    } catch (error) {
        console.log("Error in ChangePassword controller ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}

export const ReqResetPassword = async (req, res) =>{
    const {email} = req.body
    try {
        if(!email) return sendErrorResponse(res, 400, "Please provide user email")
        
            const user = await prisma.user.findUnique({where:{
                email: email
            }})

            if(!user) return sendErrorResponse(res, 400, "User not found")
            
                // GenerateToken
                const rPasswordToken = await prisma.token.create({data:{
                    token: await GenToken(),
                    userId: user.id,
                    type: "PasswordReset",
                    tokenExpires: new Date(Date.now() + 60*60*1000)
                }})

            // Send Passwor reset email
            SendPasswordResetEmail(user.email, rPasswordToken.token)

            res.status(200).json({message: "A password reset email has been sent to your registerd email."})
        
    } catch (error) {
        console.log('Error in ReqResetPassword ', error)
        sendErrorResponse(res, 500, "Internal server error")
    }
}

export const ResetPassword = async (req, res) => {
    const { token } = req.query
    const { newPassword } = req.body
    try {
        if (!token) return sendErrorResponse(res, 400, "Token is missing")

        // Find Token
        const rToken = await prisma.token.findUnique({
            where: {
                token: token
            }
        })
        if (!rToken) return sendErrorResponse(res, 400, "No token found")

        if(rToken.type != "PasswordReset") return sendErrorResponse(res, 400, "Invalid token")
        // Fetch user
        const user = await prisma.user.findUnique({
            where: {
                id: rToken.userId
            }
        })

        if (!user) return sendErrorResponse(res, 400, "User not found")


        // Is old password
        const isOldPassword = await bcrypt.compare(newPassword, user.password)
        if (isOldPassword) return sendErrorResponse(res, 400, "New password must not be same as old password")
        if (newPassword.length < 6) return sendErrorResponse(res, 400, "New password must be at least 6 characters long")

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: {
                id: user.id
            }, data: {
                password: hashedPassword
            }
        })

        await prisma.token.delete({where: {
            id: rToken.id
        }})

        ConfirmPasswordReset(user.email)

        res.status(200).json({message: "Your password has been reset"})

    } catch (error) {
        console.log("ERROR IN RESET PASSWORD CONTROLLER ", error)
        sendErrorResponse(res, 500, "Internal server error")
    }

}

export const me = async (req, res) =>{
    const {id} = req.user
    try {
            const user = await prisma.user.findUnique({where:{
                id
            }})

            res.status(200).json(user)
    } catch (error) {
       console.log("Error in GetME route", error) 
       sendErrorResponse(res, 500, "Internal server error")
    }
}