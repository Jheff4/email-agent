import { useState } from "react"
import { Clock, AlertTriangle, SquareActivity, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ClientRequestsTable } from "@/components/dashboard/client-requests-table"
import ConversationThread from "./ConversationThread"

export default function Dashboard() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  const handleViewRequest = (requestId: string) => {
    setSelectedRequest(requestId)
  }

  const handleBackToDashboard = () => {
    setSelectedRequest(null)
  }

  if (selectedRequest) {
    return (
      <div className="p-8">
        <ConversationThread 
          requestId={selectedRequest} 
          onBack={handleBackToDashboard}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 max-sm:p-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor staff response times and client requests
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Requests"
          value="24"
          icon={Clock}
          variant="info"
        />
        <MetricCard
          title="Overdue"
          value="3"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Ongoing"
          value="59"
          icon={SquareActivity}
          variant="success"
        />
        <MetricCard
          title="New Clients"
          value="8"
          icon={UserPlus}
          variant="info"
        />
      </div>

      {/* Recent Client Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Client Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientRequestsTable onViewRequest={handleViewRequest} />
        </CardContent>
      </Card>
    </div>
  )
}