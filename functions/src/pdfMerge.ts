import {onCall, HttpsError} from "firebase-functions/v2/https";
import {PDFDocument} from "pdf-lib";
import {isAdmin} from "./config.js";

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com", "https://momollie.me"];
const SHIPPO_URL_PREFIX = "https://shippo-delivery-us-east.s3.amazonaws.com/";
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export const mergeLabelsPdf = onCall(
  {cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
    }

    const {labelUrls} = request.data as {labelUrls: string[]};
    if (!Array.isArray(labelUrls) || labelUrls.length === 0) {
      throw new HttpsError("invalid-argument", "labelUrls must be a non-empty array");
    }

    const merged = await PDFDocument.create();

    for (const url of labelUrls) {
      if (!url.startsWith(SHIPPO_URL_PREFIX) && !url.startsWith("https://shippo-delivery.s3.amazonaws.com/")) {
        throw new HttpsError("invalid-argument", "Invalid label URL");
      }
      const response = await fetch(url, {signal: AbortSignal.timeout(10000)});
      if (!response.ok) {
        throw new HttpsError("internal", `Failed to fetch label PDF (status ${response.status})`);
      }
      const pdfBytes = await response.arrayBuffer();
      if (pdfBytes.byteLength > MAX_PDF_BYTES) {
        throw new HttpsError("invalid-argument", "Label PDF exceeds size limit");
      }
      const pdf = await PDFDocument.load(pdfBytes);
      const pageIndices = pdf.getPageIndices();
      const pages = await merged.copyPages(pdf, pageIndices);
      pages.forEach((page: import("pdf-lib").PDFPage) => merged.addPage(page));
    }

    const mergedBytes = await merged.save();
    return {pdf: Buffer.from(mergedBytes).toString("base64")};
  }
);
