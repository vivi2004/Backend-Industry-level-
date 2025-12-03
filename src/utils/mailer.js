import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or smtp config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendJobCompletedEmail = async ({ to, fileUrl, processedUrl }) => {
  if (!to) return;

  const info = await transporter.sendMail({
    from: `"Task API" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your file has been processed",
    html: `
      <p>Your file has been processed successfully.</p>
      <p>Original: <a href="${fileUrl}">${fileUrl}</a></p>
      <p>Processed: <a href="${processedUrl}">${processedUrl}</a></p>
    `,
  });

  console.log("Email sent:", info.messageId);
};
