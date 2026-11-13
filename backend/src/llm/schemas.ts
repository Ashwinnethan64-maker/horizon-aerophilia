import { z } from 'zod';

export const WhatIfActionSchema = z.object({
  action: z.enum([
    'shift_departure',
    'skip_stop',
    'add_trip',
    'remove_trip',
    'change_capacity',
    'close_route',
    'apply_scenario'
  ]),
  busId: z.string().optional(),
  routeId: z.string().optional(),
  stopId: z.string().optional(),
  newTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  capacity: z.number().int().positive().optional(),
  scenarioId: z.string().optional()
}).superRefine((action, ctx) => {
  const requireField = (condition: boolean, field: string) => {
    if (!condition) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${field} is required for ${action.action}` });
  };
  if (['shift_departure', 'add_trip', 'remove_trip', 'change_capacity'].includes(action.action)) requireField(!!action.busId, 'busId');
  if (['shift_departure', 'add_trip'].includes(action.action)) requireField(!!action.newTime, 'newTime');
  if (action.action === 'change_capacity') requireField(action.capacity !== undefined, 'capacity');
  if (['skip_stop', 'close_route'].includes(action.action)) requireField(!!action.routeId, 'routeId');
  if (action.action === 'skip_stop') requireField(!!action.stopId, 'stopId');
  if (action.action === 'apply_scenario') requireField(!!action.scenarioId, 'scenarioId');
});

export const WhatIfRequestSchema = z.object({
  prompt: z.string().min(3)
});

export const StudentRegistrationSchema = z.object({
  name: z.string().optional(),
  homeStopId: z.string().min(1),
  destinationId: z.string().min(1),
  routeId: z.string().optional(),
  arriveBy: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  days: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5])
});

export const SimulateRequestSchema = z.object({
  scenarioId: z.string().optional(),
  seed: z.number().optional()
});

export const OptimizeRequestSchema = z.object({
  weights: z.object({
    served: z.number().nonnegative().default(10.0),
    wait: z.number().nonnegative().default(2.0),
    crowding: z.number().nonnegative().default(1.5),
    viability: z.number().nonnegative().default(1.1)
  }).optional(),
  scenarioId: z.string().optional(),
  seed: z.number().optional()
});

