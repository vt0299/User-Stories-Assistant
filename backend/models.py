from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
import uuid
from datetime import datetime


class GherkinKeyword(str, Enum):
    GIVEN = "Given"
    WHEN = "When"
    THEN = "Then"
    AND = "And"
    BUT = "But"


class GherkinStep(BaseModel):
    keyword: GherkinKeyword
    text: str = Field(..., description="The step description")


class GherkinScenario(BaseModel):
    scenario_title: str = Field(..., description="Title of the Gherkin scenario")
    steps: List[GherkinStep] = Field(..., description="List of Gherkin steps")


class InvestCriteria(BaseModel):
    independent: bool = Field(..., description="Story is independent of other stories")
    negotiable: bool = Field(..., description="Story details can be negotiated")
    valuable: bool = Field(..., description="Story provides value to users/business")
    estimable: bool = Field(..., description="Story can be estimated for effort")
    small: bool = Field(..., description="Story is small enough to complete in one iteration")
    testable: bool = Field(..., description="Story has clear acceptance criteria for testing")


class TestStatus(str, Enum):
    NOT_TESTED = "not_tested"
    PASSED = "passed"
    FAILED = "failed"


class UserStory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="The user story title in format: As a [user], I want [goal] so that [reason]")
    description: str = Field(..., description="Detailed description of the user story")
    invest_criteria: InvestCriteria = Field(..., description="INVEST criteria evaluation")
    definition_of_done: str = Field(..., description="Clear definition of done for the user story")
    acceptance_criteria: List[GherkinScenario] = Field(..., description="List of Gherkin scenarios")
    test_status: TestStatus = Field(default=TestStatus.NOT_TESTED)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class RawNotes(BaseModel):
    content: str = Field(..., description="Raw customer notes to be transformed")
    context: Optional[str] = Field(None, description="Additional context about the project or domain")


class TransformRequest(BaseModel):
    notes: RawNotes
    max_stories: int = Field(default=5, description="Maximum number of user stories to generate")


class TransformResponse(BaseModel):
    user_stories: List[UserStory]
    ambiguity_flags: List[str] = Field(default_factory=list, description="Detected ambiguous requirements")
    processing_time: float


class TestUpdateRequest(BaseModel):
    test_status: TestStatus
    scenario_index: Optional[int] = Field(None, description="Index of specific scenario to update")


class ValidationError(BaseModel):
    field: str
    message: str


class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[ValidationError] = Field(default_factory=list)

