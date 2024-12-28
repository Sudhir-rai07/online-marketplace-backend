import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth:{
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_USER_PASS
    }
})

const sendMail = async (mailOptions) =>{
    transporter.sendMail(mailOptions, (err)=>{
        if(err){
            console.log(err)
        }
    })
}

export const SendVerificationMail = async (userEmail, token) =>{
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject : "Account verification",
        text: "Please verify you account to access our website and services",
        html: `<div>
        Click this link to verify your account. <a href=${process.env.HOST}/api/auth/verify-account?token=${token}>Click here</a>

        <br /> 
        <p>Note : This email is only valid for 1 hour.</p>
        </div>`
    }

    sendMail(mailOptions)
}

export const ConfirmPasswordReset = async (userEmail) =>{
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject : "Password Reset",
        text: "Your password has been changed successfully.",
        html: `<div>Dear user, Your password has been changed successfully
        </div>`
    }
    sendMail(mailOptions)
}

export const SendPasswordResetEmail = async (userEmail, token) =>{
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject : "Reset Password",
        text: "We have received a password reset request for your account",
        html: `<div>
        <p>If you have not requested for a password reset. Please ignore this email</p>
        Click this link to reset your password. <a href=${process.env.HOST}/api/auth/password/reset?token=${token}>Click here</a>

        <br /> 
        <p>Note : This email is only valid for 1 hour.</p>
        </div>`
    }

    sendMail(mailOptions)
}