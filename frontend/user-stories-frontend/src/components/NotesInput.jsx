import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Loader2, FileText, Sparkles } from 'lucide-react'

const NotesInput = ({ onTransform, isLoading }) => {
  const [notes, setNotes] = useState('')
  const [context, setContext] = useState('')
  const [maxStories, setMaxStories] = useState(5)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (notes.trim()) {
      onTransform({
        notes: {
          content: notes,
          context: context || null
        },
        max_stories: maxStories
      })
    }
  }

  const exampleNotes = `Our e-commerce platform needs a better checkout experience. Customers are abandoning their carts because the process is too complicated. We need to simplify the payment flow, add guest checkout option, and provide better error messages when payment fails. Also, customers want to save their payment methods for future purchases. The checkout should work on mobile devices and support multiple payment methods like credit cards, PayPal, and Apple Pay.`

  const loadExample = () => {
    setNotes(exampleNotes)
    setContext('E-commerce platform checkout improvement')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Raw Customer Notes
        </CardTitle>
        <CardDescription>
          Enter your raw customer requirements, feature requests, or meeting notes. 
          Our AI will transform them into structured user stories following INVEST principles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Customer Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Paste your raw customer notes, requirements, or meeting notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none"
              required
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadExample}
                className="text-xs"
              >
                Load Example
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Input
                id="context"
                placeholder="e.g., Mobile app, Web platform, Internal tool..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStories">Max Stories to Generate</Label>
              <Input
                id="maxStories"
                type="number"
                min="1"
                max="10"
                value={maxStories}
                onChange={(e) => setMaxStories(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !notes.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transforming Notes...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Transform to User Stories
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default NotesInput

