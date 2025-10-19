import { Schema, model, Model } from "mongoose";

interface IVerification {
  email: string;
  verificationCode: string;
  verificationCodeExpires: Date;
  failedAttempts: number;
  lockUntil?: Date;
  isLocked(): boolean;
  isCodeExpired(): boolean;
}

const verification = new Schema<IVerification>({
  email: { type: String, required: true, unique: true },
  verificationCode: String,
  verificationCodeExpires: Date,
  failedAttempts: { type: Number, default: 0 },
  lockUntil: Date,
});

verification.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const VerificationModel: Model<IVerification> = model<IVerification>(
  "Verification",
  verification
);

export default VerificationModel;
export type { IVerification };
