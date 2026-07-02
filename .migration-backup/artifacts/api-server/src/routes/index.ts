import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import dossiersRouter from "./dossiers";
import documentsRouter from "./documents";
import messagesRouter from "./messages";
import fraisRouter from "./frais";
import adminRouter from "./admin";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(dossiersRouter);
router.use(documentsRouter);
router.use(messagesRouter);
router.use(fraisRouter);
router.use(adminRouter);
router.use(reviewsRouter);

export default router;
