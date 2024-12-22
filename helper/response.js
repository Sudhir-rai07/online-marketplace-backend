const sendErrorResponse = async (res, statusCode, text) => {
    res.status(statusCode).json({error: text})
}

export default sendErrorResponse