import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  signOut,
} from "../controllers/authController.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signOut", signOut);

export default router;
