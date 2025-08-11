import { Schema, model, InferSchemaType } from "mongoose";

const accountSchema = new Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    age: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "inactive",
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

type AccountType = InferSchemaType<typeof accountSchema>;

const Account = model<AccountType>("Account", accountSchema);

export type { AccountType };
export { Account };
