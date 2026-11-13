import { z } from 'zod';

export const WhatIfActionSchema = z.object({
  action: z.enum([
    'shift_departure',
    'skip_stop',
    'add_trip',
    'remove_trip',
    'change_capacity',
    'apply_scenario'
  ]),
  busId: z.string().optional(),
  routeId: z.string().optional(),
  stopId: z.string().optional(),
  newTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  capacity: z.number().positive().optional(),
  scenarioId: z.string().optional()
});

export const WhatIfRequestSchema = z.object({
  prompt: z.string().min(3)
});

export const StudentRegistrationSchema = z.object({
  name: z.string().optional(),
  homeStopId: z.string().min(1),
  destinationId: z.string().min(1),
  arriveBy: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  days: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5])
});

export const SimulateRequestSchema = z.object({
  scenarioId: z.string().optional(),
  seed: z.number().optional()
});

export const OptimizeRequestSchema = z.object({
  weights: z.object({
    served: z.number().default(10.0),
    wait: z.number().default(2.0),
    crowding: z.number().default(1.5),
    viability: z.number().default(1.0)
  }).optional(),
  scenarioId: z.string().optional(),
  seed: z.number().optional()
});
