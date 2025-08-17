import { BarChart3, Users, UserCheck } from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  // { title: "Clients", url: "/clients", icon: Users },
  { title: "Agent", url: "/agent", icon: UserCheck },
  { title: "Manager", url: "/manager", icon: Users },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r py-20">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} end>
                    {({ isActive }) => (
                      <SidebarMenuButton isSelected={isActive} asChild>
                        <div
                          className={`flex items-center gap-3 rounded-lg p-6 text-sm font-medium transition-colors active:bg-card ${
                            isActive
                              ? "bg-card hover:bg-card text-accent-foreground"
                              : "text-muted-foreground hover:bg-card hover:text-accent-foreground"
                          }`}
                        >
                          <item.icon className="h-6 w-6" />
                          <span className="text-[18px]">{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
