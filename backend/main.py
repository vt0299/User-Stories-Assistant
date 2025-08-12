from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import time
import asyncio
from datetime import datetime

from models import (
    UserStory, TransformRequest, TransformResponse, TestUpdateRequest,
    ValidationResult, RawNotes, TestStatus
)
from llm_service_simple import LLMService, RulesEngine

# Initialize FastAPI app
app = FastAPI(
    title="User Stories Assistant API",
    description="Transform raw customer notes into INVEST user stories with Gherkin acceptance criteria",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
rules_engine = RulesEngine()

# In-memory storage (in production, use a database)
user_stories_db: Dict[str, UserStory] = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "User Stories Assistant API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/transform_notes", response_model=TransformResponse)
async def transform_notes(request: TransformRequest):
    """Transform raw customer notes into user stories"""
    start_time = time.time()
    
    try:
        # Transform notes using LLM
        user_stories = await llm_service.transform_notes_to_stories(
            request.notes, 
            request.max_stories
        )
        
        # Validate each user story
        validated_stories = []
        for story in user_stories:
            validation_result = rules_engine.validate_user_story(story)
            if validation_result["is_valid"]:
                # Store in database
                user_stories_db[story.id] = story
                validated_stories.append(story)
            else:
                # Log validation errors (in production, you might want to handle this differently)
                print(f"Validation failed for story {story.id}: {validation_result['errors']}")
        
        # Detect ambiguities
        ambiguity_flags = llm_service.detect_ambiguities(request.notes)
        
        processing_time = time.time() - start_time
        
        return TransformResponse(
            user_stories=validated_stories,
            ambiguity_flags=ambiguity_flags,
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transforming notes: {str(e)}")


@app.get("/user_stories", response_model=List[UserStory])
async def get_user_stories():
    """Get all user stories from the backlog"""
    return list(user_stories_db.values())


@app.get("/user_stories/{story_id}", response_model=UserStory)
async def get_user_story(story_id: str):
    """Get a specific user story by ID"""
    if story_id not in user_stories_db:
        raise HTTPException(status_code=404, detail="User story not found")
    
    return user_stories_db[story_id]


@app.put("/user_stories/{story_id}/acceptance_test")
async def update_acceptance_test(story_id: str, request: TestUpdateRequest):
    """Update the acceptance test status for a user story"""
    if story_id not in user_stories_db:
        raise HTTPException(status_code=404, detail="User story not found")
    
    story = user_stories_db[story_id]
    story.test_status = request.test_status
    story.updated_at = datetime.now()
    
    return {"message": "Test status updated successfully", "story_id": story_id}


@app.post("/validate_story/{story_id}", response_model=ValidationResult)
async def validate_story(story_id: str):
    """Validate a specific user story against business rules"""
    if story_id not in user_stories_db:
        raise HTTPException(status_code=404, detail="User story not found")
    
    story = user_stories_db[story_id]
    validation_result = rules_engine.validate_user_story(story)
    
    return ValidationResult(
        is_valid=validation_result["is_valid"],
        errors=validation_result["errors"]
    )


@app.delete("/user_stories/{story_id}")
async def delete_user_story(story_id: str):
    """Delete a user story from the backlog"""
    if story_id not in user_stories_db:
        raise HTTPException(status_code=404, detail="User story not found")
    
    del user_stories_db[story_id]
    return {"message": "User story deleted successfully"}


@app.get("/stats")
async def get_stats():
    """Get statistics about the user stories"""
    total_stories = len(user_stories_db)
    
    if total_stories == 0:
        return {
            "total_stories": 0,
            "test_status_breakdown": {},
            "invest_compliance": {}
        }
    
    # Test status breakdown
    test_status_counts = {}
    invest_compliance = {
        "independent": 0,
        "negotiable": 0,
        "valuable": 0,
        "estimable": 0,
        "small": 0,
        "testable": 0
    }
    
    for story in user_stories_db.values():
        # Count test statuses
        status = story.test_status.value
        test_status_counts[status] = test_status_counts.get(status, 0) + 1
        
        # Count INVEST compliance
        if story.invest_criteria.independent:
            invest_compliance["independent"] += 1
        if story.invest_criteria.negotiable:
            invest_compliance["negotiable"] += 1
        if story.invest_criteria.valuable:
            invest_compliance["valuable"] += 1
        if story.invest_criteria.estimable:
            invest_compliance["estimable"] += 1
        if story.invest_criteria.small:
            invest_compliance["small"] += 1
        if story.invest_criteria.testable:
            invest_compliance["testable"] += 1
    
    # Convert to percentages
    for key in invest_compliance:
        invest_compliance[key] = round((invest_compliance[key] / total_stories) * 100, 1)
    
    return {
        "total_stories": total_stories,
        "test_status_breakdown": test_status_counts,
        "invest_compliance": invest_compliance
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

