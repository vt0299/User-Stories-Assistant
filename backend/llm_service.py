import os
from typing import List, Dict, Any
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from models import UserStory, RawNotes, InvestCriteria, GherkinScenario, GherkinStep, GherkinKeyword
import json
import re


class LLMService:
    def __init__(self):
        # Initialize the OpenAI model
        self.model = OpenAIModel('gpt-4o-mini')
        
        # Create the agent with structured output
        self.agent = Agent(
            model=self.model,
            result_type=List[UserStory],
            system_prompt=self._get_system_prompt()
        )
    
    def _get_system_prompt(self) -> str:
        return """
        You are an expert Business Analyst and Requirements Engineer. Your task is to transform raw customer notes into well-structured user stories that follow the INVEST principles.

        INVEST Principles:
        - Independent: Stories should be independent of each other
        - Negotiable: Details can be discussed and refined
        - Valuable: Must provide clear value to users or business
        - Estimable: Development effort can be estimated
        - Small: Can be completed in one iteration/sprint
        - Testable: Has clear acceptance criteria

        For each user story you create:
        1. Write a clear title in the format: "As a [type of user], I want [some goal] so that [some reason]"
        2. Provide a detailed description
        3. Evaluate against INVEST criteria (mark true/false for each)
        4. Write a clear Definition of Done
        5. Create Gherkin acceptance criteria with Given/When/Then scenarios

        Guidelines:
        - Break down complex requirements into multiple smaller stories
        - Ensure each story is testable with clear acceptance criteria
        - Use business language, not technical jargon
        - Focus on user value and outcomes
        - Make scenarios specific and measurable
        """
    
    async def transform_notes_to_stories(self, notes: RawNotes, max_stories: int = 5) -> List[UserStory]:
        """Transform raw notes into structured user stories"""
        
        prompt = f"""
        Transform the following raw customer notes into {max_stories} or fewer well-structured user stories:

        Raw Notes:
        {notes.content}

        Additional Context:
        {notes.context or "No additional context provided"}

        Requirements:
        1. Create user stories that follow INVEST principles
        2. Each story must have clear acceptance criteria in Gherkin format
        3. Ensure stories are independent and can be developed separately
        4. Focus on user value and business outcomes
        5. Make acceptance criteria specific and testable
        """
        
        try:
            result = await self.agent.run(prompt)
            return result.data
        except Exception as e:
            print(f"Error in LLM transformation: {e}")
            return []
    
    def detect_ambiguities(self, notes: RawNotes) -> List[str]:
        """Detect ambiguous requirements in raw notes"""
        ambiguities = []
        content = notes.content.lower()
        
        # Common ambiguity patterns
        ambiguous_phrases = [
            "user-friendly", "easy to use", "fast", "secure", "reliable",
            "good performance", "nice to have", "should be", "might need",
            "probably", "maybe", "some", "few", "many", "several",
            "as needed", "when possible", "if required"
        ]
        
        vague_quantifiers = [
            "a lot", "some", "many", "few", "several", "most", "often",
            "rarely", "sometimes", "usually", "generally"
        ]
        
        missing_details = [
            "etc", "and so on", "among others", "for example", "such as"
        ]
        
        # Check for ambiguous phrases
        for phrase in ambiguous_phrases:
            if phrase in content:
                ambiguities.append(f"Ambiguous term detected: '{phrase}' - needs specific definition")
        
        # Check for vague quantifiers
        for quantifier in vague_quantifiers:
            if quantifier in content:
                ambiguities.append(f"Vague quantifier detected: '{quantifier}' - needs specific numbers")
        
        # Check for incomplete lists
        for detail in missing_details:
            if detail in content:
                ambiguities.append(f"Incomplete specification detected: '{detail}' - needs complete list")
        
        # Check for missing actors
        if not re.search(r'\b(user|customer|admin|manager|employee|client)\b', content):
            ambiguities.append("No clear user roles identified - specify who will use the system")
        
        # Check for missing success criteria
        if not re.search(r'\b(success|complete|done|finish|achieve)\b', content):
            ambiguities.append("No clear success criteria defined - specify what constitutes completion")
        
        return ambiguities


class RulesEngine:
    """Validates user stories against business rules"""
    
    @staticmethod
    def validate_user_story(story: UserStory) -> Dict[str, Any]:
        """Validate a user story against defined rules"""
        errors = []
        
        # Rule 1: Must have Definition of Done
        if not story.definition_of_done or len(story.definition_of_done.strip()) < 10:
            errors.append({
                "field": "definition_of_done",
                "message": "Definition of Done must be at least 10 characters long"
            })
        
        # Rule 2: Must have at least one acceptance criteria
        if not story.acceptance_criteria or len(story.acceptance_criteria) == 0:
            errors.append({
                "field": "acceptance_criteria",
                "message": "User story must have at least one acceptance criteria scenario"
            })
        
        # Rule 3: Title must follow user story format
        title_pattern = r"^As a .+, I want .+so that .+"
        if not re.match(title_pattern, story.title, re.IGNORECASE):
            errors.append({
                "field": "title",
                "message": "Title must follow format: 'As a [user], I want [goal] so that [reason]'"
            })
        
        # Rule 4: Each Gherkin scenario must have at least Given, When, Then
        for i, scenario in enumerate(story.acceptance_criteria):
            keywords = [step.keyword for step in scenario.steps]
            required_keywords = [GherkinKeyword.GIVEN, GherkinKeyword.WHEN, GherkinKeyword.THEN]
            
            for keyword in required_keywords:
                if keyword not in keywords:
                    errors.append({
                        "field": f"acceptance_criteria[{i}]",
                        "message": f"Scenario '{scenario.scenario_title}' missing {keyword.value} step"
                    })
        
        # Rule 5: INVEST criteria should have at least 4 true values
        invest_values = [
            story.invest_criteria.independent,
            story.invest_criteria.negotiable,
            story.invest_criteria.valuable,
            story.invest_criteria.estimable,
            story.invest_criteria.small,
            story.invest_criteria.testable
        ]
        
        if sum(invest_values) < 4:
            errors.append({
                "field": "invest_criteria",
                "message": "User story should meet at least 4 out of 6 INVEST criteria"
            })
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }

