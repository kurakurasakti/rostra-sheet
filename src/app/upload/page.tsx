"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Zap,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file type and size
    const validFiles = acceptedFiles.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB

      if (!isValidType) {
        setError("Invalid file type. Please upload PDF or Excel files only.");
      }
      if (!isValidSize) {
        setError("File too large. Maximum size is 25MB.");
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      if (email) {
        formData.append("email", email);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Call the upload API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const result = await response.json();
      setJobId(result.jobId);
      setUploadProgress(100);

      // Simulate processing
      setIsProcessing(true);
      setTimeout(() => {
        // Mock preview data - in real implementation, this would come from the preview API
        const mockPreview = [
          {
            date: "2023-01-01",
            description: "Grocery Store",
            amount: "-$125.50",
            category: "Food",
          },
          {
            date: "2023-01-02",
            description: "Electric Bill",
            amount: "-$85.00",
            category: "Utilities",
          },
          {
            date: "2023-01-03",
            description: "Salary Deposit",
            amount: "+$2500.00",
            category: "Income",
          },
          {
            date: "2023-01-04",
            description: "Gas Station",
            amount: "-$45.25",
            category: "Transportation",
          },
          {
            date: "2023-01-05",
            description: "Online Subscription",
            amount: "-$12.99",
            category: "Entertainment",
          },
        ];

        setPreviewData(mockPreview);
        setIsProcessing(false);
        setShowPaywall(true);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
    }
  };

  const handlePayment = () => {
    // In a real implementation, this would connect to Stripe/Xendit
    setShowPaywall(false);
    setShowSuccess(true);
  };

  const handleDownload = () => {
    // In a real implementation, this would call the download API
    // For now, just show a success message
    setShowSuccess(false);
    router.push("/");
  };

  const removeFile = () => {
    setFiles([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start to-gradient-end py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Upload Your Bank Statement
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert PDF bank statements to Excel in seconds with AI that
            understands your bank's format
          </p>
        </motion.div>

        {!jobId && !isProcessing && !showPaywall && !showSuccess && (
          <Card className="max-w-2xl mx-auto bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                <UploadCloud className="mr-2 h-6 w-6" />
                Upload Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input {...getInputProps()} />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    {isDragActive
                      ? "Drop the files here"
                      : "Drag & drop PDF or Excel files here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Max file size: 25MB
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </motion.div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-600">{error}</span>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">{files[0].name}</span>
                      <span className="text-sm text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email for notifications (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {isUploading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Conversion
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isUploading && (
          <Card className="max-w-2xl mx-auto bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border">
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                >
                  <Zap className="h-10 w-10 text-primary animate-pulse" />
                </motion.div>

                <h3 className="text-2xl font-bold">Processing Your File</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your bank statement...
                </p>

                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}% complete
                  </p>
                </div>

                <div className="flex justify-center space-x-8 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      File Size
                    </p>
                    <p className="font-bold text-primary">
                      {(files[0]?.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Estimated Time
                    </p>
                    <p className="font-bold text-primary">10 seconds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isProcessing && (
          <Card className="max-w-2xl mx-auto bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border">
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
                >
                  <Sparkles className="h-10 w-10 text-primary" />
                </motion.div>

                <h3 className="text-2xl font-bold">AI Processing</h3>
                <p className="text-muted-foreground">
                  Extracting transactions and formatting data...
                </p>

                <div className="flex justify-center space-x-8 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Transactions Found
                    </p>
                    <p className="font-bold text-primary">142</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Confidence Score
                    </p>
                    <p className="font-bold text-primary">98%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showPaywall && (
          <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
            <DialogContent className="sm:max-w-md bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  Unlock Full File
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your file is ready! Unlock all 142 transactions.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="space-y-2 text-sm">
                    {previewData.slice(0, 5).map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-2 py-1 border-b border-muted/20"
                      >
                        <span className="text-muted-foreground">
                          {row.date}
                        </span>
                        <span className="col-span-2">{row.description}</span>
                        <span
                          className={
                            row.amount.startsWith("-")
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {row.amount}
                        </span>
                      </div>
                    ))}
                    <div className="text-center py-4 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Rows 6-142 blurred
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay to unlock complete data
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="text-center p-4 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                    <div className="text-3xl font-bold text-primary mb-2">
                      $5
                    </div>
                    <div className="text-sm text-muted-foreground">Global</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Unlimited files
                    </div>
                  </Card>
                  <Card className="text-center p-4 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                    <div className="text-3xl font-bold text-primary mb-2">
                      Rp 40k
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Indonesia
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      WhatsApp delivery
                    </div>
                  </Card>
                </div>

                <Badge variant="secondary" className="w-full py-3 text-sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  98% accuracy guaranteed
                </Badge>
              </div>

              <DialogFooter>
                <Button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Unlock for $5
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {showSuccess && (
          <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
            <DialogContent className="sm:max-w-md bg-glass-bg backdrop-blur-[var(--glass-blur)] border border-glass-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  File Ready!
                </DialogTitle>
                <DialogDescription className="text-center">
                  Your Excel file is ready to download
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                  <Button variant="outline" className="h-12">
                    <FileText className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>

                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-2">Template Continuity</h4>
                      <p className="text-sm text-muted-foreground">
                        Save this template! Next month, upload this Excel + new
                        PDF to auto-fill categories.
                      </p>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Finish & Return Home
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
