import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text) => {

  const transporter = createTransport({ // mailtrap.io
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASS
    }
  });

  await transporter.sendMail({
    to, subject, text
  })
}