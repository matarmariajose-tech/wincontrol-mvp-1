import { Request, Response } from 'express';
import { calendarService } from './calendar.service';

export const calendarController = {
  getAuthUrl: (req: Request, res: Response) => {
    const url = calendarService.getAuthUrl(req.params.comercialId);
    res.json({ url });
  },

  callback: async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      await calendarService.handleCallback(String(code), String(state));
      res.redirect(`https://www.winallcontrol.com/prototype/admin/?calendar=connected`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  getSlots: async (req: Request, res: Response) => {
    try {
      const { comercialId, date } = req.params;
      const slots = await calendarService.getAvailableSlots(comercialId, date);
      res.json({ slots });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
