import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: "default" | "warning" | "success" | "info" | "destructive"
}

export function MetricCard({ title, value, icon: Icon, variant = "default" }: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "text-warning"
      case "success":
        return "text-success"
      case "info":
        return "text-info"
      case "destructive":
        return "text-destructive"
      default:
        return "text-primary"
    }
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${getVariantStyles()}`} />
        </div>
      </CardContent>
    </Card>
  )
}