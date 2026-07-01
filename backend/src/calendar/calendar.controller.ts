import { Request, Response } from 'express';
import { calendarService } from './calendar.service';

export const calendarController = {
  getAuthUrl: (req: Request, res: Response) => {
    const url = calendarService.getAuthUrl(String(req.params.comercialId));
    res.json({ url });
  },

  callback: async (req: Request, res: Response) => {
    try {
      const code = String(req.query.code);
      const state = String(req.query.state);
      await calendarService.handleCallback(code, state);
      res.redirect(`https://www.winallcontrol.com/prototype/admin/?calendar=connected`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getSlots: async (req: Request, res: Response) => {
    try {
      const slots = await calendarService.getAvailableSlots(
        String(req.params.comercialId),
        String(req.params.date)
      );
      res.json({ slots });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
