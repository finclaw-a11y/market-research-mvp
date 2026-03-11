from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from database import get_db
from models import DataUpload, User, UploadedData, UploadStatus
from services.csv_processor import CSVProcessor
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

class UploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    row_count: int
    columns: list
    created_at: datetime
    
    class Config:
        from_attributes = True

class UploadListResponse(BaseModel):
    uploads: list[UploadResponse]
    total: int

@router.post("/csv/{user_id}")
async def upload_csv(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file for analysis.
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Read file content
        content = await file.read()
        
        # Validate file
        is_valid, error_msg = CSVProcessor.validate_file(content, file.filename)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Parse CSV
        df, error = CSVProcessor.parse_csv(content)
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        # Clean data
        df_cleaned = CSVProcessor.clean_data(df)
        
        # Create upload record
        upload_id = str(uuid.uuid4())
        upload = DataUpload(
            id=upload_id,
            user_id=user_id,
            filename=file.filename,
            status=UploadStatus.COMPLETED.value,
            row_count=len(df_cleaned),
            columns=df_cleaned.columns.tolist()
        )
        db.add(upload)
        
        # Store data
        uploaded_data = UploadedData(
            id=str(uuid.uuid4()),
            upload_id=upload_id,
            raw_data=CSVProcessor.get_preview(df),
            processed_data=CSVProcessor.to_dict_list(df_cleaned[:100])  # First 100 rows
        )
        db.add(uploaded_data)
        
        db.commit()
        db.refresh(upload)
        
        logger.info(f"File uploaded: {upload_id} by user {user_id}")
        
        return {
            "id": upload.id,
            "filename": upload.filename,
            "status": upload.status,
            "row_count": upload.row_count,
            "columns": upload.columns,
            "preview": CSVProcessor.get_preview(df_cleaned),
            "message": "File uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/list/{user_id}", response_model=UploadListResponse)
async def list_uploads(
    user_id: str,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    List all uploads for a user.
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get uploads
        uploads = db.query(DataUpload).filter(
            DataUpload.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        total = db.query(DataUpload).filter(
            DataUpload.user_id == user_id
        ).count()
        
        return {
            "uploads": uploads,
            "total": total
        }
        
    except Exception as e:
        logger.error(f"List uploads error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/detail/{upload_id}")
async def get_upload_detail(
    upload_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about an upload.
    """
    try:
        upload = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        # Get uploaded data
        uploaded_data = db.query(UploadedData).filter(
            UploadedData.upload_id == upload_id
        ).first()
        
        return {
            "id": upload.id,
            "filename": upload.filename,
            "status": upload.status,
            "row_count": upload.row_count,
            "columns": upload.columns,
            "created_at": upload.created_at,
            "preview": uploaded_data.raw_data if uploaded_data else None,
            "statistics": CSVProcessor.get_statistics(
                pd.DataFrame(uploaded_data.processed_data) if uploaded_data and uploaded_data.processed_data else pd.DataFrame()
            ) if uploaded_data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get upload detail error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{upload_id}")
async def delete_upload(
    upload_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete an upload and associated data.
    """
    try:
        upload = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        # Verify ownership
        if upload.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Delete related data
        db.query(UploadedData).filter(UploadedData.upload_id == upload_id).delete()
        db.query(upload).delete()
        
        db.commit()
        
        logger.info(f"Upload deleted: {upload_id}")
        
        return {"message": "Upload deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Import pandas here to avoid circular imports
import pandas as pd
