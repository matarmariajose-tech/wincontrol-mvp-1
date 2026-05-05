import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendVisitConfirmation({
  toEmail,
  toName,
  comercial,
  fecha,
  hora,
  inmueble,
  ref,
}: {
  toEmail: string;
  toName: string;
  comercial: string;
  fecha: string;
  hora: string;
  inmueble: string;
  ref: string;
}) {
  await transporter.sendMail({
    from: `"Wincontrol" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `Confirmación de visita · ${ref}`,
    html: `
      <h2>Confirmación de visita</h2>
      <p>Hola <strong>${toName}</strong>,</p>
      <p>Tu visita ha sido registrada con los siguientes datos:</p>
      <ul>
        <li><strong>Inmueble:</strong> ${inmueble}</li>
        <li><strong>Referencia:</strong> ${ref}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Hora:</strong> ${hora}</li>
        <li><strong>Comercial asignado:</strong> ${comercial}</li>
      </ul>
      <p>Si tenés alguna duda, no dudes en contactarnos.</p>
      <p>Saludos,<br/>El equipo de Wincontrol</p>
    `,
  });
}