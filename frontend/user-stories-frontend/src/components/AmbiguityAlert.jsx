import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { AlertTriangle } from 'lucide-react'

const AmbiguityAlert = ({ ambiguities }) => {
  if (!ambiguities || ambiguities.length === 0) {
    return null
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Ambiguous Requirements Detected</AlertTitle>
      <AlertDescription className="text-orange-700">
        <p className="mb-2">
          The following potential ambiguities were detected in your requirements. 
          Consider clarifying these for better user stories:
        </p>
        <ul className="list-disc list-inside space-y-1">
          {ambiguities.map((ambiguity, index) => (
            <li key={index} className="text-sm">{ambiguity}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export default AmbiguityAlert

