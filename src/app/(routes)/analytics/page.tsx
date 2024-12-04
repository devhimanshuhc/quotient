'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Clock, FileText, BarChart2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageTransition from '@/components/animations/PageTransition';

interface DailyStats {
  date: string;
  writingCount: number;
  contentLength: number;
  updatedCount: number;
}

interface AnalyticsData {
  totalWritings: number;
  totalContentLength: number;
  averageContentLength: number;
  totalTimeSpent: number;
  totalUpdates: number;
  dailyStats: DailyStats[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        
        // Format dates in the data
        const formattedData = {
          ...data,
          dailyStats: data.dailyStats.map((stat: DailyStats) => ({
            ...stat,
            date: new Date(stat.date).toLocaleString('default', { 
              month: 'short',
              day: 'numeric'
            })
          }))
        };
        
        setAnalytics(formattedData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    {
      title: 'Total Writings',
      value: analytics.totalWritings,
      icon: FileText,
      description: 'Total number of writings created',
    },
    {
      title: 'Time Spent',
      value: formatTime(analytics.totalTimeSpent),
      icon: Clock,
      description: 'Total time spent writing',
    },
    {
      title: 'Avg. Length',
      value: formatNumber(analytics.averageContentLength),
      icon: BarChart2,
      description: 'Average characters per writing',
    },
    {
      title: 'Updates',
      value: analytics.totalUpdates,
      icon: RefreshCw,
      description: 'Total number of revisions',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <PageTransition>
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-fraunces">Analytics</h1>
            <p className="mt-2 text-gray-200 max-w-xl">Track your writing progress and habits over time.</p>
          </div>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Daily Activity</h2>
              <p className="text-sm text-muted-foreground">
                Your writing frequency over the last 30 days
              </p>
            </div>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={analytics.dailyStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "hsl(var(--border))",
                      strokeWidth: 1,
                      strokeDasharray: "3 3"
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="writingCount" 
                    name="Writings" 
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{
                      r: 2,
                      fill: "hsl(var(--background))",
                      stroke: "hsl(var(--foreground))",
                      strokeWidth: 1.5
                    }}
                    activeDot={{
                      r: 4,
                      fill: "hsl(var(--foreground))"
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="updatedCount" 
                    name="Updates"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    dot={{
                      r: 2,
                      fill: "hsl(var(--background))",
                      stroke: "hsl(var(--muted-foreground))",
                      strokeWidth: 1.5
                    }}
                    activeDot={{
                      r: 4,
                      fill: "hsl(var(--muted-foreground))"
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Content Length Trends</h2>
              <p className="text-sm text-muted-foreground">
                Characters written per day
              </p>
            </div>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={analytics.dailyStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => (value / 1000).toFixed(1) + 'k'}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{
                      stroke: "hsl(var(--border))",
                      strokeWidth: 1,
                      strokeDasharray: "3 3"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="contentLength"
                    name="Content Length"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    dot={{
                      r: 2,
                      fill: "hsl(var(--background))",
                      stroke: "hsl(var(--foreground))",
                      strokeWidth: 1.5
                    }}
                    activeDot={{
                      r: 4,
                      fill: "hsl(var(--foreground))"
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
