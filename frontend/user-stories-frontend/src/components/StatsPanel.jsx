import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart3, CheckCircle, XCircle, Clock, Target } from 'lucide-react'

const StatsPanel = ({ stats }) => {
  if (!stats || stats.total_stories === 0) {
    return null
  }

  const { total_stories, test_status_breakdown, invest_compliance } = stats

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Stories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total_stories}</div>
          <p className="text-xs text-muted-foreground">
            Generated user stories
          </p>
        </CardContent>
      </Card>

      {/* Test Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Test Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(test_status_breakdown).map(([status, count]) => {
              const percentage = Math.round((count / total_stories) * 100)
              const getIcon = () => {
                switch (status) {
                  case 'passed':
                    return <CheckCircle className="h-3 w-3 text-green-500" />
                  case 'failed':
                    return <XCircle className="h-3 w-3 text-red-500" />
                  default:
                    return <Clock className="h-3 w-3 text-gray-500" />
                }
              }

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className="text-xs capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {count} ({percentage}%)
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* INVEST Compliance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">INVEST Compliance</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(invest_compliance).map(([criteria, percentage]) => (
              <div key={criteria} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize">{criteria}</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatsPanel

