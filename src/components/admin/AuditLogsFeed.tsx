import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Loader2,
  FileText,
  User,
  CreditCard,
  Bot,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAdmin';
import type { AuditLog, AuditLogFilter } from '@/types/admin';

export function AuditLogsFeed() {
  const [filter, setFilter] = useState<AuditLogFilter>({
    page: 1,
    limit: 50,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: auditLogsResponse, isLoading } = useAuditLogs({
    ...filter,
    search: searchQuery || undefined,
  });

  const getActionIcon = (actionType: AuditLog['action_type']) => {
    switch (actionType) {
      case 'user_role_change':
      case 'user_deactivation':
      case 'user_invitation':
        return <User className="h-4 w-4" />;
      case 'billing_update':
        return <CreditCard className="h-4 w-4" />;
      case 'agent_publish':
      case 'agent_delete':
        return <Bot className="h-4 w-4" />;
      case 'settings_change':
        return <Settings className="h-4 w-4" />;
      case 'security_event':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: AuditLog['action_type']) => {
    switch (actionType) {
      case 'user_role_change':
      case 'user_invitation':
        return 'bg-light-blue/20 text-light-blue';
      case 'user_deactivation':
      case 'agent_delete':
      case 'security_event':
        return 'bg-red-500/20 text-red-700';
      case 'billing_update':
        return 'bg-soft-yellow/20 text-charcoal';
      case 'agent_publish':
        return 'bg-green-500/20 text-green-700';
      case 'settings_change':
        return 'bg-lavender/20 text-charcoal';
      default:
        return 'bg-medium-gray/20 text-medium-gray';
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, page: 1, search: searchQuery || undefined });
  };

  const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
    setFilter({
      ...filter,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const logs = auditLogsResponse?.logs || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Track all system activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
              <Input
                type="search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Action Type Filter */}
            <Select
              value={filter.action_type || 'all'}
              onValueChange={(value) => handleFilterChange('action_type', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user_role_change">Role Changes</SelectItem>
                <SelectItem value="user_deactivation">Deactivations</SelectItem>
                <SelectItem value="user_invitation">Invitations</SelectItem>
                <SelectItem value="billing_update">Billing Updates</SelectItem>
                <SelectItem value="agent_publish">Agent Publishing</SelectItem>
                <SelectItem value="agent_delete">Agent Deletion</SelectItem>
                <SelectItem value="settings_change">Settings Changes</SelectItem>
                <SelectItem value="security_event">Security Events</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Feed */}
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="animate-fade-in-up">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${getActionColor(log.action_type)}`}
                  >
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getActionColor(log.action_type)}>
                        {log.action_type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-medium-gray">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-charcoal">
                      {log.action_description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-medium-gray">
                      {log.user_name && (
                        <span>
                          <User className="inline h-3 w-3 mr-1" />
                          {log.user_name}
                          {log.user_email && ` (${log.user_email})`}
                        </span>
                      )}
                      {log.resource_type && (
                        <span>
                          Resource: {log.resource_type}
                          {log.resource_id && ` #${log.resource_id}`}
                        </span>
                      )}
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-medium-gray cursor-pointer hover:text-charcoal">
                          View Details
                        </summary>
                        <div className="mt-2 bg-pale-gray/50 rounded-lg p-3">
                          <pre className="text-xs text-charcoal overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-medium-gray mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              No audit logs found
            </h3>
            <p className="text-medium-gray">
              {searchQuery || filter.action_type
                ? 'Try adjusting your search or filter criteria'
                : 'No activity has been logged yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {auditLogsResponse && auditLogsResponse.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-medium-gray">
            Showing page {auditLogsResponse.page} of {auditLogsResponse.total_pages} (
            {auditLogsResponse.total} total logs)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setFilter({ ...filter, page: (filter.page || 1) - 1 })
              }
              disabled={!filter.page || filter.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setFilter({ ...filter, page: (filter.page || 1) + 1 })
              }
              disabled={
                !auditLogsResponse ||
                auditLogsResponse.page >= auditLogsResponse.total_pages
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
