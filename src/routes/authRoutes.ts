import { Router } from "express";
import { adminLogin } from "../controllers/authController";
import { adminLoginSchema } from "../validators/authValidator";
import { validate } from "../middleware/validate";

const router = Router();

//router.post("/admin/login", adminLogin);

router.post('/admin/login', validate(adminLoginSchema), adminLogin);

export default router;