import { useEffect, useState, useMemo } from "react";
import { Clock, AlertTriangle, SquareActivity, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ClientRequestsTable } from "@/components/dashboard/client-requests-table";
import ConversationThread from "./ConversationThread";
import { useAuthProvider } from "@/Providers/hooks";
import { useNavigate } from "react-router-dom";
import { useRequests, useClients } from "@/hooks/use-api-query";
import { Request } from "@/api/types";
import Loader from "@/components/loader";

export default function Dashboard() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const { user, isLoading } = useAuthProvider();
  const navigate = useNavigate();

  // Fetch requests data
  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useRequests();

  const {
    data: clientsData,
    isLoading: clientsLoading,
  } = useClients();

  // Extract requests array from API data
  const requests = useMemo(() => {
    return requestsData && Array.isArray((requestsData as any).requests)
      ? (requestsData as any).requests
      : [];
  }, [requestsData]);

  // Extract clients array from API data
  const clients = useMemo(() => {
    return clientsData && Array.isArray((clientsData as any).clients)
      ? (clientsData as any).clients
      : Array.isArray(clientsData)
      ? clientsData
      : [];
  }, [clientsData]);

  // Calculate metrics from requests data
  const metrics = useMemo(() => {
    if (!requests.length) {
      return {
        activeRequests: 0,
        overdueCount: 0,
        ongoingCount: 0,
        newClientsToday: 0,
      };
    }

    let activeRequests = 0;
    let overdueCount = 0;
    let ongoingCount = 0;

    requests.forEach((request: Request) => {
      // Count active requests (not completed)
      if (request.status !== "Completed") {
        activeRequests++;
      }

      // Count ongoing requests
      if (request.status === "Ongoing") {
        ongoingCount++;
      }

      // Count overdue requests
      if (request.status !== "Pending" && request.status !== "Ongoing" && request.status !== "Completed") {
        overdueCount++;
      }
    });

    return {
      activeRequests,
      overdueCount,
      ongoingCount,
      newClientsToday: clients.length,
    };
  }, [requests, clients]);

  const handleViewRequest = (requestId: string) => {
    setSelectedRequest(requestId);
  };

  const handleBackToDashboard = () => {
    setSelectedRequest(null);
  };

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (selectedRequest) {
    return (
      <div className="p-8">
        <ConversationThread
          requestId={selectedRequest}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  if (isLoading || requestsLoading || clientsLoading) {
    return <Loader />;
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
          value={metrics.activeRequests.toString()}
          icon={Clock}
          variant="info"
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdueCount.toString()}
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Ongoing"
          value={metrics.ongoingCount.toString()}
          icon={SquareActivity}
          variant="success"
        />
        <MetricCard
          title="New Clients"
          value={metrics.newClientsToday.toString()}
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
  );
}