"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Send, User, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Types matching backend
type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
};

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Session & Load History
    useEffect(() => {
        const storedSessionId = localStorage.getItem("chatSessionId");
        if (storedSessionId) {
            setSessionId(storedSessionId);
            fetchHistory(storedSessionId);
        } else {
            // First time load - show welcome message if no history
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Hello! I'm your intelligent medical assistant. I can help answer questions about your prescriptions, side effects, or general health. How can I assist you today?",
                },
            ]);
        }
    }, []);

    const fetchHistory = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8000/chat/history/${id}`);
            if (res.ok) {
                const history = await res.json();
                if (history.length > 0) {
                    setMessages(history.map((msg: any) => ({
                        id: msg.id.toString(),
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp)
                    })));
                } else {
                    setMessages([
                        {
                            id: "welcome",
                            role: "assistant",
                            content: "Hello! I'm your intelligent medical assistant. I can help answer questions about your prescriptions, side effects, or general health. How can I assist you today?",
                        },
                    ]);
                }
            }
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            // Get patient profile from localStorage
            const savedProfile = localStorage.getItem("patientProfile");
            const patientProfile = savedProfile ? JSON.parse(savedProfile) : null;

            // Get extracted medicines from localStorage (if any)
            // Assuming the prescription page saves this to localStorage for shared context usage
            // For now passing empty or we could add a context provider in future
            const medicines: any[] = [];

            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentInput,
                    session_id: sessionId, // Send current session ID if exists
                    patient_profile: patientProfile,
                    medicines: medicines,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();

            // Store new session ID if it was created
            if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
                localStorage.setItem("chatSessionId", data.session_id);
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please make sure the backend server uses a valid OpenAI API Key.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem("chatSessionId");
        setSessionId(null);
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: "Chat history cleared. How can I help you today?",
                timestamp: new Date(),
            },
        ]);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Medical Assistant</h1>
                    <p className="text-muted-foreground">
                        Ask questions about your medicines and health conditions.
                    </p>
                </div>
                {sessionId && (
                    <Button variant="outline" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Clear History
                    </Button>
                )}
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg bg-background/50 backdrop-blur-sm">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-2 md:max-w-[80%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                )}
                            >
                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div
                                className={cn(
                                    "rounded-lg px-4 py-2 text-sm shadow-sm whitespace-pre-wrap", /* added whitespace-pre-wrap for markdown newlines */
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex w-full gap-2 md:max-w-[80%] mr-auto">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted text-foreground">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-lg px-4 py-2 text-sm bg-card border flex items-center gap-2">
                                <span className="flex gap-1">
                                    <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-1.5 w-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-background/50">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <input
                            className="flex-1 min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ask about your medicines..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
