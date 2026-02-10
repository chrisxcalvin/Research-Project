"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Bot, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 font-sans">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              MediLens-360
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#" className="hover:text-primary transition-colors">How it works</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button className="rounded-full px-6 shadow-md shadow-primary/10">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-6">
              ✨ Reimagining Medicine Safety
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Intelligent Prescription <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Analysis & Safety
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Your AI-powered health companion. Digitize prescriptions, verify medicine safety, and get personalized health advice instantly with our advanced RAG assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
                Analyze Prescription <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-32">
          <FeatureCard
            icon={<FileText className="h-7 w-7 text-primary" />}
            title="Smart Digitization"
            description="Upload handwritten prescriptions and convert them into clear, digital schedules using advanced OCR."
            delay={0.6}
          />
          <FeatureCard
            icon={<ShieldCheck className="h-7 w-7 text-primary" />}
            title="Safety Verification"
            description="Verify medicine brands, check ingredients, and get instant safety alerts for allergies and interactions."
            delay={0.7}
          />
          <FeatureCard
            icon={<Bot className="h-7 w-7 text-primary" />}
            title="AI Health Assistant"
            description="Ask questions about your medicines, side effects, and diet interactions with our context-aware RAG chatbot."
            delay={0.8}
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full border-muted/40 shadow-lg shadow-slate-200/50 dark:shadow-none bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-12 w-12 rounded-xl bg-secondary/80 flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
