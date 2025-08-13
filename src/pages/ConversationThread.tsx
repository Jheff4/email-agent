import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: string
  sender: "client" | "staff"
  content: string
  timestamp: Date
  isRead: boolean
}

interface ConversationThreadProps {
  requestId: string
  onBack: () => void
}

// Mock conversation data
const mockConversation = {
  client: {
    name: "John Smith",
    email: "john@example.com",
    avatar: ""
  },
  staff: {
    name: "Sarah Wilson",
    avatar: ""
  },
  status: "Pending" as const,
  timeLeft: "6h 23m",
  messages: [
    {
      id: "1",
      sender: "client" as const,
      content: "Hi, I need help with setting up my new account. The verification email hasn't arrived yet.",
      timestamp: new Date("2024-01-20T10:30:00"),
      isRead: true
    },
    {
      id: "2",
      sender: "staff" as const,
      content: "Hello John! I'd be happy to help you with that. Let me check your account status. Can you please confirm the email address you used for registration?",
      timestamp: new Date("2024-01-20T10:45:00"),
      isRead: true
    },
    {
      id: "3",
      sender: "client" as const,
      content: "Yes, it's john@example.com. I've checked my spam folder too but nothing there.",
      timestamp: new Date("2024-01-20T10:47:00"),
      isRead: true
    },
    {
      id: "4",
      sender: "staff" as const,
      content: "I can see the issue. There was a temporary delay in our email service. I've manually verified your account and sent a new welcome email. You should receive it within the next few minutes.",
      timestamp: new Date("2024-01-20T11:00:00"),
      isRead: true
    },
    {
      id: "5",
      sender: "client" as const,
      content: "Perfect! I just received it. Thank you so much for the quick help. Is there anything else I need to do to complete the setup?",
      timestamp: new Date("2024-01-20T11:05:00"),
      isRead: false
    }
  ]
}

export default function ConversationThread({ requestId, onBack }: ConversationThreadProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(3600)
  const [reassignOpen, setReassignOpen] = useState(false)
  const [assignee, setAssignee] = useState<string>("")
  const staffOptions = ["Sarah Wilson", "Mike Johnson", "Lisa Chen", "David Kim", "Emma White"]

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const overdue = remainingSeconds <= 0
  const effectiveStatus = overdue ? "Overdue" : "Ongoing"

  const formatDuration = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault()
  //     handleSendMessage()
  //   }
  // }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="border-b bg-background p-4 max-md:p-0">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mockConversation.client.avatar} />
                <AvatarFallback>
                  {getInitials(mockConversation.client.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{mockConversation.client.name}</h2>
                <p className="text-sm text-muted-foreground">{mockConversation.client.email}</p>
              </div>
            </div>
          </div>
          <div className="flex max-md:w-full gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={overdue ? "destructive" : "secondary"}>{effectiveStatus}</Badge>
              <span className={`text-sm ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {overdue ? "Overdue" : `Time left: ${formatDuration(remainingSeconds)}`}
              </span>
            </div>
            <Button className="max-md:mb-1" variant="outline" size="sm" onClick={() => setReassignOpen(true)}>
              Reassign
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select staff</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassignOpen(false)}>Cancel</Button>
            <Button onClick={() => setReassignOpen(false)} disabled={!assignee}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 max-md:p-0">
        <div className="space-y-4">
          {mockConversation.messages.map((message, index) => {
            const prevMessage = mockConversation.messages[index - 1]
            const showDate =
              index === 0 ||
              formatDate(message.timestamp) !== formatDate(prevMessage.timestamp)            
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${message.sender === "staff" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[70%] ${message.sender === "staff" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender === "client" ? mockConversation.client.avatar : mockConversation.staff.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(message.sender === "client" ? mockConversation.client.name : mockConversation.staff.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`space-y-1 ${message.sender === "staff" ? "text-right" : ""}`}>
                      <Card className={`${message.sender === "staff" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <CardContent className="p-3">
                          <p className="text-sm">{message.content}</p>
                        </CardContent>
                      </Card>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === "staff" && (
                          <span>{message.isRead ? "Read" : "Sent"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      {/* <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[40px]"
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
    </div>
  )
}