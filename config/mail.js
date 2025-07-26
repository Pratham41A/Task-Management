import nodemailer from "nodemailer";

export  const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "propratham4@gmail.com",
    pass: process.env.MAIL_PASSWORD,
  }
});
