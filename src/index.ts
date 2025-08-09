import express, { json } from "express";
import connectDB from "./config/database";
import cors from "cors";
import errorHandler from "./utils/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import adminArchivedRoutes from "./routes/adminArchivedRoutes";

const app = express();

app.use(json());
app.use(cors());

// routes
app.use("/api/admins", adminRoutes);
app.use("/api/archive-admins", adminArchivedRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  console.log(`The server is running on port ${process.env.PORT}`);
});
