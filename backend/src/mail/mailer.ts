import { Resend } from 'resend';

const FROM_EMAIL = 'Winallcontrol <visitas@winallcontrol.com>';

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === 're_placeholder') {
    console.warn('RESEND_API_KEY no configurada — emails desactivados');
    return null;
  }
  return new Resend(key);
};

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #f1f5f9;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;height:32px;background:#2563eb;border-radius:8px;text-align:center;vertical-align:middle;">
                  <span style="color:#fff;font-weight:900;font-size:16px;line-height:32px;">W</span>
                </td>
                <td style="padding-left:10px;font-size:12px;font-weight:700;letter-spacing:.1em;color:#0f172a;">WINALLCONTROL</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:32px;">${content}</td></tr>
        <tr>
          <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;">
            <p style="font-size:10px;color:#cbd5e1;margin:0;line-height:1.6;">AVISO DE CONFIDENCIALIDAD: Este mensaje va dirigido exclusivamente a su destinatario y puede contener información confidencial. No está permitida su reproducción sin autorización expresa de Simón Cofreces. Por el RGPD (UE) 2016/679 y la LOPD 3/2018, sus datos serán tratados con la finalidad de gestión comercial. Tenga en consideración su responsabilidad medioambiental antes de imprimir este mensaje.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export async function sendLeadWelcome({
  toEmail, toName, inmueble, inmuebleUrl, comercial, comercialPhone, agendaUrl,
}: {
  toEmail: string; toName: string; inmueble: string;
  inmuebleUrl?: string; comercial: string; comercialPhone?: string; agendaUrl?: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const iniciales = comercial.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Tu solicitud de información · ${inmueble}`,
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Hola ${toName}, ¡muy buenas!</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 28px;">Hemos recibido tu solicitud de información.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Inmueble</p>
            ${inmuebleUrl
              ? `<a href="${inmuebleUrl}" style="font-size:14px;font-weight:600;color:#0f172a;text-decoration:none;display:block;">${inmueble}</a>`
              : `<p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${inmueble}</p>`
            }
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${agendaUrl || '#'}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">Agenda tu visita aquí</a>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;">
          <tr><td style="padding-top:20px;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 12px;">Si necesitas más información puedes escribir un WhatsApp al comercial responsable:</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40px;height:40px;background:#eff6ff;border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-size:13px;font-weight:700;color:#2563eb;">${iniciales}</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${comercial}</p>
                  ${comercialPhone ? `<p style="font-size:13px;color:#94a3b8;margin:2px 0 0;">${comercialPhone}</p>` : ''}
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      `),
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
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Visita confirmada</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">Hola ${toName}, tu visita está confirmada.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Inmueble</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${inmueble}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Fecha y hora</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${fecha} · ${hora}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Comercial</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${comercial}${comercialPhone ? ` · ${comercialPhone}` : ''}</p>
          </td></tr>
        </table>
      `),
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
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Nueva visita asignada</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">Hola ${comercial}, tienes una nueva visita.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Cliente</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${clienteNombre}${clientePhone ? ` · ${clientePhone}` : ''}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Inmueble</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${inmueble}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Fecha y hora</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${fecha} · ${hora}</p>
          </td></tr>
        </table>
      `),
    });
  } catch (error) {
    console.error('Error enviando email al comercial:', error);
  }
}

export async function sendSurveyToClient({
  toEmail, toName, inmueble, comercial, comercialPhone, surveyUrl,
}: {
  toEmail: string; toName: string; inmueble: string;
  comercial: string; comercialPhone?: string; surveyUrl?: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const iniciales = comercial.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `¿Qué te pareció la visita? · ${inmueble}`,
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Hola ${toName}, ¿qué te pareció?</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">Tu opinión nos ayuda a mejorar. Son menos de 2 minutos.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">🏠 Inmueble visitado</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${inmueble}</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 14px;text-transform:uppercase;letter-spacing:.08em;">La encuesta incluye</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#475569;border-bottom:1px solid #f1f5f9;">⭐ Atención del comercial</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#475569;border-bottom:1px solid #f1f5f9;">🏠 ¿Te ha gustado el inmueble?</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#475569;border-bottom:1px solid #f1f5f9;">📐 Distribución y estado</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#475569;">💬 Observaciones (opcional)</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td align="center">
            <a href="${surveyUrl || '#'}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">Responder encuesta →</a>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;">
          <tr><td style="padding-top:20px;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 12px;">¿Tienes alguna duda? Contacta con tu comercial:</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40px;height:40px;background:#eff6ff;border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-size:13px;font-weight:700;color:#2563eb;">${iniciales}</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${comercial}</p>
                  ${comercialPhone ? `<p style="font-size:13px;color:#94a3b8;margin:2px 0 0;">${comercialPhone}</p>` : ''}
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      `),
    });
  } catch (error) {
    console.error('Error enviando encuesta al cliente:', error);
  }
}

export async function sendSurveyToComercial({
  toEmail, comercial, clienteNombre, inmueble, valoracionUrl,
}: {
  toEmail: string; comercial: string; clienteNombre: string; inmueble: string; valoracionUrl?: string;
}) {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `✅ Visita completada · ${clienteNombre}`,
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Visita completada</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">Hola ${comercial}, la visita con ${clienteNombre} ha sido registrada correctamente.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">👤 Cliente</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${clienteNombre}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">🏠 Inmueble</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${inmueble}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">📊 Estado del lead</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">SEGUIMIENTO</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">
          <tr><td style="padding:14px 18px;">
            <p style="font-size:12px;color:#1d4ed8;margin:0;line-height:1.6;">💡 <strong>Próximo paso:</strong> Si el cliente responde en la encuesta que quiere hacer una oferta, recibirás una notificación automática y el lead pasará a <strong>INTENCIÓN DE OFERTA</strong>.</p>
          </td></tr>
        </table>
      `),
    });
  } catch (error) {
    console.error('Error enviando notificación al comercial:', error);
  }
}

export async function sendOfertaNotification({
  toEmail, toName, clienteNombre, inmueble, comercial,
}: {
  toEmail: string; toName: string; clienteNombre: string; inmueble: string; comercial: string;
}) {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Intención de oferta · ${clienteNombre}`,
      html: emailWrapper(`
        <p style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 6px;">Intención de oferta</p>
        <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;">Hola ${toName}, un cliente ha indicado que quiere hacer una oferta.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:16px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Cliente</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${clienteNombre}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Inmueble</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 12px;">${inmueble}</p>
            <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;text-transform:uppercase;letter-spacing:.08em;">Comercial</p>
            <p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">${comercial}</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;">
          <tr><td style="padding:14px 18px;">
            <p style="font-size:12px;color:#1d4ed8;margin:0;">El estado del lead ha cambiado automáticamente a <strong>INTENCIÓN DE OFERTA</strong>. Contacta con el cliente lo antes posible.</p>
          </td></tr>
        </table>
      `),
    });
  } catch (error) {
    console.error('Error enviando notificación de oferta:', error);
  }
}
