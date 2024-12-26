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


export const SendVerificationMail = async (user, token) =>{
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: user,
        subject : "Account verification",
        text: "Please verify you account to access our website and services",
        html: `<p>Click this link to verify your account. <a href=${process.env.HOST}/api/auth/verify-account?token=${token}>Click here</a></p>`
    }

    transporter.sendMail(mailOptions, (err)=>{
        if(err){
            console.log(err)
        }
    })
}