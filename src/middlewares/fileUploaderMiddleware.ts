import { firebaseBucket } from "../config/firebase";

const rootFolder = "PDF-Generator";

class FileUploader {
  async uploadGeneratedPdf(
    folderName: string,
    buffer: Buffer,
    filename: string
  ) {
    const filePath = `${rootFolder}/${folderName}/${Date.now()}_${filename}`;
    const blob = firebaseBucket.file(filePath);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: "application/pdf",
    });

    return new Promise<string>((resolve, reject) => {
      blobStream.on("error", (err) => {
        reject(err);
      });

      blobStream.on("finish", async () => {
        try {
          const [url] = await blob.getSignedUrl({
            action: "read",
            expires: "01-01-2030",
          });
          resolve(url);
        } catch (err) {
          reject(err);
        }
      });

      blobStream.end(buffer);
    });
  }
}

export const FileUploadMiddleware = new FileUploader();
