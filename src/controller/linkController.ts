import { Request, Response } from "express";
import Link, { ILink } from "../models/link.js";
import LinkArchived from "../models/linkArchived.js";
import { logAction } from "../utils/logAction.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

interface AuthenticatedRequest extends Request {
  account?: {
    accountId: string;
    type: "admin" | "account";
    firstName?: string;
    lastName?: string;
  };
}

export const getLinks = async (req: Request, res: Response) => {
  try {
    const links: ILink[] = await Link.find();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createLink = async (req: MulterRequest & AuthenticatedRequest, res: Response) => {
  try {
    const { id, label } = req.body;
    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Optionally: check duplicate ID or label
    const existingLink = await Link.findOne({ $or: [{ id }, { label }] });
    if (existingLink) {
      return res.status(409).json({ message: "Link ID or Label already exists" });
    }

    const newLink = new Link({
      id,
      label,
      link: imageUrl,
    });

    await newLink.save();

    await logAction(req, `Created link (${label})`);

    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};


export const updateLink = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedLink = await Link.findOneAndUpdate({ id }, req.body, {
      new: true,
    });

    if (!updatedLink) return res.status(404).json({ message: "Link not found" });

    await logAction(req, `Updated link (${updatedLink.label})`);

    res.status(200).json(updatedLink);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const archiveLink = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const linkToArchive = await Link.findOne({ id });
    if (!linkToArchive) {
      return res.status(404).json({ message: "Link not found" });
    }

    const archivedLink = new LinkArchived({
      id: linkToArchive.id,
      label: linkToArchive.label,
      link: linkToArchive.link,
    });
    await archivedLink.save();

    await Link.deleteOne({ id });

    await logAction(req, `Archived link (${linkToArchive.label})`);

    res.status(200).json({ message: "Link archived successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
