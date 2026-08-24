const nodemailer = require("nodemailer");


// ======================================================
// SMTP TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST,

    port: Number(process.env.EMAIL_PORT || 587),

    secure:
        String(process.env.EMAIL_SECURE).toLowerCase() === "true",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


// ======================================================
// VERIFY SMTP
// ======================================================

transporter.verify((error, success) => {

    if (error) {

        console.error(
            "❌ EMAIL SMTP ERROR:",
            error.message
        );

    } else {

        console.log(
            "✅ EMAIL SMTP READY"
        );

    }

});


// ======================================================
// SEND MAIL
// ======================================================

async function sendMail(
    to,
    subject,
    html
) {

    if (!to) {

        throw new Error(
            "Recipient email is required"
        );

    }


    if (!process.env.EMAIL_USER) {

        throw new Error(
            "EMAIL_USER is missing in .env"
        );

    }


    if (!process.env.EMAIL_PASS) {

        throw new Error(
            "EMAIL_PASS is missing in .env"
        );

    }


    const mailOptions = {

        from:
            process.env.EMAIL_FROM ||
            `"ZM LABEL" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html

    };


    const info =
        await transporter.sendMail(
            mailOptions
        );


    console.log(
        "✅ EMAIL SENT:",
        info.messageId
    );


    console.log(
        "📧 EMAIL TO:",
        to
    );


    return info;

}


module.exports = sendMail;