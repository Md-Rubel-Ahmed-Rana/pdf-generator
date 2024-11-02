import { Router } from "express";
import { CertificateController } from "../controllers/certificate.controller";

const router = Router();

router.post("/create", CertificateController.createCertificate);

export const CertificateRoutes = router;
