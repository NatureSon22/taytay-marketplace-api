import express, { json } from "express";
import connectDB from "./config/database";
import cors from "cors";
import errorHandler from "./utils/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import adminArchivedRoutes from "./routes/adminArchivedRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import categoryArchivedRoutes from "./routes/categoryArchivedRoutes";
import productTypeRoutes from "./routes/productTypeRoutes";
import productTypeArchivedRoutes from "./routes/productTypeArchivedRoutes";

const app = express();

app.use(json());
app.use(cors());

// routes
app.use("/api/admins", adminRoutes);
app.use("/api/archive-admins", adminArchivedRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/archive-categories", categoryArchivedRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/archive-product-types", productTypeArchivedRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  console.log(`The server is running on port ${process.env.PORT}`);
});
