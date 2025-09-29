import express, { json } from "express";
import connectDB from "./config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminArchivedRoutes from "./routes/adminArchivedRoutes.js";
import authRouter from "./routes/auth.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import categoryArchivedRoutes from "./routes/categoryArchivedRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import productTypeArchivedRoutes from "./routes/productTypeArchivedRoutes.js";
import accountRouter from "./routes/account.js";
import linkRoutes from "./routes/linkRoutes.js";
import linkArchivedRoutes from "./routes/linkArchivedRoutes.js";
import generalInformationRoutes from "./routes/generalInformationRoutes.js";
import actLogRoutes from "./routes/actLogRoutes.js";
import productRouter from "./routes/product.js";
import storeRouter from "./routes/store.js";

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
app.use("/api/products", productRouter);
app.use("/api/stores", storeRouter);

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
