import { Request, Response } from "express";
import GeneralInformation, { IGeneralInformation } from "../models/generalInformation";

export const upsertGeneralInformation = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    let info = await GeneralInformation.findOne();
    
    if (info) {
      info.set(data);
      await info.save();
    } else {
      info = await GeneralInformation.create(data);
    }

    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getGeneralInformation = async (req: Request, res: Response) => {
  try {
    const info = await GeneralInformation.findOne();
    if (!info) {
      return res.status(404).json({ message: "General information not found" });
    }
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
