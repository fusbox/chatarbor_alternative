import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { DashboardView } from "@/components/views/DashboardView";
import { KnowledgeBaseView } from "@/components/views/KnowledgeBaseView";
import { PlaygroundView } from "@/components/views/PlaygroundView";
import { LayoutDashboard, BookText, MessageSquare } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { ChatArborIcon } from "@/components/ChatArborIcon";
export function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [queryCount, setQueryCount] = useState(0);
  const { documents, isLoading } = useKnowledgeBase();
  const handleQuerySubmit = () => {
    setQueryCount(prevCount => prevCount + 1);
  };
  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [documents]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-8 md:py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <ChatArborIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              ChatArbor
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Administration dashboard for the ChatArbor AI assistant.
          </p>
        </header>
        <main>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3 bg-muted/50">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <BookText className="h-4 w-4" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="playground" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Playground
              </TabsTrigger>
            </TabsList>
            <div className="py-8">
              <TabsContent value="dashboard">
                <DashboardView
                  documentCount={documents.length}
                  queryCount={queryCount}
                  recentDocuments={recentDocuments}
                  allDocuments={documents}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="knowledge">
                <KnowledgeBaseView />
              </TabsContent>
              <TabsContent value="playground">
                <PlaygroundView onQuerySubmit={handleQuerySubmit} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t">
        Built with ❤️ at Cloudflare. AI requests may be rate-limited.
      </footer>
      <Toaster richColors />
    </div>
  );
}