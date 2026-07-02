import { google } from 'googleapis';
import { AppDataSource } from '../config/data-source';
import { Comercial } from '../comerciales/comercial.entity';
import { Visit } from '../visits/domain/visit.entity';
import { Property } from '../properties/property.entity';
import axios from 'axios';

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

  getBufferMinutes: async (fromAddress: string, toAddress: string): Promise<number> => {
    try {
      const key = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_CLIENT_ID?.split('-')[0];
      const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!mapsKey) return 20;
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(fromAddress)},España&destinations=${encodeURIComponent(toAddress)},España&mode=driving&key=${mapsKey}`;
      const res = await axios.get(url);
      const duration = res.data?.rows?.[0]?.elements?.[0]?.duration?.value;
      if (!duration) return 20;
      return Math.ceil(duration / 60);
    } catch {
      return 20;
    }
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

    const visitRepo = AppDataSource.getRepository(Visit);
    const propRepo = AppDataSource.getRepository(Property);

    const visitsOfDay = await visitRepo.find({ where: { comercialId: comercial.nombre } });
    const visitsThisDay = visitsOfDay.filter(v => v.fecha === date).sort((a, b) => a.hora.localeCompare(b.hora));

    const available: string[] = [];
    for (const jornada of jornadas) {
      let current = new Date(`${date}T${jornada.start}:00`);
      const end = new Date(`${date}T${jornada.end}:00`);
      while (current < end) {
        const isBusy = busySlots.some(b => current >= b.start && current < b.end);
        if (!isBusy) {
          let blocked = false;
          if (visitsThisDay.length > 0) {
            const currentStr = current.toTimeString().slice(0, 5);
            const prevVisits = visitsThisDay.filter(v => v.hora.slice(0, 5) < currentStr);
            if (prevVisits.length > 0) {
              const lastVisit = prevVisits[prevVisits.length - 1];
              if (lastVisit.propertyId) {
                const lastProp = await propRepo.findOne({ where: { id: lastVisit.propertyId } });
                if (lastProp?.address) {
                  const lastHora = new Date(`${date}T${lastVisit.hora.slice(0,5)}:00`);
                  const minutesSince = (current.getTime() - lastHora.getTime()) / 60000;
                  if (minutesSince < 80) {
                    const buffer = await calendarService.getBufferMinutes(lastProp.address, lastProp.address);
                    if (minutesSince < buffer + 60) blocked = true;
                  }
                }
              }
            }
          }
          if (!blocked) available.push(current.toTimeString().slice(0, 5));
        }
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
