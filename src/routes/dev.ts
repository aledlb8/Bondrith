import validation from "../middlewares/auth";
import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.render("index", {
    name: process.env.NAME,
    version: process.env.VERSION,
    purchase: process.env.PURCHASE_URL,
  });
});

router.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    // @ts-ignore
    user: req.user,
    name: process.env.NAME,
    version: process.env.VERSION,
    purchase: process.env.PURCHASE_URL,
  });
});

export default router;