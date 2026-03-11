from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from database import get_db
from models import InsightAnalysis, DataUpload, UploadedData
from services.claude_insights import ClaudeInsightGenerator
import uuid
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/insights", tags=["insights"])

class InsightResponse(BaseModel):
    id: str
    upload_id: str
    summary: str
    key_findings: list
    recommendations: list
    api_tokens_used: int
    api_cost: float
    generated_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/generate/{upload_id}")
async def generate_insights(
    upload_id: str,
    user_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate AI insights for an uploaded dataset.
    This may run in background for large datasets.
    """
    try:
        # Verify upload exists and belongs to user
        upload = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        if upload.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Check if insights already exist
        existing = db.query(InsightAnalysis).filter(
            InsightAnalysis.upload_id == upload_id
        ).first()
        
        if existing:
            return {
                "id": existing.id,
                "message": "Insights already generated for this upload",
                "insights": existing
            }
        
        # Get uploaded data
        uploaded_data = db.query(UploadedData).filter(
            UploadedData.upload_id == upload_id
        ).first()
        
        if not uploaded_data or not uploaded_data.processed_data:
            raise HTTPException(status_code=400, detail="No data available for analysis")
        
        # Generate insights
        insight_generator = ClaudeInsightGenerator()
        
        try:
            insights, tokens, cost = insight_generator.generate_insights(
                uploaded_data.processed_data,
                upload.filename
            )
        except Exception as e:
            logger.error(f"Insight generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")
        
        # Store insights
        insight_id = str(uuid.uuid4())
        analysis = InsightAnalysis(
            id=insight_id,
            upload_id=upload_id,
            insights_json=insights,
            summary=insights.get("summary", ""),
            key_findings=insights.get("key_findings", []),
            recommendations=insights.get("recommendations", []),
            api_tokens_used=tokens,
            api_cost=cost
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        logger.info(f"Insights generated: {insight_id} for upload {upload_id}")
        
        return {
            "id": analysis.id,
            "message": "Insights generated successfully",
            "insights": {
                "summary": analysis.summary,
                "key_findings": analysis.key_findings,
                "recommendations": analysis.recommendations,
                "trends": insights.get("trends", []),
                "opportunities": insights.get("opportunities", []),
                "api_tokens_used": analysis.api_tokens_used,
                "api_cost": analysis.api_cost
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Insight generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/detail/{insight_id}", response_model=InsightResponse)
async def get_insight(insight_id: str, db: Session = Depends(get_db)):
    """
    Get detailed insights for a dataset.
    """
    try:
        insight = db.query(InsightAnalysis).filter(
            InsightAnalysis.id == insight_id
        ).first()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        return insight
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get insight error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-upload/{upload_id}")
async def get_insights_by_upload(
    upload_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all insights for a specific upload.
    """
    try:
        # Verify upload ownership
        upload = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        if upload.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Get insights
        insights = db.query(InsightAnalysis).filter(
            InsightAnalysis.upload_id == upload_id
        ).all()
        
        return {
            "upload_id": upload_id,
            "insights": insights,
            "total": len(insights)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get insights by upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/{insight_id}")
async def export_insights(
    insight_id: str,
    format: str = "json",
    db: Session = Depends(get_db)
):
    """
    Export insights in various formats (JSON, CSV, PDF).
    """
    try:
        insight = db.query(InsightAnalysis).filter(
            InsightAnalysis.id == insight_id
        ).first()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        if format == "json":
            return {
                "format": "json",
                "data": {
                    "summary": insight.summary,
                    "key_findings": insight.key_findings,
                    "recommendations": insight.recommendations,
                    "generated_at": insight.generated_at,
                    "api_cost": insight.api_cost
                }
            }
        
        elif format == "csv":
            # Simple CSV export
            csv_data = "Finding,Type\n"
            for finding in insight.key_findings:
                csv_data += f'"{finding}",key_finding\n'
            for rec in insight.recommendations:
                csv_data += f'"{rec}",recommendation\n'
            
            return {
                "format": "csv",
                "data": csv_data
            }
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export insights error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{insight_id}")
async def delete_insights(
    insight_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete insights for a dataset.
    """
    try:
        insight = db.query(InsightAnalysis).filter(
            InsightAnalysis.id == insight_id
        ).first()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Verify ownership through upload
        upload = db.query(DataUpload).filter(
            DataUpload.id == insight.upload_id
        ).first()
        
        if not upload or upload.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        db.delete(insight)
        db.commit()
        
        logger.info(f"Insight deleted: {insight_id}")
        
        return {"message": "Insight deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete insight error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
