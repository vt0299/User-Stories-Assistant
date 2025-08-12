#!/usr/bin/env python3

import asyncio
import json
from models import RawNotes
from llm_service_simple import LLMService, RulesEngine

async def test_llm_service():
    """Test the LLM service functionality"""
    print("Testing LLM Service...")
    
    # Create test notes
    notes = RawNotes(
        content="Our e-commerce platform needs a better checkout experience. Customers are abandoning their carts because the process is too complicated. We need to simplify the payment flow, add guest checkout option, and provide better error messages when payment fails.",
        context="E-commerce platform checkout improvement"
    )
    
    # Initialize service
    llm_service = LLMService()
    
    # Test ambiguity detection
    print("\n1. Testing ambiguity detection...")
    ambiguities = llm_service.detect_ambiguities(notes)
    print(f"Found {len(ambiguities)} ambiguities:")
    for ambiguity in ambiguities:
        print(f"  - {ambiguity}")
    
    # Test user story generation
    print("\n2. Testing user story generation...")
    try:
        user_stories = await llm_service.transform_notes_to_stories(notes, max_stories=3)
        print(f"Generated {len(user_stories)} user stories:")
        
        for i, story in enumerate(user_stories, 1):
            print(f"\nStory {i}:")
            print(f"  Title: {story.title}")
            print(f"  Description: {story.description[:100]}...")
            invest_score = sum([
                story.invest_criteria.independent,
                story.invest_criteria.negotiable,
                story.invest_criteria.valuable,
                story.invest_criteria.estimable,
                story.invest_criteria.small,
                story.invest_criteria.testable
            ])
            print(f"  INVEST Score: {invest_score}/6")
            print(f"  Acceptance Criteria: {len(story.acceptance_criteria)} scenarios")
            
            # Test validation
            validation_result = RulesEngine.validate_user_story(story)
            print(f"  Validation: {'✓ PASS' if validation_result['is_valid'] else '✗ FAIL'}")
            if not validation_result['is_valid']:
                for error in validation_result['errors']:
                    print(f"    - {error['message']}")
    
    except Exception as e:
        print(f"Error generating user stories: {e}")
        print("This might be due to missing OpenAI API key or network issues.")

if __name__ == "__main__":
    asyncio.run(test_llm_service())

