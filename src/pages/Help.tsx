import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Info, BarChart3, Bot, CreditCard, Shield, Mail, ThumbsUp, ThumbsDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { PlanGate } from "@/components/auth/PlanGate";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Help: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories: FAQCategory[] = [
    { id: "general", label: "General", icon: <Info className="h-4 w-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "ai-assistant", label: "AI Assistant", icon: <Bot className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
    { id: "privacy", label: "Privacy", icon: <Shield className="h-4 w-4" /> }
  ];

  const faqItems: FAQItem[] = [
    {
      id: "getting-started",
      question: "How do I get started with ShopAI Insight?",
      answer: (
        <ol className="list-decimal pl-5 space-y-2">
          <li>Connect your Shopify store via the authorization flow</li>
          <li>Allow initial data sync (this may take up to 30 minutes)</li>
          <li>Explore your dashboard with AI-powered insights</li>
          <li>Configure your AI Assistant to focus on your store goals</li>
        </ol>
      ),
      category: "general"
    },
    {
      id: "account-setup",
      question: "How do I customize my account settings?",
      answer: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Profile and notification preferences</li>
          <li>Dark/light mode configuration</li>
          <li>Default dashboard views</li>
          <li>User permissions (for team accounts)</li>
        </ul>
      ),
      category: "general"
    },
    {
      id: "dashboard-overview",
      question: "How do I understand my analytics dashboard?",
      answer: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Sales Overview:</strong> Total revenue, order count, and AOV</li>
          <li><strong>Customer Insights:</strong> Lifetime value and churn risk</li>
          <li><strong>Product Performance:</strong> Best and worst sellers</li>
          <li><strong>Marketing:</strong> Attribution and campaign performance</li>
        </ul>
      ),
      category: "analytics"
    },
    {
      id: "ai-assistant-intro",
      question: "How do I use the AI Assistant?",
      answer: (
        <ul className="list-disc pl-5 space-y-2">
          <li>"What were my best selling products last month?"</li>
          <li>"Compare my sales performance to last quarter"</li>
          <li>"Which customer segment has highest churn?"</li>
        </ul>
      ),
      category: "ai-assistant"
    },
    {
      id: "pricing-plans",
      question: "What pricing plans are available?",
      answer: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Basic:</strong> Dashboard, Products, Orders, Help, Settings</li>
          <li><strong>Pro:</strong> All above + Customer, Store pages</li>
          <li><strong>Pro AI:</strong> Full access including AI Assistant</li>
        </ul>
      ),
      category: "billing"
    },
    {
      id: "data-handling",
      question: "How is my data handled and stored?",
      answer: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Encrypted at rest and in transit</li>
          <li>We never sell or share your data</li>
          <li>Compliant with GDPR and CCPA</li>
        </ul>
      ),
      category: "privacy"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent", description: "We'll respond shortly." });
    setContactEmail("");
    setContactMessage("");
  };

  const filteredFAQs = searchQuery
    ? faqItems.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqItems;

  if (loading) {
    return (
      <AppLayout>
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-12 w-full mb-8 rounded-2xl" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </AppLayout>
    );
  }

  if (!hasContent) {
    return (
      <AppLayout>
        <EmptyState
          title="Help center is unavailable"
          description="We're updating our help documentation."
          actionLabel="Contact Support"
        />
      </AppLayout>
    );
  }

  return (
    <PlanGate required="basic">
      <AppLayout>
        <div className="container py-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Help & Support</h1>
          <p className="text-muted-foreground mb-6">Find answers or contact support</p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help topics..."
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="rounded-2xl shadow-md mb-8">
            <CardHeader className="p-6">
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left font-medium">
                      <div className="flex items-center">
                        {faqCategories.find(cat => cat.id === faq.category)?.icon}
                        <span className="ml-2">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-sm text-muted-foreground">Was this helpful?</span>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Thank you!" })}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Yes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Thank you!" })}>
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          No
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardHeader className="p-6">
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleContactSubmit}>
                <div className="grid w-full gap-4">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="rounded-xl"
                    placeholder="Your email address"
                  />

                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea
                    id="message"
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="min-h-[120px] rounded-xl"
                    placeholder="How can we help you?"
                  />

                  <Button type="submit" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-1" />
                    Send Message
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </PlanGate>
  );
};

export default Help;
