import { NextResponse } from "next/server";
import {
  generateJobId,
  validateFileType,
  createJobRecord,
  generateErrorResponse,
  MAX_FILE_SIZE,
} from "@/lib/backend-utils";
import { Queue, Worker } from "bullmq";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Create processing queue
const processingQueue = new Queue("statement-processing", {
  connection: redisClient as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Process file upload
export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        generateErrorResponse("NO_FILE", "No file provided"),
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        generateErrorResponse("FILE_TOO_LARGE", "File exceeds 25MB limit", {
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        }),
        { status: 413 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        generateErrorResponse("INVALID_FILE_TYPE", "Invalid file type", {
          validTypes: [
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ],
          receivedType: file.type,
        }),
        { status: 400 }
      );
    }

    // Generate unique job ID
    const jobId = generateJobId();

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Create job record in database
    await createJobRecord(jobId, file.type);

    // Add job to processing queue
    await processingQueue.add(jobId, {
      jobId,
      fileType: file.type,
      fileBuffer: fileBuffer.toString("base64"),
      fileName: file.name,
      userEmail: email || null,
      createdAt: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json(
      {
        jobId,
        status: "processing",
        estimatedTime: 15,
        previewUrl: `/api/preview/${jobId}`,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("File upload error:", error);

    return NextResponse.json(
      generateErrorResponse("INTERNAL_ERROR", "Failed to process file upload"),
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
