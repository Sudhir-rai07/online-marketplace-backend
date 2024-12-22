import sendErrorResponse from "../helper/response.js";

export const register = async (req, res) =>{
    const {name, email, password} = req.body;
    try {
        if(!name || !email || !password){
           return await sendErrorResponse(res, 400, "Please fill in all fields");
        }
        res.send("Hello")
    } catch (error) {
        console.log("Error in Register route : ", error)
        sendErrorResponse(req, 500, "Internal Server Error");
    }
}