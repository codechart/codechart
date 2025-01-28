// Create a new file src/types/enums.ts

export enum OS {
  Mac = "Mac",
  Windows = "Windows", 
  Linux = "Linux"
}

export enum RoleType {
  Developer = "developer",
  TeamLead = "team_lead",
  Architect = "architect",
  Manager = "manager",
  Other = "other"
}

export enum FeatureStatus {
  Open = "open",
  InProgress = "in_progress",
  Done = "done"
}

export enum UsageLevel {
  Never = "never",
  ABit = "a_bit",
  QuiteALot = "quite_a_lot"
}

export enum Purpose {
  SoloWork = "solo_work",
  Cooperation = "cooperation"
}

export enum VoteImportance {
  NotImportant = "not_important", 
  LowPriority = "low_priority",
  MediumPriority = "medium_priority",
  HighPriority = "high_priority",
  Crucial = "crucial"
}