import { useState, useEffect } from 'react'
import NotesInput from './components/NotesInput.jsx'
import UserStoryCard from './components/UserStoryCard.jsx'
import AmbiguityAlert from './components/AmbiguityAlert.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import ApiService from './services/api.js'
import { Separator } from '@/components/ui/separator.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Download,
  Github,
  ExternalLink
} from 'lucide-react'
import './App.css'

function App() {
  const [userStories, setUserStories] = useState([])
  const [ambiguities, setAmbiguities] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingTime, setProcessingTime] = useState(null)
  const [message, setMessage] = useState('')

  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchStats = async () => {
    try {
      const statsData = await ApiService.getStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUserStories = async () => {
    try {
      const stories = await ApiService.getUserStories()
      setUserStories(stories)
      await fetchStats()
    } catch (error) {
      showMessage("Failed to fetch user stories", "error")
    }
  }

  useEffect(() => {
    fetchUserStories()
  }, [])

  const handleTransform = async (transformRequest) => {
    setIsLoading(true)
    try {
      const result = await ApiService.transformNotes(transformRequest)
      setUserStories(result.user_stories)
      setAmbiguities(result.ambiguity_flags)
      setProcessingTime(result.processing_time)
      await fetchStats()
      
      showMessage(`Generated ${result.user_stories.length} user stories in ${result.processing_time.toFixed(2)}s`)
    } catch (error) {
      showMessage(error.message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTest = async (storyId, testStatus) => {
    try {
      await ApiService.updateAcceptanceTest(storyId, testStatus)
      
      // Update local state
      setUserStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, test_status: testStatus }
            : story
        )
      )
      
      await fetchStats()
      
      showMessage(`Test status updated to ${testStatus.replace('_', ' ')}`)
    } catch (error) {
      showMessage(error.message, "error")
    }
  }

  const exportToJson = () => {
    const dataStr = JSON.stringify(userStories, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'user_stories.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Message Display */}
        {message && (
          <div className="fixed top-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
            {message}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Stories Assistant
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform raw customer notes into structured user stories following INVEST principles 
            with Gherkin acceptance criteria
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
            <Badge variant="outline">INVEST Compliant</Badge>
            <Badge variant="outline">Gherkin Format</Badge>
          </div>
        </div>

        {/* Notes Input */}
        <div className="mb-8">
          <NotesInput onTransform={handleTransform} isLoading={isLoading} />
        </div>

        {/* Processing Time */}
        {processingTime && (
          <div className="text-center mb-6">
            <Badge variant="secondary">
              Processed in {processingTime.toFixed(2)} seconds
            </Badge>
          </div>
        )}

        {/* Ambiguity Alert */}
        {ambiguities.length > 0 && (
          <div className="mb-6">
            <AmbiguityAlert ambiguities={ambiguities} />
          </div>
        )}

        {/* Stats Panel */}
        {stats && (
          <div className="mb-8">
            <StatsPanel stats={stats} />
          </div>
        )}

        {/* User Stories */}
        {userStories.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Generated User Stories
                <Badge variant="outline">{userStories.length}</Badge>
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchUserStories}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={exportToJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {userStories.map((story) => (
                <UserStoryCard
                  key={story.id}
                  story={story}
                  onUpdateTest={handleUpdateTest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userStories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No User Stories Yet</h3>
            <p className="text-muted-foreground mb-4">
              Enter your customer notes above to generate structured user stories
            </p>
          </div>
        )}

        {/* Footer */}
        <Separator className="my-12" />
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            Built with FastAPI, OpenAI, and React
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a 
              href="https://fastapi.tiangolo.com/" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              FastAPI
            </a>
            <a 
              href="https://openai.com/" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              OpenAI
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

