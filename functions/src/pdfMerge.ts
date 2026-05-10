import {onCall, HttpsError} from "firebase-functions/v2/https";
import {PDFDocument} from "pdf-lib";

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com"];

export const mergeLabelsPdf = onCall(
  {cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {labelUrls} = request.data as {labelUrls: string[]};
    if (!Array.isArray(labelUrls) || labelUrls.length === 0) {
      throw new HttpsError("invalid-argument", "labelUrls must be a non-empty array");
    }

    const merged = await PDFDocument.create();

    for (const url of labelUrls) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpsError("internal", `Failed to fetch label PDF (status ${response.status})`);
      }
      const pdfBytes = await response.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const pageIndices = pdf.getPageIndices();
      const pages = await merged.copyPages(pdf, pageIndices);
      pages.forEach((page: import("pdf-lib").PDFPage) => merged.addPage(page));
    }

    const mergedBytes = await merged.save();
    return {pdf: Buffer.from(mergedBytes).toString("base64")};
  }
);
