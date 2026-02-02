export enum SyncStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  NOT_FOUND = "not_found",
  SKIPPED = "skipped",
}

export enum SyncType {
  REPLENISHMENT = "replenish",
  TRACK = "track",
  REPLENISHMENT_TRACK = "replenish_track",
}
