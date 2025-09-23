import { Request, Response } from "express";
import GeneralInformation from "../models/generalInformation";
import { logAction } from "../utils/logAction";

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName?: string;
    lastName?: string;
  };
}

export const upsertGeneralInformation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;
    let info = await GeneralInformation.findOne();
    let actionMessage = "";

    if (info) {
      info.set(data);
      await info.save();
      actionMessage = "Updated general information";
    } else {
      info = await GeneralInformation.create(data);
      actionMessage = "Created general information";
    }

    await logAction(req, actionMessage);

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
