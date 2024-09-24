require('dotenv').config();
const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

async function sendEmail(toEmail, subject, message) {
    try {
        const result = await client.sendEmail({
          "From": "benjamin.huber@colorado.edu",
          "To": toEmail,
          "Subject": subject,
          "TextBody": message
        });
    
        console.log("Email sent successfully:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = sendEmail;