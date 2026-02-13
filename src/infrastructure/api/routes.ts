import { Router } from "express";
import { setLetterRoutes } from "./routes/letter.route";

export const router = Router();

router.use('/letters', setLetterRoutes());
