import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { SystemAlertsPanel } from '@/components/admin/SystemAlertsPanel';
import { AuditLogsFeed } from '@/components/admin/AuditLogsFeed';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import {
  Users,
  BarChart3,
  Bell,
  FileText,
  Plus,
  Calendar,
} from 'lucide-react';
import { useAdminUsers, useUsageAnalytics } from '@/hooks/useAdmin';
import { Input } from '@/components/ui/input';
import { format, subDays } from 'date-fns';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: analytics, isLoading: analyticsLoading } = useUsageAnalytics(
    dateRange.from,
    dateRange.to
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-medium-gray mt-1">
            Manage workspace, users, and system analytics
          </p>
        </div>
        {activeTab === 'users' && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage workspace members, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={users || []}
                isLoading={usersLoading}
                onInviteClick={() => setInviteDialogOpen(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>
                    Monitor system usage, sessions, tokens, and webhooks
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-medium-gray" />
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                    className="w-[140px]"
                  />
                  <span className="text-medium-gray">to</span>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                    className="w-[140px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts
                analytics={analytics}
                isLoading={analyticsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <SystemAlertsPanel />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <AuditLogsFeed />
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
