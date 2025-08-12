const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  async transformNotes(transformRequest) {
    const response = await fetch(`${API_BASE_URL}/transform_notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformRequest),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to transform notes')
    }

    return response.json()
  }

  async getUserStories() {
    const response = await fetch(`${API_BASE_URL}/user_stories`)

    if (!response.ok) {
      throw new Error('Failed to fetch user stories')
    }

    return response.json()
  }

  async updateAcceptanceTest(storyId, testStatus) {
    const response = await fetch(`${API_BASE_URL}/user_stories/${storyId}/acceptance_test`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test_status: testStatus }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update test status')
    }

    return response.json()
  }

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`)

    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }

    return response.json()
  }

  async validateStory(storyId) {
    const response = await fetch(`${API_BASE_URL}/validate_story/${storyId}`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to validate story')
    }

    return response.json()
  }
}

export default new ApiService()

