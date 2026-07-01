import { Router } from "express";
import {
  loginController,
  meController,
  logoutController,
  refreshController
} from "./controller";

const router = Router();

router.post(
  "/admin/login",
  loginController
);

router.get(
  "/me",
  meController
);

router.post(
  "/refresh",
  refreshController
);

router.post(
  "/logout",
  logoutController
);

export default router;