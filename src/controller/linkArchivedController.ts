import { Request, Response } from "express";
import LinkArchived, { ILinkArchived } from "../models/linkArchived";

export const getArchivedLinks = async (req: Request, res: Response) => {
  try {
    const archivedLinks: ILinkArchived[] = await LinkArchived.find();
    res.status(200).json(archivedLinks);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const restoreArchivedLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archivedLink = await LinkArchived.findOne({ id });
    if (!archivedLink) {
      return res.status(404).json({ message: "Archived link not found" });
    }

    const restoredLink = {
      id: archivedLink.id,
      label: archivedLink.label,
      link: archivedLink.link,
    };

    const Link = (await import("../models/link")).default;
    await new Link(restoredLink).save();

    await LinkArchived.deleteOne({ id });

    res.status(200).json({ message: "Link restored successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};
