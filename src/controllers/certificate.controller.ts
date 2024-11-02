import { Request, Response } from "express";
import { CertificateService } from "../services/certificate.service";

class Controller {
  async createCertificate(req: Request, res: Response) {
    try {
      const result = await CertificateService.createCertificate(req.body);
      res.status(201).json({
        statusCode: 201,
        success: true,
        message: "Certificate created successfully!",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Something went wrong to create certificate",
        data: error,
      });
    }
  }
}

export const CertificateController = new Controller();
