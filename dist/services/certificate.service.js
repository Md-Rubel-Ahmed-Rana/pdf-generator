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
exports.CertificateService = void 0;
const pdf_lib_1 = require("pdf-lib");
const fileUploaderMiddleware_1 = require("../middlewares/fileUploaderMiddleware");
function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
        if (width < maxWidth) {
            currentLine += " " + word;
        }
        else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
class Service {
    createCertificate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { studentName, courseName, technologies } = data;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            const titleColor = (0, pdf_lib_1.rgb)(0, 0, 0);
            const subtitleColor = (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2);
            const bodyColor = (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1);
            const font = yield pdfDoc.embedFont("Helvetica");
            const boldFont = yield pdfDoc.embedFont("Helvetica-Bold");
            const marginX = 50;
            const maxWidth = pageWidth - marginX * 2;
            page.drawText("Certificate of Completion", {
                x: marginX +
                    maxWidth / 2 -
                    boldFont.widthOfTextAtSize("Certificate of Completion", 24) / 2,
                y: pageHeight - 150,
                size: 24,
                color: titleColor,
                font: boldFont,
            });
            page.drawText(studentName, {
                x: marginX + maxWidth / 2 - font.widthOfTextAtSize(studentName, 22) / 2,
                y: pageHeight - 200,
                size: 22,
                color: subtitleColor,
                font,
            });
            const courseText = `for the successful completion of the ${courseName} course`;
            const wrappedCourseText = wrapText(courseText, maxWidth, font, 16);
            wrappedCourseText.forEach((line, index) => {
                page.drawText(line, {
                    x: marginX,
                    y: pageHeight - 250 - index * 20,
                    size: 16,
                    color: bodyColor,
                    font,
                });
            });
            const skillsText = `with a rigorous amount of ${technologies.join(", ")} and applied these skills to build several projects.`;
            const wrappedSkillsText = wrapText(skillsText, maxWidth, font, 14);
            wrappedSkillsText.forEach((line, index) => {
                page.drawText(line, {
                    x: marginX,
                    y: pageHeight - 300 - index * 20,
                    size: 14,
                    color: bodyColor,
                    font,
                });
            });
            const messageText = "We are proud of the student's hard work, dedication, and quick learning, which enabled them to complete assigned tasks on time.";
            const wrappedMessageText = wrapText(messageText, maxWidth, font, 14);
            wrappedMessageText.forEach((line, index) => {
                page.drawText(line, {
                    x: marginX,
                    y: pageHeight - 370 - index * 20,
                    size: 14,
                    color: bodyColor,
                    font,
                });
            });
            page.drawText("You did it, and we are proud of you!", {
                x: marginX,
                y: 100,
                size: 16,
                color: titleColor,
                font: boldFont,
            });
            const pdfBytes = yield pdfDoc.save();
            const pdfBuffer = Buffer.from(pdfBytes);
            const filename = `${studentName}-certificate-${Date.now()}.pdf`;
            try {
                const fileUrl = yield fileUploaderMiddleware_1.FileUploadMiddleware.uploadGeneratedPdf("certificates", pdfBuffer, filename);
                return fileUrl;
            }
            catch (error) {
                console.error("Error uploading certificate:", error);
                throw new Error("Certificate upload failed.");
            }
        });
    }
}
exports.CertificateService = new Service();
