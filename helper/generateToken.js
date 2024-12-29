import jwt from 'jsonwebtoken'
const GenToken = async () => {
    const token = crypto.randomUUID()
    return token
}

export default GenToken


export const GenerateJwtToken = async (user) => {
    try {
        const token = jwt.sign(user,
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        )

        return token
    } catch (error) {
        console.log("Error in generating jwt token", error)
        return null
    }
}