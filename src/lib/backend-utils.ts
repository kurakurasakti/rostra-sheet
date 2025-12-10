import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { PDFDocument } from "pdf-lib";
import * as pdfParse from "pdf-parse";
import * as ExcelJS from "exceljs";
import { createHash } from "crypto";
import { z } from "zod";
import { Buffer as NodeBuffer } from "buffer";

// Type definitions
type ProcessingJob = {
  job_id: string;
  status: string;
  file_type: string;
  preview_data?: any;
  confidence_score?: number;
  created_at: string;
};

type Template = {
  id: string;
  template_hash: string;
  column_structure: any;
  created_at: string;
};

type Payment = {
  id: string;
  job_id: string;
  email: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
};

type ExcelColumn = {
  name: string;
  key: string;
  width?: number;
};

type ExcelRow = Record<string, any>;

type PreviewData = {
  columns?: ExcelColumn[];
  rows?: ExcelRow[];
  confidenceScore?: number;
  fileType?: string;
  detectedBank?: string | null;
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration constants
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "26214400"); // 25MB
export const PROCESSING_TIMEOUT = parseInt(
  process.env.PROCESSING_TIMEOUT || "60"
); // 60 seconds
export const AI_CONFIDENCE_THRESHOLD = parseFloat(
  process.env.AI_CONFIDENCE_THRESHOLD || "0.85"
);

// File type validation
export const VALID_FILE_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

// Job status types
export const JOB_STATUSES = [
  "uploaded",
  "processing",
  "completed",
  "failed",
] as const;

// Generate unique job ID
export function generateJobId(): string {
  return `job_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

// Validate file type
export function validateFileType(fileType: string): boolean {
  return (VALID_FILE_TYPES as readonly string[]).includes(fileType);
}

// Generate file hash
export function generateFileHash(buffer: NodeBuffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

// Parse PDF file
export async function parsePDF(buffer: NodeBuffer): Promise<{
  text: string;
  metadata: Record<string, any>;
}> {
  try {
    // Parse text from PDF
    const pdfData = await (pdfParse as any)(buffer);

    // Extract metadata using pdf-lib
    const pdfDoc = await PDFDocument.load(buffer);
    const metadata: Record<string, any> = {
      title: pdfDoc.getTitle(),
      author: pdfDoc.getAuthor(),
      subject: pdfDoc.getSubject(),
      creator: pdfDoc.getCreator(),
      producer: pdfDoc.getProducer(),
      creationDate: pdfDoc.getCreationDate(),
      modificationDate: pdfDoc.getModificationDate(),
      pageCount: pdfDoc.getPageCount(),
    };

    return {
      text: pdfData.text,
      metadata,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

// Parse Excel file
export async function parseExcel(buffer: NodeBuffer): Promise<{
  worksheetName: string;
  columns: ExcelColumn[];
  rows: ExcelRow[];
  metadata: Record<string, any>;
}> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    // Get first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No worksheets found in Excel file");
    }

    // Convert to JSON
    const rows: ExcelRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData: ExcelRow = {};
      row.eachCell((cell, colNumber) => {
        rowData[`col_${colNumber}`] = cell.value;
      });
      rows.push(rowData);
    });

    // Get column headers
    const headers = worksheet.getRow(1).values as string[];
    const columns = headers.map((header, index) => ({
      name: header || `col_${index + 1}`,
      key: `col_${index + 1}`,
    }));

    return {
      worksheetName: worksheet.name,
      columns,
      rows,
      metadata: {
        worksheetCount: workbook.worksheets.length,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
      },
    };
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error("Failed to parse Excel file");
  }
}

// Generate Excel file from JSON data
export async function generateExcel(
  data: ExcelRow[],
  columns: ExcelColumn[]
): Promise<NodeBuffer> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Statement");

    // Add columns
    worksheet.columns = columns.map((col) => ({
      header: col.name,
      key: col.key,
      width: 20,
    }));

    // Add rows
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF22C55E" }, // Green color
    };

    // Generate buffer
    const buffer = (await workbook.xlsx.writeBuffer()) as NodeBuffer;
    return buffer;
  } catch (error) {
    console.error("Excel generation error:", error);
    throw new Error("Failed to generate Excel file");
  }
}

// Create job record in database
export async function createJobRecord(
  jobId: string,
  fileType: string,
  status: string = "uploaded"
) {
  const { error } = await supabase.from("processing_jobs").insert({
    job_id: jobId,
    status,
    file_type: fileType,
  });

  if (error) {
    console.error("Failed to create job record:", error);
    throw new Error("Failed to create job record");
  }

  return { success: true };
}

// Update job status
export async function updateJobStatus(
  jobId: string,
  status: string,
  data?: { previewData?: any; confidenceScore?: number }
) {
  const updateData: Record<string, any> = { status };

  if (data) {
    updateData.preview_data = data.previewData;
    updateData.confidence_score = data.confidenceScore;
  }

  const { error } = await supabase
    .from("processing_jobs")
    .update(updateData)
    .eq("job_id", jobId);

  if (error) {
    console.error("Failed to update job status:", error);
    throw new Error("Failed to update job status");
  }

  return { success: true };
}

// Get job record
export async function getJobRecord(jobId: string) {
  const { data, error } = await supabase
    .from("processing_jobs")
    .select("*")
    .eq("job_id", jobId)
    .single();

  if (error) {
    console.error("Failed to get job record:", error);
    throw new Error("Job not found");
  }

  return data;
}

// Validate email format
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

// Generate preview response
export function generatePreviewResponse(
  jobId: string,
  data: PreviewData,
  status: string = "completed"
) {
  return {
    jobId,
    status,
    preview: {
      columns: data.columns || [],
      rows: data.rows ? data.rows.slice(0, 5) : [],
      confidenceScore: data.confidenceScore || 0,
      fileType: data.fileType,
      detectedBank: data.detectedBank || null,
    },
    unlockUrl: `/checkout?jobId=${jobId}`,
  };
}

// Error response generator
export function generateErrorResponse(
  errorCode: string,
  message: string,
  details?: Record<string, any>
) {
  return {
    error: errorCode,
    message,
    ...(details && { details }),
  };
}

// Payment provider routing
export function getPaymentProvider(currency: string): "stripe" | "xendit" {
  // If currency is IDR, use Xendit
  if (currency === "idr") return "xendit";

  // Default to Stripe for other currencies
  return "stripe";
}

// Pricing configuration
export const PRICING = {
  usd: {
    single: 5.0,
    monthly: 7.0,
  },
  idr: {
    single: 40000,
    monthly: 50000,
  },
};

// Convert buffer to stream
export function bufferToStream(buffer: NodeBuffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
