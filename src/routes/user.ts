import { Router } from "express";

import validation from "../middlewares/auth";
import userController from "../controllers/user";

const router: Router = Router();

router
  .post("/login/:userId", userController.userLogin)
  .post(
    "/access/:userToken",
    validation.validateAuth,
    userController.userAccess,
  );

export default router;
