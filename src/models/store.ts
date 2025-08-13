import { InferSchemaType, model, Schema, Types } from "mongoose";

const storeSchema = new Schema({
  stallNumbers: [{ type: String }],
  permit: { type: String, required: true },
  storeName: { type: String, required: true },
  owner: { type: Types.ObjectId, ref: "Account", required: true },
});

type StoreType = InferSchemaType<typeof storeSchema>;

const Store = model<StoreType>("Store", storeSchema);

export type { StoreType };
export { Store };
