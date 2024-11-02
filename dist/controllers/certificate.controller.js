"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const certificate_service_1 = require("../services/certificate.service");
class Controller {
    createCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield certificate_service_1.CertificateService.createCertificate(req.body);
                res.status(201).json({
                    statusCode: 201,
                    success: true,
                    message: "Certificate created successfully!",
                    data: result,
                });
            }
            catch (error) {
                res.status(500).json({
                    statusCode: 500,
                    success: false,
                    message: "Something went wrong to create certificate",
                    data: error,
                });
            }
        });
    }
}
exports.CertificateController = new Controller();
