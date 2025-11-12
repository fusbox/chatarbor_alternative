import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, BrainCircuit, Clock } from "lucide-react";
import { motion, Easing } from "framer-motion";
import { KnowledgeDocument } from "@/lib/types";
import { formatDistanceToNow, format } from 'date-fns';
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
interface DashboardViewProps {
  documentCount: number;
  queryCount: number;
  recentDocuments: KnowledgeDocument[];
  allDocuments: KnowledgeDocument[];
  isLoading: boolean;
}
export function DashboardView({ documentCount, queryCount, recentDocuments, allDocuments, isLoading }: DashboardViewProps) {
  const stats = [
    {
      title: "Documents in Knowledge Base",
      value: documentCount,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Recent Test Queries",
      value: queryCount,
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "System Status",
      value: "Operational",
      icon: BrainCircuit,
      color: "text-purple-500",
    },
  ];
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as Easing,
      },
    }),
  };
  const chartData = useMemo(() => {
    if (!allDocuments || allDocuments.length === 0) return [];
    const docsByDate = allDocuments.reduce((acc, doc) => {
      const date = format(new Date(doc.createdAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);
    const sortedDates = Object.keys(docsByDate).sort();
    return sortedDates.map(date => ({
      name: format(new Date(date), 'MMM d'),
      documents: docsByDate[date],
    })).slice(-7); // Show last 7 days of activity
  }, [allDocuments]);
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h2>
        <p className="text-muted-foreground">
          An at-a-glance overview of the CareerForge AI system.
        </p>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-brand-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentDocuments.length > 0 ? (
              <ul className="space-y-4">
                {recentDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.updatedAt ? `Updated ${formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}` : 'Update time not available'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent document activity. Add or edit a document in the Knowledge Base.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="documents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-center">
                <p>Not enough data to display chart. <br />Add documents to see growth.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}