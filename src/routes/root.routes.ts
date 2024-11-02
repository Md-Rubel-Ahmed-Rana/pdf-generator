import { Router } from "express";
import { CertificateRoutes } from "./certificate.route";

const router = Router();

router.use("/certificate", CertificateRoutes);

export const RootRoutes = router;
