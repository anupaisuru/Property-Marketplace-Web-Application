import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors"
import cookieParser from "cookie-parser";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// uploadthing must be mounted after cookieParser so the auth middleware
// can read the access_token cookie.
app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));

//import routes
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoute.js";
import listingRoute from "./routes/listingRoute.js";

//routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listing", listingRoute);

app.listen(process.env.PORT, () => {
  console.log(`app is running on ${process.env.PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
