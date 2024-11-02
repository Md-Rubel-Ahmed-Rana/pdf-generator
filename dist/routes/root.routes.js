"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootRoutes = void 0;
const express_1 = require("express");
const certificate_route_1 = require("./certificate.route");
const router = (0, express_1.Router)();
router.use("/certificate", certificate_route_1.CertificateRoutes);
exports.RootRoutes = router;
