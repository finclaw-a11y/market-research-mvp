import pandas as pd
import json
from io import StringIO, BytesIO
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class CSVProcessor:
    """
    Process and validate CSV files.
    """
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
    MAX_ROWS = 100000
    
    @staticmethod
    def validate_file(file_content: bytes, filename: str) -> Tuple[bool, str]:
        """Validate CSV file size and format."""
        if len(file_content) > CSVProcessor.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size is {CSVProcessor.MAX_FILE_SIZE / 1024 / 1024} MB"
        
        if not filename.lower().endswith('.csv'):
            return False, "File must be a CSV"
        
        return True, ""
    
    @staticmethod
    def parse_csv(file_content: bytes) -> Tuple[pd.DataFrame, str]:
        """
        Parse CSV file and return DataFrame.
        """
        try:
            df = pd.read_csv(BytesIO(file_content))
            
            if len(df) > CSVProcessor.MAX_ROWS:
                return None, f"CSV has too many rows. Maximum is {CSVProcessor.MAX_ROWS}"
            
            return df, ""
        except Exception as e:
            logger.error(f"CSV parsing error: {str(e)}")
            return None, f"Failed to parse CSV: {str(e)}"
    
    @staticmethod
    def get_preview(df: pd.DataFrame, rows: int = 10) -> Dict[str, Any]:
        """Get preview of first N rows."""
        preview_df = df.head(rows)
        return {
            "columns": df.columns.tolist(),
            "data": preview_df.to_dict('records'),
            "row_count": len(df),
            "column_count": len(df.columns),
            "dtypes": {col: str(df[col].dtype) for col in df.columns}
        }
    
    @staticmethod
    def clean_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and standardize data.
        """
        try:
            # Remove completely empty rows
            df = df.dropna(how='all')
            
            # Remove completely empty columns
            df = df.dropna(axis=1, how='all')
            
            # Fill NaN with None for JSON serialization
            df = df.where(pd.notna(df), None)
            
            # Convert data types intelligently
            for col in df.columns:
                # Try to convert to numeric if possible
                if df[col].dtype == 'object':
                    try:
                        numeric_col = pd.to_numeric(df[col], errors='coerce')
                        if numeric_col.notna().sum() / len(df[col]) > 0.8:  # 80% success rate
                            df[col] = numeric_col
                    except:
                        pass
            
            return df
        except Exception as e:
            logger.error(f"Data cleaning error: {str(e)}")
            return df
    
    @staticmethod
    def to_dict_list(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Convert DataFrame to list of dictionaries."""
        return df.fillna('').to_dict('records')
    
    @staticmethod
    def get_statistics(df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate basic statistics about the dataset."""
        stats = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": df.columns.tolist(),
            "dtypes": {col: str(df[col].dtype) for col in df.columns},
            "missing_values": df.isnull().sum().to_dict(),
            "numeric_summary": {}
        }
        
        # Add numeric statistics for numeric columns
        numeric_df = df.select_dtypes(include=['number'])
        if len(numeric_df.columns) > 0:
            stats["numeric_summary"] = numeric_df.describe().to_dict()
        
        return stats
