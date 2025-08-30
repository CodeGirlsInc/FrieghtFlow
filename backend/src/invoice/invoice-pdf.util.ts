import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Invoice } from "./invoice.entity";

const INVOICES_DIR = path.join(process.cwd(), "invoices");

export function ensureInvoicesDir() {
  if (!fs.existsSync(INVOICES_DIR)) {
    fs.mkdirSync(INVOICES_DIR, { recursive: true });
  }
}

export async function generateInvoicePdf(invoice: Invoice): Promise<string> {
  ensureInvoicesDir();
  const filename = `${invoice.id}.pdf`;
  const filepath = path.join(INVOICES_DIR, filename);
  const writeStream = fs.createWriteStream(filepath);

  return new Promise<string>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(writeStream);

    // Header
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice ID: ${invoice.id}`);
    doc.text(`Customer ID: ${invoice.customerId}`);
    doc.text(`Amount: ${invoice.amount.toFixed(2)} ${invoice.currency}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toISOString().slice(0, 10)}`);
    doc.text(`Status: ${invoice.paymentStatus}`);
    doc.moveDown();

    doc.text("Description:");
    doc.text(`Generated for freight services.`, { indent: 10 });
    doc.moveDown();

    doc.text("This invoice was generated automatically by the system.");
    doc.end();

    writeStream.on("finish", () => {
      // return public URL path for served static files (see app static serving below)
      const urlPath = `/invoices/${filename}`;
      resolve(urlPath);
    });

    writeStream.on("error", (err) => reject(err));
  });
}
