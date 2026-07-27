import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

export async function sendConfirmationEmail(email, name, reportID) {

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Report Received",
        html: `
            <h2>Hello ${name},</h2>

            <p>Thank you for submitting your harassment report.</p>

            <p><strong>Reference Number:</strong> HR-${reportID}</p>

            <p>Your report has been received and is awaiting review by an administrator.</p>

            <p>Kind regards,<br>Harassment Reporting Team</p>
        `
    });

}