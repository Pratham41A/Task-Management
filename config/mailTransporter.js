import nodemailer from "nodemailer";

export  const transporter = nodemailer.createTransport({
  secure: true,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  }
});
