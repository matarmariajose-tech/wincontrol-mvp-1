import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  await resend.emails.send({
    from: 'Wincontrol <onboarding@resend.dev>',
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
      <p>Saludos,<br/>El equipo de Wincontrol</p>
    `,
  });
}