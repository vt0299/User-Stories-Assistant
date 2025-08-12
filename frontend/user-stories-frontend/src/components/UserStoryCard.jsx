import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Target,
  FileCheck,
  TestTube
} from 'lucide-react'

const UserStoryCard = ({ story, onUpdateTest }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTestStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTestStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const investCriteriaCount = Object.values(story.invest_criteria).filter(Boolean).length

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-relaxed">{story.title}</CardTitle>
            <CardDescription className="mt-2">{story.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getTestStatusColor(story.test_status)}>
              {getTestStatusIcon(story.test_status)}
              <span className="ml-1 capitalize">{story.test_status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* INVEST Criteria */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="font-medium">INVEST Compliance</span>
            <Badge variant="outline">{investCriteriaCount}/6</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(story.invest_criteria).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {value ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-sm capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Definition of Done */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="font-medium">Definition of Done</span>
          </div>
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            {story.definition_of_done}
          </p>
        </div>

        <Separator />

        {/* Acceptance Criteria */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <span className="font-medium">Acceptance Criteria</span>
              <Badge variant="outline">{story.acceptance_criteria.length} scenarios</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {story.acceptance_criteria.map((scenario, index) => (
                <div key={index} className="border rounded-md p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">{scenario.scenario_title}</h4>
                  <div className="space-y-1">
                    {scenario.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-2 text-sm">
                        <span className="font-medium text-blue-600 min-w-[60px]">
                          {step.keyword}
                        </span>
                        <span className="text-muted-foreground">{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Status Controls */}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Test Status:</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={story.test_status === 'passed' ? 'default' : 'outline'}
              onClick={() => onUpdateTest(story.id, 'passed')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Pass
            </Button>
            <Button
              size="sm"
              variant={story.test_status === 'failed' ? 'destructive' : 'outline'}
              onClick={() => onUpdateTest(story.id, 'failed')}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Fail
            </Button>
            <Button
              size="sm"
              variant={story.test_status === 'not_tested' ? 'secondary' : 'outline'}
              onClick={() => onUpdateTest(story.id, 'not_tested')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserStoryCard

