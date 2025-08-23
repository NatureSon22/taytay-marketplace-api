import express, { json } from "express";
import connectDB from "./config/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import adminArchivedRoutes from "./routes/adminArchivedRoutes";
import authRouter from "./routes/auth";
import categoryRoutes from "./routes/categoryRoutes";
import categoryArchivedRoutes from "./routes/categoryArchivedRoutes";
import productTypeRoutes from "./routes/productTypeRoutes";
import productTypeArchivedRoutes from "./routes/productTypeArchivedRoutes";
import accountRouter from "./routes/account";
import linkRoutes from "./routes/linkRoutes";
import linkArchivedRoutes from "./routes/linkArchivedRoutes";
import generalInformationRoutes from "./routes/generalInformationRoutes";
import actLogRoutes from "./routes/actLogRoutes";

const app = express();

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// routes
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

app.use("/api/admins", adminRoutes);
app.use("/api/archive-admins", adminArchivedRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/archive-categories", categoryArchivedRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/archive-product-types", productTypeArchivedRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/archived-links", linkArchivedRoutes);
app.use("/api/general-information", generalInformationRoutes);
app.use("/api/logs", actLogRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  console.log(`The server is running on port ${process.env.PORT}`);
});
