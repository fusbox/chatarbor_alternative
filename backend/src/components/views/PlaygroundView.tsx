import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User, Send, Loader2, BookOpen, Copy, Check, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  context?: string;
}
type FeedbackStatus = 'liked' | 'disliked' | null;
interface PlaygroundViewProps {
  onQuerySubmit: () => void;
}
export function PlaygroundView({ onQuerySubmit }: PlaygroundViewProps) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [latestContext, setLatestContext] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, FeedbackStatus>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, streamingMessage]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };
  const handleFeedback = (messageId: string, newFeedback: 'liked' | 'disliked') => {
    setFeedback(prev => {
      const currentFeedback = prev[messageId];
      if (currentFeedback === newFeedback) {
        // If clicking the same button again, remove feedback
        const { [messageId]: _, ...rest } = prev;
        return rest;
      }
      // Otherwise, set new feedback
      return { ...prev, [messageId]: newFeedback };
    });
    toast.success("Thank you for your feedback!");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onQuerySubmit();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");
    setLatestContext(null);
    try {
      const response = await fetch(`/api/chat/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, stream: true }),
      });
      if (!response.ok || !response.body) {
        throw new Error("API call failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        const contextMarker = "<CONTEXT>";
        if (accumulatedResponse.includes(contextMarker)) {
            const parts = accumulatedResponse.split(contextMarker);
            setStreamingMessage(parts[0]);
            const contextContent = parts[1].replace("</CONTEXT>", "").trim();
            if(contextContent) {
              setLatestContext(contextContent);
            }
        } else {
            setStreamingMessage(accumulatedResponse);
        }
      }
      const finalContent = accumulatedResponse.split("<CONTEXT>")[0].trim();
      if (finalContent) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: finalContent,
          context: latestContext ?? undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingMessage("");
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
      <div className="lg:col-span-2 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Bot /> AI Playground
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                    <Sparkles className="h-10 w-10 mb-4 text-brand-500" />
                    <p className="text-lg font-medium">Start a conversation</p>
                    <p className="text-sm">Ask me anything about career advice, resumes, or interviews!</p>
                  </div>
                )}
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex items-start gap-3 group",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Bot size={16} />
                        </div>
                      )}
                      <div className="relative">
                        <div
                          className={cn(
                            "rounded-lg p-3 max-w-md",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleFeedback(msg.id, 'liked')}
                            >
                              <ThumbsUp className={cn("h-4 w-4", feedback[msg.id] === 'liked' && "text-green-500 fill-green-500/20")} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleFeedback(msg.id, 'disliked')}
                            >
                              <ThumbsDown className={cn("h-4 w-4", feedback[msg.id] === 'disliked' && "text-red-500 fill-red-500/20")} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleCopy(msg.content, msg.id)}
                            >
                              {copiedMessageId === msg.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="bg-muted rounded-full p-2">
                          <User size={16} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 justify-start"
                  >
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Bot size={16} />
                    </div>
                    <div className="rounded-lg p-3 max-w-md bg-muted">
                      <p className="whitespace-pre-wrap">{streamingMessage}<span className="animate-pulse">|</span></p>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
            <Separator />
            <form onSubmit={handleSubmit} className="flex items-start gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question to test the AI..."
                className="flex-1 resize-none max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <BookOpen /> Retrieved Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {isLoading && !latestContext ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : latestContext ? (
                <div className="prose prose-sm dark:prose-invert bg-muted/50 p-4 rounded-md">
                  <p>{latestContext}</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Context used for the latest response will appear here.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}