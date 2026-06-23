import { Resend } from 'resend';

const FROM_EMAIL = 'Wincontrol <visitas@winallcontrol.com>';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_placeholder') {
    console.warn('RESEND_API_KEY no configurada — emails desactivados');
    return null;
  }
  return new Resend(key);
};

export async function sendLeadWelcome({
  toEmail,
  toName,
  inmueble,
  comercial,
  comercialPhone,
  agendaUrl,
}: {
  toEmail: string;
  toName: string;
  inmueble: string;
  comercial: string;
  comercialPhone?: string;
  agendaUrl?: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Tu ficha del inmueble · ${inmueble}`,
      html: `
        <h2>Hola ${toName},</h2>
        <p>Gracias por tu interés en <strong>${inmueble}</strong>.</p>
        <p>Tu comercial asignado es <strong>${comercial}</strong>${comercialPhone ? ` · ${comercialPhone}` : ''}.</p>
        ${agendaUrl ? `<p><a href="${agendaUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Agenda tu visita aquí</a></p>` : ''}
        <p>Saludos,<br/>El equipo de Wincontrol</p>
      `,
    });
  } catch (error) {
    console.error('Error enviando email al lead:', error);
  }
}

export async function sendVisitConfirmation({
  toEmail, toName, comercial, comercialPhone, fecha, hora, inmueble, ref,
}: {
  toEmail: string; toName: string; comercial: string;
  comercialPhone?: string; fecha: string; hora: string; inmueble: string; ref: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Confirmación de visita · ${ref}`,
      html: `
        <h2>Confirmación de visita</h2>
        <p>Hola <strong>${toName}</strong>, tu visita está confirmada:</p>
        <ul>
          <li><strong>Inmueble:</strong> ${inmueble}</li>
          <li><strong>Fecha:</strong> ${fecha} · ${hora}</li>
          <li><strong>Comercial:</strong> ${comercial}${comercialPhone ? ` · ${comercialPhone}` : ''}</li>
        </ul>
        <p>Saludos,<br/>El equipo de Wincontrol</p>
      `,
    });
  } catch (error) {
    console.error('Error enviando confirmación:', error);
  }
}

export async function sendVisitNotificationToComercial({
  toEmail, comercial, clienteNombre, clientePhone, fecha, hora, inmueble, ref,
}: {
  toEmail: string; comercial: string; clienteNombre: string;
  clientePhone?: string; fecha: string; hora: string; inmueble: string; ref: string;
}) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Nueva visita asignada · ${ref}`,
      html: `
        <h2>Nueva visita asignada</h2>
        <p>Hola <strong>${comercial}</strong>, tienes una nueva visita:</p>
        <ul>
          <li><strong>Cliente:</strong> ${clienteNombre}${clientePhone ? ` · ${clientePhone}` : ''}</li>
          <li><strong>Inmueble:</strong> ${inmueble}</li>
          <li><strong>Fecha:</strong> ${fecha} · ${hora}</li>
        </ul>
        <p>Saludos,<br/>El equipo de Wincontrol</p>
      `,
    });
  } catch (error) {
    console.error('Error enviando email al comercial:', error);
  }
}
