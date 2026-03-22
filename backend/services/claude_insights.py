import anthropic
import json
import logging
from typing import Dict, List, Any, Tuple
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class ClaudeInsightGenerator:
    """
    Generate insights from data using Claude Haiku API.
    """
    
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-haiku-4-5"
    
    def generate_insights(self, data: List[Dict[str, Any]], filename: str) -> Tuple[Dict[str, Any], int, float]:
        """
        Generate insights from uploaded data.
        
        Returns:
            - insights_dict: Dictionary with summary, key_findings, recommendations
            - tokens_used: Number of tokens used in API call
            - cost: Estimated cost in USD
        """
        try:
            # Prepare data summary for Claude
            data_summary = self._prepare_data_summary(data, filename)
            
            # Create prompt
            prompt = self._create_prompt(data_summary)
            
            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse response
            insights = self._parse_response(response.content[0].text)
            
            # Calculate token usage
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            total_tokens = input_tokens + output_tokens
            
            # Cost calculation (Haiku pricing - rough estimate)
            # Input: $0.80 per 1M tokens, Output: $4.00 per 1M tokens
            cost = (input_tokens * 0.80 + output_tokens * 4.00) / 1_000_000
            
            logger.info(f"Claude API call successful. Tokens: {total_tokens}, Cost: ${cost:.4f}")
            
            return insights, total_tokens, cost
            
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            raise Exception(f"Failed to generate insights: {str(e)}")
    
    def _prepare_data_summary(self, data: List[Dict[str, Any]], filename: str) -> str:
        """Prepare a summary of the data for Claude."""
        if not data:
            return "Empty dataset"
        
        # Get first 50 rows for analysis
        sample_data = data[:50]
        
        summary = f"""
        Dataset: {filename}
        Total Records: {len(data)}
        Sample Data (first 50 rows):
        {json.dumps(sample_data, indent=2)[:3000]}  # Limit to 3000 chars
        """
        
        return summary
    
    def _create_prompt(self, data_summary: str) -> str:
        """Create the prompt for Claude."""
        return f"""
        Analyze the following market research data and provide insights.
        
        Data:
        {data_summary}
        
        Please provide your analysis in JSON format with the following structure:
        {{
            "summary": "2-3 sentence summary of the data",
            "key_findings": [
                "Finding 1",
                "Finding 2",
                "Finding 3"
            ],
            "recommendations": [
                "Recommendation 1",
                "Recommendation 2",
                "Recommendation 3"
            ],
            "trends": ["Trend 1", "Trend 2"],
            "opportunities": ["Opportunity 1", "Opportunity 2"]
        }}
        
        Return ONLY valid JSON, no other text.
        """
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's JSON response."""
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            
            if json_match:
                insights = json.loads(json_match.group())
            else:
                insights = json.loads(response_text)
            
            # Validate structure
            required_keys = ["summary", "key_findings", "recommendations"]
            for key in required_keys:
                if key not in insights:
                    insights[key] = []
            
            return insights
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {str(e)}")
            return {
                "summary": "Analysis completed",
                "key_findings": [],
                "recommendations": [],
                "trends": [],
                "opportunities": []
            }
    
    def validate_api_key(self) -> bool:
        """Validate that API key is set."""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        return api_key is not None and len(api_key) > 0
