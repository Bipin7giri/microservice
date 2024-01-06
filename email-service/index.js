const amqp = require("amqplib");
var channel, connection;


let nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: "giribipin04@gmail.com",
        pass: "sbpvbmpmsvbtqmnf",
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
        const { userEmail, newOrder } = JSON.parse(data.content);
        console.log(userEmail)
        console.log(newOrder)

        const mailData = {
            from: "giribipin04@gmail.com", // sender address
            to: userEmail, // list of receivers
            subject: "Order made",
            text: "Assignment!!!",
            html: `<br>${JSON.stringify(newOrder)} </br>`,
        };
        const email = transporter.sendMail(
            mailData,
            function (err) {
                if (err) console.log(err);
                else console.log("ok");
            }
        );
        channel.ack(data);
        // channel.sendToQueue(
        //     "PRODUCT",
        //     Buffer.from(JSON.stringify({ newOrder }))
        // );
    });
});
