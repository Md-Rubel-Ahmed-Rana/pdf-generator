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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateService = void 0;
const pdf_lib_1 = require("pdf-lib");
const textWrapLineBreaker_1 = __importDefault(require("../utils/textWrapLineBreaker"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fileUploaderMiddleware_1 = require("../middlewares/fileUploaderMiddleware");
class Service {
    createCertificate(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, shouldDeploy = false) {
            const { studentName, courseName, technologies } = data;
            const pdfDoc = yield pdf_lib_1.PDFDocument.create();
            const page = this.createPage(pdfDoc);
            const colors = {
                titleColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                bodyColor: (0, pdf_lib_1.rgb)(0.1, 0.1, 0.1),
                purpleColor: (0, pdf_lib_1.rgb)(128 / 255, 0 / 255, 128 / 255),
            };
            const fonts = {
                font: yield pdfDoc.embedFont("Helvetica"),
                boldFont: yield pdfDoc.embedFont("Helvetica-Bold"),
            };
            const margins = { marginX: 50, maxWidth: 792 - 50 * 2 };
            const yPositions = {
                title: 512,
                studentName: 462,
                courseCompletion: 412,
                skills: 352,
                message: 282,
                footer: 150,
            };
            this.drawBorder(page, colors.purpleColor);
            this.drawTitleAndStudentName(page, studentName, colors, fonts, margins, yPositions);
            this.drawCourseCompletion(page, courseName, colors.bodyColor, fonts, margins, yPositions.courseCompletion);
            this.drawSkillsText(page, technologies, colors.bodyColor, fonts.font, margins, yPositions.skills);
            this.drawMessageText(page, colors.bodyColor, fonts.font, margins, yPositions.message);
            this.drawFooter(page, colors.titleColor, fonts.boldFont, margins, yPositions.footer);
            return shouldDeploy
                ? this.deployCertificate(pdfDoc, studentName)
                : this.savePdf(pdfDoc, studentName);
        });
    }
    createPage(pdfDoc) {
        const pageWidth = 792;
        const pageHeight = 612;
        return pdfDoc.addPage([pageWidth, pageHeight]);
    }
    drawBorder(page, color) {
        const borderThickness = 5;
        const outerMargin = 20;
        page.drawRectangle({
            x: outerMargin + borderThickness / 2,
            y: outerMargin + borderThickness / 2,
            width: page.getWidth() - outerMargin * 2 - borderThickness,
            height: page.getHeight() - outerMargin * 2 - borderThickness,
            borderColor: color,
            borderWidth: borderThickness,
        });
    }
    drawTitleAndStudentName(page, studentName, colors, fonts, margins, yPositions) {
        page.drawText("Certificate of Completion", {
            x: margins.marginX +
                margins.maxWidth / 2 -
                fonts.boldFont.widthOfTextAtSize("Certificate of Completion", 24) / 2,
            y: yPositions.title,
            size: 24,
            color: colors.purpleColor,
            font: fonts.boldFont,
        });
        page.drawText(studentName, {
            x: margins.marginX +
                margins.maxWidth / 2 -
                fonts.boldFont.widthOfTextAtSize(studentName, 22) / 2,
            y: yPositions.studentName,
            size: 22,
            color: colors.purpleColor,
            font: fonts.boldFont,
        });
    }
    drawCourseCompletion(page, courseName, bodyColor, fonts, margins, yPosition) {
        const courseIntroText = "for the successful completion of the ";
        const courseIntroWidth = fonts.font.widthOfTextAtSize(courseIntroText, 16);
        const wrappedCourseName = (0, textWrapLineBreaker_1.default)(courseName, margins.maxWidth - courseIntroWidth, fonts.boldFont, 16);
        page.drawText(courseIntroText, {
            x: margins.marginX,
            y: yPosition,
            size: 16,
            color: bodyColor,
            font: fonts.font,
        });
        wrappedCourseName.forEach((line, index) => {
            page.drawText(line, {
                x: margins.marginX + courseIntroWidth,
                y: yPosition - index * 20,
                size: 16,
                color: bodyColor,
                font: fonts.boldFont,
            });
        });
        const lastLineWidth = wrappedCourseName.length > 0
            ? fonts.boldFont.widthOfTextAtSize(wrappedCourseName[wrappedCourseName.length - 1], 16)
            : 0;
        const courseXPosition = margins.marginX + courseIntroWidth + lastLineWidth + 5;
        page.drawText("course", {
            x: courseXPosition,
            y: yPosition - (wrappedCourseName.length - 1) * 20,
            size: 16,
            color: bodyColor,
            font: fonts.font,
        });
    }
    drawSkillsText(page, technologies, bodyColor, font, margins, yPosition) {
        const skillsText = `with a rigorous amount of ${technologies.join(", ")} and applied these skills to build several projects.`;
        const wrappedSkillsText = (0, textWrapLineBreaker_1.default)(skillsText, margins.maxWidth, font, 14);
        wrappedSkillsText.forEach((line, index) => {
            page.drawText(line, {
                x: margins.marginX,
                y: yPosition - index * 20,
                size: 14,
                color: bodyColor,
                font,
            });
        });
    }
    drawMessageText(page, bodyColor, font, margins, yPosition) {
        const messageText = "We are proud of the student's hard work, dedication, and quick learning, which enabled them to complete assigned tasks on time.";
        const wrappedMessageText = (0, textWrapLineBreaker_1.default)(messageText, margins.maxWidth, font, 14);
        wrappedMessageText.forEach((line, index) => {
            page.drawText(line, {
                x: margins.marginX,
                y: yPosition - index * 20,
                size: 14,
                color: bodyColor,
                font,
            });
        });
    }
    drawFooter(page, titleColor, boldFont, margins, yPosition) {
        page.drawText("You did it, and we are proud of you!", {
            x: margins.marginX,
            y: yPosition,
            size: 16,
            color: titleColor,
            font: boldFont,
        });
    }
    savePdf(pdfDoc, studentName) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdfBytes = yield pdfDoc.save();
            const filePath = path_1.default.join(__dirname +
                `../../../certificates/${studentName}-certificate-${Date.now()}.pdf`);
            fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
            fs_1.default.writeFileSync(filePath, pdfBytes);
            return filePath;
        });
    }
    deployCertificate(pdfDoc, studentName) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdfBytes = yield pdfDoc.save();
            const filename = `${studentName}-certificate-${Date.now()}.pdf`;
            const pdfBuffer = Buffer.from(pdfBytes);
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
