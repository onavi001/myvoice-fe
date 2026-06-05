import type { IUser } from "../models/Users";

export type CoachPublic = Pick<IUser, "_id" | "username" | "bio" | "specialties">;

export type CoachAssignmentNotice = {
  routineId: string;
  routineName: string;
  coachMessage: string;
  assignedAt: string;
};

export type CoachProfile = {
  coachCode: string;
  clientCount: number;
  clientLimit: number;
  atLimit: boolean;
};

export type CoachCodePreview = CoachPublic & {
  coachCode: string;
  acceptingClients: boolean;
  clientCount: number;
  clientLimit: number;
};

export type ClientActivitySummary = {
  lastSessionAt: string | null;
  daysSinceLastSession: number | null;
  weekTrainingDays: number;
};

export type MyCoachOverview =
  | { status: "not_applicable" }
  | { status: "none" }
  | {
      status: "pending";
      pendingRequest: {
        _id: string;
        createdAt: string;
        coach: CoachPublic | null;
      };
    }
  | {
      status: "assigned";
      coach: CoachPublic;
      assignedRoutineCount: number;
      pendingAssignments?: CoachAssignmentNotice[];
    };

export type CoachClientSummary = IUser & {
  assignedRoutineCount?: number;
  activity?: ClientActivitySummary;
};
