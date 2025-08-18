import mongoose, { Document, Schema } from "mongoose";

export interface IGeneralInformation extends Document {
  termsandcondition: string;
  privacypolicy: string;
  about: string;
  contactinfo: string;
  uvexpress: string;
  jeepney: string;
  mrt: string;
  uvandbus: string;
  ridehailingapps: string;
}

const generalInformationSchema = new Schema<IGeneralInformation>(
  {
    termsandcondition: { type: String, required: true },
    privacypolicy: { type: String, required: true },
    about: { type: String, required: true },
    contactinfo: { type: String, required: true },
    uvexpress: { type: String, required: true },
    jeepney: { type: String, required: true },
    mrt: { type: String, required: true },
    uvandbus: { type: String, required: true },
    ridehailingapps: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGeneralInformation>(
  "GeneralInformation",
  generalInformationSchema
);
