import express, { json } from "express";
import connectDB from "./config/database";
import cors from "cors";

const app = express();

app.use(json());
app.use(cors());

// routes

app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  console.log(`The server is running on port ${process.env.PORT}`);
});
