import { ICertificate } from "../interfaces/certificate.interface";
import { PDFDocument, PDFFont, PDFPage, RGB, rgb } from "pdf-lib";
import textWrapLineBreaker from "../utils/textWrapLineBreaker";
import fs from "fs";
import path from "path";
import { FileUploadMiddleware } from "../middlewares/fileUploaderMiddleware";

class Service {
  public async createCertificate(
    data: ICertificate,
    shouldDeploy: boolean = false
  ): Promise<string> {
    const { studentName, courseName, technologies } = data;
    const pdfDoc = await PDFDocument.create();
    const page = this.createPage(pdfDoc);

    const colors = {
      titleColor: rgb(0, 0, 0),
      bodyColor: rgb(0.1, 0.1, 0.1),
      purpleColor: rgb(128 / 255, 0 / 255, 128 / 255),
    };

    const fonts = {
      font: await pdfDoc.embedFont("Helvetica"),
      boldFont: await pdfDoc.embedFont("Helvetica-Bold"),
    };

    const margins = { marginX: 50, maxWidth: 792 - 50 * 2 };
    const yPositions = {
      title: 512,
      studentName: 462,
      courseCompletion: 412,
      skills: 352,
      message: 282,
      footer: 200,
    };

    this.drawBorder(page, colors.purpleColor);
    this.drawTitleAndStudentName(
      page,
      studentName,
      colors,
      fonts,
      margins,
      yPositions
    );
    this.drawCourseCompletion(
      page,
      courseName,
      colors.bodyColor,
      fonts,
      margins,
      yPositions.courseCompletion
    );
    this.drawSkillsText(
      page,
      technologies,
      colors.bodyColor,
      fonts.font,
      margins,
      yPositions.skills
    );
    this.drawMessageText(
      page,
      colors.bodyColor,
      fonts.font,
      margins,
      yPositions.message
    );
    this.drawFooter(
      page,
      colors.titleColor,
      fonts.boldFont,
      margins,
      yPositions.footer
    );

    await this.drawLogo(pdfDoc, page);

    return shouldDeploy
      ? this.deployCertificate(pdfDoc, studentName)
      : this.savePdf(pdfDoc, studentName);
  }

  private createPage(pdfDoc: PDFDocument) {
    const pageWidth = 792;
    const pageHeight = 612;
    return pdfDoc.addPage([pageWidth, pageHeight]);
  }

  private drawBorder(page: PDFPage, color: RGB) {
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

  private drawTitleAndStudentName(
    page: PDFPage,
    studentName: string,
    colors: { titleColor: RGB; bodyColor: RGB; purpleColor: RGB },
    fonts: { font: PDFFont; boldFont: PDFFont },
    margins: { marginX: number; maxWidth: number },
    yPositions: { title: number; studentName: number }
  ) {
    page.drawText("Certificate of Completion", {
      x:
        margins.marginX +
        margins.maxWidth / 2 -
        fonts.boldFont.widthOfTextAtSize("Certificate of Completion", 24) / 2,
      y: yPositions.title,
      size: 24,
      color: colors.purpleColor,
      font: fonts.boldFont,
    });

    page.drawText(studentName, {
      x:
        margins.marginX +
        margins.maxWidth / 2 -
        fonts.boldFont.widthOfTextAtSize(studentName, 22) / 2,
      y: yPositions.studentName,
      size: 22,
      color: colors.purpleColor,
      font: fonts.boldFont,
    });
  }

  private drawCourseCompletion(
    page: PDFPage,
    courseName: string,
    bodyColor: RGB,
    fonts: { font: PDFFont; boldFont: PDFFont },
    margins: { marginX: number; maxWidth: number },
    yPosition: number
  ) {
    const courseIntroText = "for the successful completion of the ";
    const courseIntroWidth = fonts.font.widthOfTextAtSize(courseIntroText, 16);
    const wrappedCourseName = textWrapLineBreaker(
      courseName,
      margins.maxWidth - courseIntroWidth,
      fonts.boldFont,
      16
    );

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

    const lastLineWidth =
      wrappedCourseName.length > 0
        ? fonts.boldFont.widthOfTextAtSize(
            wrappedCourseName[wrappedCourseName.length - 1],
            16
          )
        : 0;
    const courseXPosition =
      margins.marginX + courseIntroWidth + lastLineWidth + 5;

    page.drawText("course", {
      x: courseXPosition,
      y: yPosition - (wrappedCourseName.length - 1) * 20,
      size: 16,
      color: bodyColor,
      font: fonts.font,
    });
  }

  private drawSkillsText(
    page: PDFPage,
    technologies: string[],
    bodyColor: RGB,
    font: PDFFont,
    margins: { marginX: number; maxWidth: number },
    yPosition: number
  ) {
    const skillsText = `with a rigorous amount of ${technologies.join(
      ", "
    )} and applied these skills to build several projects.`;
    const wrappedSkillsText = textWrapLineBreaker(
      skillsText,
      margins.maxWidth,
      font,
      14
    );

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

  private drawMessageText(
    page: PDFPage,
    bodyColor: RGB,
    font: PDFFont,
    margins: { marginX: number; maxWidth: number },
    yPosition: number
  ) {
    const messageText =
      "We are proud of the student's hard work, dedication, and quick learning, which enabled them to complete assigned tasks on time.";
    const wrappedMessageText = textWrapLineBreaker(
      messageText,
      margins.maxWidth,
      font,
      14
    );

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

  private drawFooter(
    page: PDFPage,
    titleColor: RGB,
    boldFont: PDFFont,
    margins: { marginX: number },
    yPosition: number
  ) {
    page.drawText("You did it, and we are proud of you!", {
      x: margins.marginX,
      y: yPosition,
      size: 16,
      color: titleColor,
      font: boldFont,
    });
  }

  private async drawLogo(pdfDoc: PDFDocument, page: PDFPage) {
    const logoUrl =
      "https://firebasestorage.googleapis.com/v0/b/up-skillium.appspot.com/o/up-skillium%2Fassets%2Fupskillium-certificate-logo.png?alt=media&token=c66d6735-8889-483b-937e-297484c8b4b2";
    const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const logoWidth = 200;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    const bottomRightMargin = 25;

    page.drawImage(logoImage, {
      x: page.getWidth() - logoWidth - bottomRightMargin,
      y: bottomRightMargin,
      width: logoWidth,
      height: logoHeight,
    });
  }

  private async savePdf(pdfDoc: PDFDocument, studentName: string) {
    const pdfBytes = await pdfDoc.save();
    const filePath = path.join(
      __dirname +
        `../../../certificates/${studentName}-certificate-${Date.now()}.pdf`
    );
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, pdfBytes);
    return filePath;
  }

  private async deployCertificate(
    pdfDoc: PDFDocument,
    studentName: string
  ): Promise<string> {
    const pdfBytes = await pdfDoc.save();
    const filename = `${studentName}-certificate-${Date.now()}.pdf`;
    const pdfBuffer = Buffer.from(pdfBytes);

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
