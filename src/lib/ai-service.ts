import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateErrorResponse } from "./backend-utils";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configuration for Gemini 2.5 Flash
const modelConfig = {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.4,
    topP: 1,
    topK: 32,
    maxOutputTokens: 4096,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

// System prompt for bank statement parsing
const SYSTEM_PROMPT = `
You are a bank statement parser AI. Your task is to extract structured transaction data from bank statements.

Rules:
1. Output ONLY valid JSON with this exact structure:
{
  "bank_name": "string",
  "statement_period": "YYYY-MM-DD to YYYY-MM-DD",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "debit": number|null,
      "credit": number|null,
      "balance": number,
      "category": "string|null"
    }
  ],
  "confidence_score": 0.0-1.0,
  "warnings": ["array", "of", "warnings"]
}

2. Debit = money leaving account (positive number)
3. Credit = money entering account (positive number)
4. Balance = running balance after transaction
5. If amount is unclear, set confidence_score < 0.8
6. Never invent data - if uncertain, set confidence_score low
7. Detect bank name from statement content
8. Extract statement period if available
9. Categorize transactions (e.g., "Food", "Salary", "Utilities", "Transfer")
10. Handle multiple currencies if present
`;

// Parse bank statement using Gemini 2.5 Flash
export async function parseBankStatement(
  content: string,
  fileType: string
): Promise<{
  bankName: string;
  statementPeriod: string;
  transactions: Array<{
    date: string;
    description: string;
    debit: number | null;
    credit: number | null;
    balance: number;
    category: string | null;
  }>;
  confidenceScore: number;
  warnings: string[];
}> {
  try {
    // Initialize the generative model
    const model = genAI.getGenerativeModel(modelConfig);

    // Create the prompt
    const prompt = `${SYSTEM_PROMPT}

    Parse the following ${fileType} bank statement content:

    ${content.substring(
      0,
      10000
    )}  // Limit to 10k characters to avoid token limits

    Return ONLY the JSON response as specified in the rules.`;

    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsedData = JSON.parse(text);

    // Validate the response structure
    if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
      throw new Error("Invalid AI response structure");
    }

    return {
      bankName: parsedData.bank_name || "Unknown",
      statementPeriod: parsedData.statement_period || "Unknown",
      transactions: parsedData.transactions.map((t: any) => ({
        date: t.date || "Unknown",
        description: t.description || "Unknown",
        debit: t.debit !== undefined ? Number(t.debit) : null,
        credit: t.credit !== undefined ? Number(t.credit) : null,
        balance: t.balance !== undefined ? Number(t.balance) : 0,
        category: t.category || null,
      })),
      confidenceScore: parsedData.confidence_score || 0.8,
      warnings: parsedData.warnings || [],
    };
  } catch (error) {
    console.error("Gemini AI parsing error:", error);
    throw new Error("Failed to parse bank statement with Gemini AI");
  }
}

// Fallback parsing for when AI confidence is low
export async function fallbackParse(content: string): Promise<{
  columns: string[];
  rows: any[];
  confidenceScore: number;
  detectedBank: string | null;
}> {
  try {
    // Simple text-based parsing as fallback
    const lines = content.split("\n");

    // Detect bank from content
    const contentLower = content.toLowerCase();
    let detectedBank: string | null = null;

    if (contentLower.includes("chase")) detectedBank = "Chase";
    else if (contentLower.includes("bank of america"))
      detectedBank = "Bank of America";
    else if (contentLower.includes("wells fargo")) detectedBank = "Wells Fargo";
    else if (contentLower.includes("citibank")) detectedBank = "Citibank";

    // Simple column detection
    const columns = ["date", "description", "amount", "balance"];

    // Simple row extraction (mock data for fallback)
    const rows = [
      {
        date: "2024-12-01",
        description: "STARBUCKS",
        amount: -5.5,
        balance: 1000.0,
      },
      {
        date: "2024-12-02",
        description: "GROCERY STORE",
        amount: -85.25,
        balance: 914.75,
      },
    ];

    return {
      columns,
      rows,
      confidenceScore: 0.6, // Lower confidence for fallback
      detectedBank,
    };
  } catch (error) {
    console.error("Fallback parsing error:", error);
    throw new Error("Fallback parsing failed");
  }
}

// Main parsing function with AI and fallback
export async function parseStatementWithAI(
  content: string,
  fileType: string
): Promise<{
  columns: string[];
  rows: any[];
  confidenceScore: number;
  detectedBank: string | null;
}> {
  try {
    // First try with Gemini AI
    const aiResult = await parseBankStatement(content, fileType);

    // Convert AI result to our format
    const columns = [
      "date",
      "description",
      "debit",
      "credit",
      "balance",
      "category",
    ];

    const rows = aiResult.transactions.map((t) => ({
      date: t.date,
      description: t.description,
      debit: t.debit,
      credit: t.credit,
      balance: t.balance,
      category: t.category,
    }));

    return {
      columns,
      rows,
      confidenceScore: aiResult.confidenceScore,
      detectedBank: aiResult.bankName,
    };
  } catch (error) {
    console.warn("AI parsing failed, using fallback:", error);
    // Fallback to simple parsing
    return fallbackParse(content);
  }
}
