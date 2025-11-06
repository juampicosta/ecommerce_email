import nodemailer from 'nodemailer'

const sendTransportEmail = async mailOptions => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    const info = await transporter.sendMail(mailOptions)

    console.log('Correo enviado:', info.response)
  } catch (error) {
    console.error('Error al enviar el correo:', error)
  }
}

export const sendEmail = async (userEmail, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject,
    html,
  }

  await sendTransportEmail(mailOptions)
}
