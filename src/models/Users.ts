import { Schema, model, Model } from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "coach" | "admin";
  goals?: string[];
  notes?: string;
  coachId?: string; // Para usuarios: ID del coach asignado
  specialties?: string[]; // Para coaches: ej. ["Fuerza", "Cardio"]
  bio?: string; // Para coaches: descripción
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "coach"], default: "user", required: true },
  goals: [{ type: String }],
  notes: { type: String },
  coachId: { type: Schema.Types.ObjectId, ref: "User" },
  specialties: [{ type: String }],
  bio: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

let UserModel: Model<IUser>;

try {
  UserModel = model<IUser>("User", UserSchema);
} catch {
  UserModel = model<IUser>("User", UserSchema, undefined, { overwriteModels: true });
}

export default UserModel;
