import {transporter} from '../config/mail.js'

export async function forgotPassword(to,encryptedEmail){
    const options = {
            from: 'propratham4@gmail.com',
            to,
            subject: 'Forgot Password',
             text: 'Link For Reset Password : Front-End URL for Reset Password?encryptedMail='+encodeURIComponent(encryptedEmail),
        html: `
        <html>
        <body >
           <p>Link : </p>
                        
                            <a href="Front-End URL for Reset Password?encryptedMail=${encodeURIComponent(encryptedEmail)}">
                               Reset Password
                            </a>
                        
        </body>
        </html>`
            };

          await transporter.sendMail(options)

}

export async function nearExpiryTasks(to,taskName,expiryDateTime){
    const options = {
            from: 'propratham4@gmail.com',
            to,
            subject: 'Near Expiry Task Warning',
        text: `Near Expiry Task Information : Task ${taskName} ,Expiry Date Time : ${expiryDateTime}.`,
        html: `
        <html>
        <body>

                <p>
                    Near Expiry Task Information :
                </p>
                <p>
                    Task Name : <strong>${taskName}</strong>
                </p>
                <p>
                    Expiry Date Time : <strong>${expiryDateTime}</strong>
                </p>
           
          
</body>
</html>
`

};
    
         await   transporter.sendMail(options)
}
