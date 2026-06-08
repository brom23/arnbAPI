import { Router } from "express";
import { loginController } from "../controllers/authController";
import { meController } from "../controllers/meController";
//import { loginAdmin } from "../services/authService";
//import { adminLoginSchema } from "../validators/authValidator";
//import { validate } from "../middleware/validate";
import { logoutController } from "../controllers/logoutController";
import { refreshController } from "../controllers/refreshController";

const router = Router();

//router.post("/admin/login", adminLogin);

//router.post('/admin/login', validate(adminLoginSchema), adminLogin);

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