import sendErrorResponse from "../helper/response.js"
import {PrismaClient} from "@prisma/client"

const prisma = new PrismaClient()

export const Register = async (req, res) => {

    const {email, username, full_name} = req.body
    try {
        if(!email || !username || !full_name){
            return sendErrorResponse(res, 400, "Please fill all fields")
        }

        const existingUser = await prisma.user.findFirst({where:{email: email}})
        if(existingUser) return sendErrorResponse(res, 409, "Email already exists")

        const newUser = await prisma.user.create({
            data: {
                email:email,
                username:username,
                full_name:full_name
            }
        })

        console.log("USER CREATED")
        res.status(201).json({message: "User created"})
    } catch (error) {
        console.log("Error in Register controller : ", error)
        sendErrorResponse(res, 500, "Internal Server Error")
    }
}