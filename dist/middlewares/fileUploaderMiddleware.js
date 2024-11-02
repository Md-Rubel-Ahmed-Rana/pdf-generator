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
exports.FileUploadMiddleware = void 0;
const firebase_1 = require("../config/firebase");
const rootFolder = "PDF-Generator";
class FileUploader {
    uploadGeneratedPdf(folderName, buffer, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = `${rootFolder}/${folderName}/${Date.now()}_${filename}`;
            const blob = firebase_1.firebaseBucket.file(filePath);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: "application/pdf",
            });
            return new Promise((resolve, reject) => {
                blobStream.on("error", (err) => {
                    reject(err);
                });
                blobStream.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [url] = yield blob.getSignedUrl({
                            action: "read",
                            expires: "01-01-2030",
                        });
                        resolve(url);
                    }
                    catch (err) {
                        reject(err);
                    }
                }));
                blobStream.end(buffer);
            });
        });
    }
}
exports.FileUploadMiddleware = new FileUploader();
