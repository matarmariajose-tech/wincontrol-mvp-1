import { Lead } from '../domain/lead.entity';

let leads: Lead[] = [];

export const leadRepository = {
  findAll: (): Lead[] => leads,

  create: (lead: Lead): Lead => {
    leads.push(lead);
    return lead;
  },
};