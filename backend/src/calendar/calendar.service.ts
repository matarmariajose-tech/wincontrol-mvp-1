import { google } from 'googleapis';
import { AppDataSource } from '../config/data-source';
import { Comercial } from '../comerciales/comercial.entity';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export const getOAuthClient = () => new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const calendarService = {
  getAuthUrl: (comercialId: string): string => {
    const oauth2Client = getOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: comercialId,
      prompt: 'consent',
    });
  },

  handleCallback: async (code: string, comercialId: string): Promise<void> => {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    const repo = AppDataSource.getRepository(Comercial);
    await repo.update(comercialId, {
      googleAccessToken: tokens.access_token || undefined,
      googleRefreshToken: tokens.refresh_token || undefined,
    });
  },

  getDefaultSlots: (date: string): string[] => {
    const jornadas = [
      { start: '10:00', end: '14:00' },
      { start: '16:00', end: '20:00' },
    ];
    const available: string[] = [];
    for (const jornada of jornadas) {
      let current = new Date(`${date}T${jornada.start}:00`);
      const end = new Date(`${date}T${jornada.end}:00`);
      while (current < end) {
        available.push(current.toTimeString().slice(0, 5));
        current = new Date(current.getTime() + 60 * 60 * 1000);
      }
    }
    return available;
  },

  getAvailableSlots: async (comercialId: string, date: string): Promise<string[]> => {
    const repo = AppDataSource.getRepository(Comercial);
    const comercial = await repo.findOne({ where: { id: comercialId } });
    if (!comercial?.googleRefreshToken) {
      return calendarService.getDefaultSlots(date);
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: comercial.googleAccessToken,
      refresh_token: comercial.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(date + 'T00:00:00').toISOString(),
      timeMax: new Date(date + 'T23:59:59').toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const busySlots = (events.data.items || []).map(e => ({
      start: new Date(e.start?.dateTime || ''),
      end: new Date(e.end?.dateTime || ''),
    }));

    const jornadas = [
      { start: '10:00', end: '14:00' },
      { start: '16:00', end: '20:00' },
    ];

    const available: string[] = [];
    for (const jornada of jornadas) {
      let current = new Date(`${date}T${jornada.start}:00`);
      const end = new Date(`${date}T${jornada.end}:00`);
      while (current < end) {
        const isBusy = busySlots.some(b => current >= b.start && current < b.end);
        if (!isBusy) available.push(current.toTimeString().slice(0, 5));
        current = new Date(current.getTime() + 60 * 60 * 1000);
      }
    }
    return available;
  },

  createEvent: async (comercialId: string, title: string, date: string, hour: string, durationMinutes: number): Promise<string> => {
    const repo = AppDataSource.getRepository(Comercial);
    const comercial = await repo.findOne({ where: { id: comercialId } });
    if (!comercial?.googleRefreshToken) throw new Error('Comercial no tiene Google Calendar conectado');

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: comercial.googleAccessToken,
      refresh_token: comercial.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const start = new Date(`${date}T${hour}:00`);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        start: { dateTime: start.toISOString(), timeZone: 'Europe/Madrid' },
        end: { dateTime: end.toISOString(), timeZone: 'Europe/Madrid' },
      },
    });

    return event.data.id || '';
  },
};
