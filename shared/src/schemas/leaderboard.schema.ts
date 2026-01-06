import { z } from "zod";

export const LeaderboardEntrySchema = z.object({
  _id: z.string(),
  householdName: z.string(),
  rank: z.number(),
  totalPoints: z.number(),
  points: z.object({
    goBag: z.number(),
    modules: z.number(),
    community: z.number(),
  }),
  location: z
    .object({
      city: z.string(),
      barangay: z.string(),
    })
    .optional(),
});

export const LeaderboardResponseSchema = z.array(LeaderboardEntrySchema);

// Export types inferred from the schema
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;
