import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UsageAnalytics } from '@/types/admin';
import { format } from 'date-fns';

interface AnalyticsChartsProps {
  analytics: UsageAnalytics | undefined;
  isLoading?: boolean;
}

const CHART_COLORS = {
  primary: '#7B8CFF',
  lightOrange: '#FFD39C',
  deepOrange: '#FFA86B',
  softYellow: '#FFECA7',
  palePink: '#F6AFFF',
  lavender: '#E9E4FF',
  green: '#10B981',
  red: '#EF4444',
};

export function AnalyticsCharts({ analytics, isLoading }: AnalyticsChartsProps) {
  const sessionData = useMemo(() => {
    if (!analytics?.sessions.daily) return [];
    return analytics.sessions.daily.map((item) => ({
      date: format(new Date(item.date), 'MMM d'),
      sessions: item.value,
    }));
  }, [analytics]);

  const tokenData = useMemo(() => {
    if (!analytics?.tokens.daily) return [];
    return analytics.tokens.daily.map((item) => ({
      date: format(new Date(item.date), 'MMM d'),
      tokens: item.value,
    }));
  }, [analytics]);

  const webhookData = useMemo(() => {
    if (!analytics?.webhooks.daily) return [];
    return analytics.webhooks.daily.map((item) => ({
      date: format(new Date(item.date), 'MMM d'),
      successful: item.value * (analytics.webhooks.success_rate / 100),
      failed: item.value * (1 - analytics.webhooks.success_rate / 100),
    }));
  }, [analytics]);

  const agentData = useMemo(() => {
    if (!analytics?.agents.top_agents) return [];
    return analytics.agents.top_agents.slice(0, 5).map((agent) => ({
      name: agent.agent_name.length > 15 
        ? agent.agent_name.substring(0, 15) + '...' 
        : agent.agent_name,
      value: agent.value,
    }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-pale-gray rounded" />
              <div className="h-4 w-48 bg-pale-gray rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-pale-gray rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-medium-gray">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sessions.total.toLocaleString()}</div>
            <p className="text-xs text-medium-gray mt-1">
              {analytics.sessions.completion_rate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.tokens.total_used.toLocaleString()}
            </div>
            <p className="text-xs text-medium-gray mt-1">
              Avg: {analytics.tokens.average_per_session.toLocaleString()} per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.webhooks.success_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-medium-gray mt-1">
              {analytics.webhooks.successful.toLocaleString()} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.agents.published}</div>
            <p className="text-xs text-medium-gray mt-1">
              {analytics.agents.total} total agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions Over Time</CardTitle>
            <CardDescription>Daily session count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lavender} />
                <XAxis dataKey="date" stroke={CHART_COLORS.primary} />
                <YAxis stroke={CHART_COLORS.primary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECECEC',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tokens Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
            <CardDescription>Daily token consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lavender} />
                <XAxis dataKey="date" stroke={CHART_COLORS.primary} />
                <YAxis stroke={CHART_COLORS.primary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECECEC',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="tokens" fill={CHART_COLORS.lightOrange} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Webhook Success Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Delivery</CardTitle>
            <CardDescription>Success vs failed webhooks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={webhookData}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lavender} />
                <XAxis dataKey="date" stroke={CHART_COLORS.primary} />
                <YAxis stroke={CHART_COLORS.primary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECECEC',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="successful" stackId="a" fill={CHART_COLORS.green} radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill={CHART_COLORS.red} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Agents Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
            <CardDescription>Most active agents</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentData.map((_entry, index) => {
                    const colors = [
                      CHART_COLORS.primary,
                      CHART_COLORS.lightOrange,
                      CHART_COLORS.deepOrange,
                      CHART_COLORS.softYellow,
                      CHART_COLORS.palePink,
                    ];
                    return (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ECECEC',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
