const amqp = require("amqplib");
var channel, connection;
const dotenv = require('dotenv')
dotenv.config()

let nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: "giribipin04@gmail.com",
        pass: process.env?.GMAILPASSWORD,
    },
});

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
}
connect().then(async () => {
    channel.consume("EMAIL", (data) => {
        console.log("Consuming Email service");
        const { userEmail, newOrder, products } = JSON.parse(data.content);
        const mailData = {
            from: "giribipin04@gmail.com", // sender address
            to: userEmail, // list of receivers
            subject: "Order made",
            text: "Assignment!!!",
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif;">
            
              <h2>Order Confirmation</h2>
            
              <p>Dear Customer,</p>
            
              <p>Your order has been successfully placed. Below are the details of your order:</p>
            
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Product Name</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loop through products -->
                  ${products.map(product => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 10px;">${product.name}</td>
                      <td style="border: 1px solid #ddd; padding: 10px;">${product.description}</td>
                      <td style="border: 1px solid #ddd; padding: 10px;">$${product.price}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            
              <p>Total Price: $${newOrder.total_price}</p>
            
              <p>Thank you for choosing us!</p>
            
              <p>Best regards,<br>
                Your Company Name</p>
            
            </body>
            </html>
            `,
        };
        const email = transporter.sendMail(
            mailData,
            function (err) {
                if (err) console.log(err);
                else console.log("ok");
            }
        );
        channel.ack(data);
    });
});
