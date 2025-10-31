import { z } from 'zod'

// Admin Setup Schema
export const setupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9]+$/, {
    message: 'Username must be alphanumeric'
  }),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase, and numbers'
  }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// Participant Schema
export const participantSchema = z.object({
  name: z.string().min(1).max(50, 'Name must be 50 characters or less'),
  surname: z.string().min(1).max(50, 'Surname must be 50 characters or less'),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional()
})

// Tournament Schema
export const tournamentSchema = z.object({
  name: z.string().min(1).max(100, 'Name must be 100 characters or less'),
  date: z.string().datetime().or(z.date()),
  fairnessMode: z.enum(['total_random', 'sync_random', 'synchronized']),
  mapPool: z.string().min(1),
  numberOfRounds: z.number().int().min(1).max(50),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  participantIds: z.array(z.string()).min(1, 'At least one participant is required')
})

// Access Code Validation
export const accessCodeSchema = z.object({
  code: z.string().length(8).regex(/^[A-Z0-9]{8}$/, {
    message: 'Invalid tournament code format'
  })
})

// Guess Submission Schema
export const guessSchema = z.object({
  roundId: z.string(),
  guessLatitude: z.number().min(-90).max(90),
  guessLongitude: z.number().min(-180).max(180),
  timeSeconds: z.number().int().min(0)
})

// Tournament Control Schema
export const tournamentControlSchema = z.object({
  action: z.enum(['start', 'pause', 'resume', 'end']),
  tournamentId: z.string(),
  reason: z.string().optional()
})

// Participant Control Schema
export const participantControlSchema = z.object({
  action: z.enum(['pause', 'resume', 'kick', 'reset']),
  tournamentParticipantId: z.string(),
  reason: z.string().optional()
})
