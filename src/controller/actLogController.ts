import { Request, Response } from "express";
import ActLog from "../models/actlog"; 

export const createLog = async (req: Request, res: Response) => {
  try {
    const { username, action } = req.body;

    if (!username || !action) {
      return res.status(400).json({ message: "Username and action are required" });
    }

    const newLog = await ActLog.create({ username, action });

    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create log", error });
  }
};

export const getAllLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await ActLog.find().sort({ createdAt: -1 }); 
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error });
  }
};

export const getLogById = async (req: Request, res: Response) => {
  try {
    const log = await ActLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch log", error });
  }
};

export const deleteLog = async (req: Request, res: Response) => {
  try {
    const deleted = await ActLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Log not found" });
    }
    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete log", error });
  }
};
