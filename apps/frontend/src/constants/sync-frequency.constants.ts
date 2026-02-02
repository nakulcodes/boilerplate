export const SyncFrequency = {
  EVERY_12_HOURS: "every_12_hours",
  EVERY_24_HOURS: "every_24_hours",
  EVERY_6_HOURS: "every_6_hours",
  EVERY_3_HOURS: "every_3_hours",
  EVERY_1_HOUR: "every_1_hour",
} as const;

export type SyncFrequencyType =
  (typeof SyncFrequency)[keyof typeof SyncFrequency];
