-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- processing_jobs table (auto-deleted after 1 hour)
CREATE TABLE IF NOT EXISTS processing_jobs (
  job_id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
  preview_data JSONB,
  confidence_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for job access
CREATE POLICY "Jobs can be accessed by anyone for 1 hour"
ON processing_jobs
FOR SELECT
USING (created_at > NOW() - INTERVAL '1 hour');

-- templates table (stores only hashes, not raw files)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_hash TEXT UNIQUE NOT NULL,
  column_structure JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- payments table (anonymized after 90 days)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT REFERENCES processing_jobs(job_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('usd', 'idr')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'xendit')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create index for job_id lookup
CREATE INDEX IF NOT EXISTS idx_payments_job_id ON payments(job_id);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);

-- Create index for status lookup
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create index for job created_at
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at);

-- Create index for job status
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
