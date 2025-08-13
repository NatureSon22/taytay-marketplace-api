import { Request, Response } from "express";
import Link, { ILink } from "../models/link";
import LinkArchived from "../models/linkArchived";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getLinks = async (req: Request, res: Response) => {
  try {
    const links: ILink[] = await Link.find();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createLink = async (req: MulterRequest, res: Response) => {
  try {
    const { id, label } = req.body;
    const imageUrl = req.file?.path; // safe access

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newLink = new Link({
      id,
      label,
      link: imageUrl, // Cloudinary URL
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const updateLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedLink = await Link.findOneAndUpdate({ id }, req.body, {
      new: true,
    });
    if (!updatedLink) return res.status(404).json({ message: "Link not found" });
    res.status(200).json(updatedLink);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const archiveLink = async (req: Request, res: Response) => {
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

    res.status(200).json({ message: "Link archived successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
