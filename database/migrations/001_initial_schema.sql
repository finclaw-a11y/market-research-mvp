-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_uploads table
CREATE TABLE IF NOT EXISTS data_uploads (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_url VARCHAR(500),
    row_count INTEGER DEFAULT 0,
    columns JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploaded_data table
CREATE TABLE IF NOT EXISTS uploaded_data (
    id VARCHAR(255) PRIMARY KEY,
    upload_id VARCHAR(255) NOT NULL REFERENCES data_uploads(id) ON DELETE CASCADE,
    raw_data JSONB,
    processed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create insight_analysis table
CREATE TABLE IF NOT EXISTS insight_analysis (
    id VARCHAR(255) PRIMARY KEY,
    upload_id VARCHAR(255) NOT NULL REFERENCES data_uploads(id) ON DELETE CASCADE,
    insights_json JSONB,
    summary TEXT,
    key_findings JSONB,
    recommendations JSONB,
    api_tokens_used INTEGER DEFAULT 0,
    api_cost DECIMAL(10, 4) DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'free',
    price_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    cancel_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_data_uploads_user_id ON data_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_data_upload_id ON uploaded_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_insight_analysis_upload_id ON insight_analysis(upload_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
