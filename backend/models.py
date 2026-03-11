from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base
import enum

class SubscriptionStatus(str, enum.Enum):
    FREE = "free"
    TRIAL = "trial"
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class UploadStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)  # Supabase UUID
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    subscription_status = Column(String, default=SubscriptionStatus.FREE.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    uploads = relationship("DataUpload", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")

class DataUpload(Base):
    __tablename__ = "data_uploads"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default=UploadStatus.PENDING.value)
    file_url = Column(String, nullable=True)  # S3 or similar
    row_count = Column(Integer, default=0)
    columns = Column(JSON, nullable=True)  # List of column names
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="uploads")
    uploaded_data = relationship("UploadedData", back_populates="upload", cascade="all, delete-orphan")
    insights = relationship("InsightAnalysis", back_populates="upload", cascade="all, delete-orphan")

class UploadedData(Base):
    __tablename__ = "uploaded_data"
    
    id = Column(String, primary_key=True, index=True)
    upload_id = Column(String, ForeignKey("data_uploads.id"), nullable=False, index=True)
    raw_data = Column(JSON, nullable=True)  # First 100 rows for preview
    processed_data = Column(JSON, nullable=True)  # Cleaned/validated data
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    upload = relationship("DataUpload", back_populates="uploaded_data")

class InsightAnalysis(Base):
    __tablename__ = "insight_analysis"
    
    id = Column(String, primary_key=True, index=True)
    upload_id = Column(String, ForeignKey("data_uploads.id"), nullable=False, index=True)
    insights_json = Column(JSON, nullable=True)  # Claude-generated insights
    summary = Column(Text, nullable=True)
    key_findings = Column(JSON, nullable=True)  # List of key findings
    recommendations = Column(JSON, nullable=True)  # List of recommendations
    api_tokens_used = Column(Integer, default=0)
    api_cost = Column(Float, default=0.0)  # USD cost
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    upload = relationship("DataUpload", back_populates="insights")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    stripe_customer_id = Column(String, unique=True, nullable=True)
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    status = Column(String, default=SubscriptionStatus.FREE.value)
    price_id = Column(String, nullable=True)  # Stripe price ID
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    cancel_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="subscription")
