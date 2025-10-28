import {transporter} from '../config/mailTransporter.js'

export async function forgotPasswordOtpMailTemplate(to,otp){
    const options = {
            from: process.env.MAIL_USER,
            to,
            subject: 'OTP for Forgot Password',
             text: 'OTP for Forgot Password',
        html: `
        <html>
        <body >

                <p>
                    OTP for Forgot Password :${otp}
                </p>
            <p>OTP valid for 5 minutes</p>
        </body>
        </html>`
            };

         return await transporter.sendMail(options)

}

export async function nearExpiryTasksWarningMailTemplate(to,username,taskName,expiryDateTime){
    const options = {
            from: process.env.MAIL_USER,
            to,
            subject: 'Near Expiry Task Warning',
        text: `Hi ${username} ,Near Expiry Task Warning , Task Name :${taskName} ,Expiry Date Time : ${expiryDateTime}.`,
        html: `
        <html>
        <body>

                <p>
                    Hi ${username},
                    Near Expiry Task Warning ,
            
                    Task Name : ${taskName},
                
                    Expiry Date Time : ${expiryDateTime}
                </p>
           
          
</body>
</html>
`

};
    
       return  await   transporter.sendMail(options)
}
