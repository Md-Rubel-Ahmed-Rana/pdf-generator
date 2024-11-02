import { ICertificate } from "../interfaces/certificate.interface";
import { PDFDocument, rgb } from "pdf-lib";
import { FileUploadMiddleware } from "../middlewares/fileUploaderMiddleware";

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);

    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

class Service {
  async createCertificate(data: ICertificate) {
    const { studentName, courseName, technologies } = data;
    const pdfDoc = await PDFDocument.create();

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const titleColor = rgb(0, 0, 0);
    const subtitleColor = rgb(0.2, 0.2, 0.2);
    const bodyColor = rgb(0.1, 0.1, 0.1);

    const font = await pdfDoc.embedFont("Helvetica");
    const boldFont = await pdfDoc.embedFont("Helvetica-Bold");

    const marginX = 50;
    const maxWidth = pageWidth - marginX * 2;

    page.drawText("Certificate of Completion", {
      x:
        marginX +
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

    const skillsText = `with a rigorous amount of ${technologies.join(
      ", "
    )} and applied these skills to build several projects.`;
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

    const messageText =
      "We are proud of the student's hard work, dedication, and quick learning, which enabled them to complete assigned tasks on time.";
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

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const filename = `${studentName}-certificate-${Date.now()}.pdf`;
    try {
      const fileUrl = await FileUploadMiddleware.uploadGeneratedPdf(
        "certificates",
        pdfBuffer,
        filename
      );
      return fileUrl;
    } catch (error) {
      console.error("Error uploading certificate:", error);
      throw new Error("Certificate upload failed.");
    }
  }
}

export const CertificateService = new Service();
