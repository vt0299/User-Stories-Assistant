# User Stories Assistant API Documentation

## Overview

The User Stories Assistant API is a RESTful service built with FastAPI that transforms raw customer notes into structured user stories following INVEST principles. The API provides endpoints for transformation, validation, storage, and management of user stories.

**Base URL**: `http://localhost:8000`  
**API Version**: 1.0.0  
**Content Type**: `application/json`

## Authentication

Currently, the API does not require authentication for development purposes. For production deployment, consider implementing:
- API key authentication
- OAuth 2.0
- JWT tokens

## Rate Limiting

No rate limiting is currently implemented. For production use, consider implementing rate limiting to prevent abuse.

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

```json
{
  "detail": "Error description",
  "status_code": 400
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request - Invalid input data
- `404`: Not Found - Resource doesn't exist
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server-side error

## Endpoints

### Health Check

#### `GET /`

Returns the API status and version information.

**Response:**
```json
{
  "message": "User Stories Assistant API",
  "status": "running",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/"
```

---

### Transform Notes to User Stories

#### `POST /transform_notes`

Transforms raw customer notes into structured user stories with INVEST criteria and Gherkin acceptance criteria.

**Request Body:**
```json
{
  "notes": {
    "content": "string",
    "context": "string (optional)"
  },
  "max_stories": "integer (1-10, default: 5)"
}
```

**Parameters:**
- `notes.content` (required): Raw customer notes, requirements, or meeting notes
- `notes.context` (optional): Additional context about the project or domain
- `max_stories` (optional): Maximum number of user stories to generate (1-10)

**Response:**
```json
{
  "user_stories": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "invest_criteria": {
        "independent": "boolean",
        "negotiable": "boolean",
        "valuable": "boolean",
        "estimable": "boolean",
        "small": "boolean",
        "testable": "boolean"
      },
      "definition_of_done": "string",
      "acceptance_criteria": [
        {
          "scenario_title": "string",
          "steps": [
            {
              "keyword": "Given|When|Then|And|But",
              "text": "string"
            }
          ]
        }
      ],
      "test_status": "not_tested|passed|failed",
      "created_at": "datetime",
      "updated_at": "datetime|null"
    }
  ],
  "ambiguity_flags": ["string"],
  "processing_time": "float"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8000/transform_notes" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": {
      "content": "We need a better checkout process. Customers are abandoning carts.",
      "context": "E-commerce platform"
    },
    "max_stories": 3
  }'
```

**Example Response:**
```json
{
  "user_stories": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "As a customer, I want a simplified checkout process so that I can complete purchases quickly",
      "description": "The current checkout process is causing cart abandonment...",
      "invest_criteria": {
        "independent": true,
        "negotiable": true,
        "valuable": true,
        "estimable": true,
        "small": true,
        "testable": true
      },
      "definition_of_done": "Customer can complete checkout in under 3 steps",
      "acceptance_criteria": [
        {
          "scenario_title": "Successful checkout completion",
          "steps": [
            {
              "keyword": "Given",
              "text": "I have items in my cart"
            },
            {
              "keyword": "When",
              "text": "I proceed to checkout"
            },
            {
              "keyword": "Then",
              "text": "I should complete the purchase in 3 steps or less"
            }
          ]
        }
      ],
      "test_status": "not_tested",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": null
    }
  ],
  "ambiguity_flags": [
    "Vague quantifier detected: 'better' - needs specific definition"
  ],
  "processing_time": 2.34
}
```

---

### Get All User Stories

#### `GET /user_stories`

Retrieves all stored user stories from the backlog.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "invest_criteria": { ... },
    "definition_of_done": "string",
    "acceptance_criteria": [ ... ],
    "test_status": "not_tested|passed|failed",
    "created_at": "datetime",
    "updated_at": "datetime|null"
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/user_stories"
```

---

### Get Single User Story

#### `GET /user_stories/{story_id}`

Retrieves a specific user story by its ID.

**Parameters:**
- `story_id` (path): UUID of the user story

**Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "invest_criteria": { ... },
  "definition_of_done": "string",
  "acceptance_criteria": [ ... ],
  "test_status": "not_tested|passed|failed",
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/user_stories/123e4567-e89b-12d3-a456-426614174000"
```

**Error Response (404):**
```json
{
  "detail": "User story not found"
}
```

---

### Update Acceptance Test Status

#### `PUT /user_stories/{story_id}/acceptance_test`

Updates the acceptance test status for a specific user story.

**Parameters:**
- `story_id` (path): UUID of the user story

**Request Body:**
```json
{
  "test_status": "not_tested|passed|failed",
  "scenario_index": "integer (optional)"
}
```

**Parameters:**
- `test_status` (required): New test status
- `scenario_index` (optional): Index of specific scenario to update

**Response:**
```json
{
  "message": "Test status updated successfully",
  "story_id": "uuid"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:8000/user_stories/123e4567-e89b-12d3-a456-426614174000/acceptance_test" \
  -H "Content-Type: application/json" \
  -d '{
    "test_status": "passed"
  }'
```

---

### Validate User Story

#### `POST /validate_story/{story_id}`

Validates a specific user story against business rules and returns validation results.

**Parameters:**
- `story_id` (path): UUID of the user story

**Response:**
```json
{
  "is_valid": "boolean",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/validate_story/123e4567-e89b-12d3-a456-426614174000"
```

**Example Response:**
```json
{
  "is_valid": false,
  "errors": [
    {
      "field": "definition_of_done",
      "message": "Definition of Done must be at least 10 characters long"
    }
  ]
}
```

---

### Delete User Story

#### `DELETE /user_stories/{story_id}`

Deletes a user story from the backlog.

**Parameters:**
- `story_id` (path): UUID of the user story

**Response:**
```json
{
  "message": "User story deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:8000/user_stories/123e4567-e89b-12d3-a456-426614174000"
```

---

### Get Statistics

#### `GET /stats`

Returns statistics about user stories, including test status breakdown and INVEST compliance metrics.

**Response:**
```json
{
  "total_stories": "integer",
  "test_status_breakdown": {
    "not_tested": "integer",
    "passed": "integer",
    "failed": "integer"
  },
  "invest_compliance": {
    "independent": "float (percentage)",
    "negotiable": "float (percentage)",
    "valuable": "float (percentage)",
    "estimable": "float (percentage)",
    "small": "float (percentage)",
    "testable": "float (percentage)"
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/stats"
```

**Example Response:**
```json
{
  "total_stories": 15,
  "test_status_breakdown": {
    "not_tested": 8,
    "passed": 5,
    "failed": 2
  },
  "invest_compliance": {
    "independent": 86.7,
    "negotiable": 93.3,
    "valuable": 100.0,
    "estimable": 80.0,
    "small": 73.3,
    "testable": 93.3
  }
}
```

## Data Models

### UserStory

Complete user story object with all metadata and validation information.

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "invest_criteria": "InvestCriteria",
  "definition_of_done": "string",
  "acceptance_criteria": ["GherkinScenario"],
  "test_status": "TestStatus",
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

### InvestCriteria

Evaluation of user story against INVEST principles.

```json
{
  "independent": "boolean",
  "negotiable": "boolean", 
  "valuable": "boolean",
  "estimable": "boolean",
  "small": "boolean",
  "testable": "boolean"
}
```

### GherkinScenario

Acceptance criteria in Gherkin format.

```json
{
  "scenario_title": "string",
  "steps": ["GherkinStep"]
}
```

### GherkinStep

Individual step in a Gherkin scenario.

```json
{
  "keyword": "Given|When|Then|And|But",
  "text": "string"
}
```

### TestStatus

Enumeration of possible test statuses.

- `not_tested`: Test has not been executed
- `passed`: Test passed successfully
- `failed`: Test failed

### RawNotes

Input format for customer notes.

```json
{
  "content": "string",
  "context": "string|null"
}
```

### TransformRequest

Request format for note transformation.

```json
{
  "notes": "RawNotes",
  "max_stories": "integer (1-10)"
}
```

### ValidationResult

Result of user story validation.

```json
{
  "is_valid": "boolean",
  "errors": ["ValidationError"]
}
```

### ValidationError

Individual validation error.

```json
{
  "field": "string",
  "message": "string"
}
```

## Business Rules

The API enforces several business rules during validation:

### User Story Rules
1. **Definition of Done**: Must be at least 10 characters long
2. **Acceptance Criteria**: Must have at least one scenario
3. **Title Format**: Must follow "As a [user], I want [goal] so that [reason]" format
4. **Gherkin Completeness**: Each scenario must have Given, When, and Then steps
5. **INVEST Compliance**: Should meet at least 4 out of 6 INVEST criteria

### Ambiguity Detection
The system automatically detects potential ambiguities in requirements:
- Vague terms (user-friendly, fast, secure)
- Unclear quantifiers (many, few, some)
- Missing details (etc., and so on)
- Undefined user roles
- Missing success criteria

## Integration Examples

### Python Client Example

```python
import requests
import json

# Transform notes
def transform_notes(content, context=None, max_stories=5):
    url = "http://localhost:8000/transform_notes"
    payload = {
        "notes": {
            "content": content,
            "context": context
        },
        "max_stories": max_stories
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = transform_notes(
    "We need better user authentication",
    "Web application security"
)
print(f"Generated {len(result['user_stories'])} user stories")
```

### JavaScript Client Example

```javascript
// Transform notes
async function transformNotes(content, context = null, maxStories = 5) {
  const response = await fetch('http://localhost:8000/transform_notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notes: {
        content: content,
        context: context
      },
      max_stories: maxStories
    })
  });
  
  return await response.json();
}

// Usage
transformNotes('Improve checkout process', 'E-commerce')
  .then(result => {
    console.log(`Generated ${result.user_stories.length} user stories`);
  });
```

### cURL Examples

```bash
# Transform notes
curl -X POST "http://localhost:8000/transform_notes" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": {
      "content": "Add user registration feature",
      "context": "Mobile app"
    },
    "max_stories": 3
  }'

# Get all stories
curl -X GET "http://localhost:8000/user_stories"

# Update test status
curl -X PUT "http://localhost:8000/user_stories/{story_id}/acceptance_test" \
  -H "Content-Type: application/json" \
  -d '{"test_status": "passed"}'

# Get statistics
curl -X GET "http://localhost:8000/stats"
```

## OpenAPI Documentation

The API automatically generates OpenAPI (Swagger) documentation available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Performance Considerations

### Response Times
- Note transformation: 2-10 seconds (depends on content complexity)
- CRUD operations: < 100ms
- Statistics: < 50ms

### Optimization Tips
1. **Batch Processing**: Transform multiple notes in separate requests
2. **Caching**: Implement caching for repeated transformations
3. **Async Processing**: Use background tasks for long-running operations
4. **Rate Limiting**: Implement to prevent API abuse

## Error Scenarios

### Common Error Cases

1. **Invalid OpenAI API Key**
   ```json
   {
     "detail": "Error transforming notes: Invalid API key"
   }
   ```

2. **Empty Notes Content**
   ```json
   {
     "detail": "Notes content cannot be empty"
   }
   ```

3. **Story Not Found**
   ```json
   {
     "detail": "User story not found"
   }
   ```

4. **Validation Errors**
   ```json
   {
     "detail": [
       {
         "loc": ["body", "max_stories"],
         "msg": "ensure this value is less than or equal to 10",
         "type": "value_error.number.not_le"
       }
     ]
   }
   ```

## Security Considerations

### API Security
- Input validation on all endpoints
- SQL injection prevention (using Pydantic models)
- XSS protection through proper encoding
- CORS configuration for cross-origin requests

### Production Recommendations
1. **Authentication**: Implement API key or OAuth
2. **HTTPS**: Use TLS encryption
3. **Rate Limiting**: Prevent abuse
4. **Input Sanitization**: Validate all inputs
5. **Logging**: Monitor API usage
6. **Error Handling**: Don't expose internal details

## Monitoring and Logging

### Recommended Monitoring
- Response times
- Error rates
- API usage patterns
- OpenAI API costs
- System resource usage

### Logging Configuration
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

**For additional support or questions about the API, please refer to the main documentation or contact the development team.**

