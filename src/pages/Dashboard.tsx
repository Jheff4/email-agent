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

const TIME_LIMIT_MINUTES = 5;

export default function Dashboard() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
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

  // Update current time every second for timer calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract requests array from API data
  const requests = useMemo(() => {
    return requestsData && Array.isArray((requestsData as any).requests)
      ? (requestsData as any).requests
      : [];
  }, [requestsData]);

  // Calculate overdue status for each request
  const requestsWithTimers = useMemo(() => {
    return requests.map((request: Request) => {
      if (!request.createdAt) {
        return { ...request, isOverdue: true, remainingSeconds: 0 };
      }

      const createdTime = new Date(request.createdAt).getTime();
      const timeLimitMs = TIME_LIMIT_MINUTES * 60 * 1000; // 5 minutes in milliseconds
      const deadlineTime = createdTime + timeLimitMs;
      const remainingMs = deadlineTime - currentTime;
      
      const isOverdue = remainingMs <= 0;
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      return { ...request, isOverdue, remainingSeconds };
    });
  }, [requests, currentTime]);
  
  // Extract clients array from API data
  const clients = useMemo(() => {
    return clientsData && Array.isArray((clientsData as any).clients)
      ? (clientsData as any).clients
      : Array.isArray(clientsData)
      ? clientsData
      : [];
  }, [clientsData]);

  // Calculate new clients in the last 24 hours
  const newClientsToday = useMemo(() => {
    if (!clients.length) return 0;

    const twentyFourHoursAgo = currentTime - (24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return clients.filter((client: any) => {
      if (!client.createdAt) return false;
      
      const clientCreatedTime = new Date(client.createdAt).getTime();
      return clientCreatedTime > twentyFourHoursAgo;
    }).length;
  }, [clients, currentTime]);

  // Calculate metrics from requests data
  const metrics = useMemo(() => {
    if (!requestsWithTimers.length) {
      return {
        activeRequests: 0,
        overdueCount: 0,
        ongoingCount: 0,
        newClientsToday,
      };
    }

    const { activeRequests, ongoingCount, overdueCount } = requestsWithTimers.reduce(
      (acc: { activeRequests: number; ongoingCount: number; overdueCount: number }, request: any) => {
        if (request.status !== "completed") {
          acc.activeRequests++;
        }

        if (request.status === "ongoing") {
          acc.ongoingCount++;
        }

        if (request.isOverdue && request.status !== "ongoing") {
          acc.overdueCount++;
        }

        return acc;
      },
      { activeRequests: 0, ongoingCount: 0, overdueCount: 0 }
    );

    return {
      activeRequests,
      overdueCount,
      ongoingCount,
      newClientsToday,
    };
  }, [requestsWithTimers, newClientsToday]);

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
          title="New Clients Today"
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