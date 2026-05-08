import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Wincontrol <visitas@winallcontrol.com>';

export async function sendVisitConfirmation({
  toEmail,
  toName,
  comercial,
  comercialEmail,
  fecha,
  hora,
  inmueble,
  ref,
}: {
  toEmail: string;
  toName: string;
  comercial: string;
  comercialEmail?: string;
  fecha: string;
  hora: string;
  inmueble: string;
  ref: string;
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
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
          ${comercialEmail ? `<li><strong>Email del comercial:</strong> ${comercialEmail}</li>` : ''}
        </ul>
        <p>Saludos,<br/>El equipo de Wincontrol</p>
      `,
    });
    console.log('Email confirmación enviado:', data);
  } catch (error) {
    console.error('Error enviando confirmación:', error);
  }
}

export async function sendVisitNotificationToComercial({
  toEmail,
  comercial,
  clienteNombre,
  clienteEmail,
  clientePhone,
  fecha,
  hora,
  inmueble,
  ref,
}: {
  toEmail: string;
  comercial: string;
  clienteNombre: string;
  clienteEmail?: string;
  clientePhone?: string;
  fecha: string;
  hora: string;
  inmueble: string;
  ref: string;
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Nueva visita asignada · ${ref}`,
      html: `
        <h2>Nueva visita asignada</h2>
        <p>Hola <strong>${comercial}</strong>,</p>
        <p>Se te ha asignado una nueva visita:</p>
        <ul>
          <li><strong>Cliente:</strong> ${clienteNombre}</li>
          ${clienteEmail ? `<li><strong>Email del cliente:</strong> ${clienteEmail}</li>` : ''}
          ${clientePhone ? `<li><strong>Teléfono del cliente:</strong> ${clientePhone}</li>` : ''}
          <li><strong>Inmueble:</strong> ${inmueble}</li>
          <li><strong>Referencia:</strong> ${ref}</li>
          <li><strong>Fecha:</strong> ${fecha}</li>
          <li><strong>Hora:</strong> ${hora}</li>
        </ul>
        <p>Saludos,<br/>El equipo de Wincontrol</p>
      `,
    });
    console.log('Email comercial enviado:', data);
  } catch (error) {
    console.error('Error enviando email al comercial:', error);
  }
}