
import React, { useState } from "react";
import { 
  Card, 
  CardContent,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Info, 
  BarChart3, 
  Bot, 
  CreditCard, 
  Shield, 
  Mail, 
  ThumbsUp, 
  ThumbsDown 
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";

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
        <div className="space-y-4">
          <p>
            Welcome to ShopAI Insight! This guide will help you understand how to use our analytics platform to grow your Shopify store.
          </p>
          <h4 className="text-md font-medium">Quick Start Steps:</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Connect your Shopify store via the authorization flow</li>
            <li>Allow initial data sync (this may take up to 30 minutes)</li>
            <li>Explore your dashboard with AI-powered insights</li>
            <li>Configure your AI Assistant to focus on your store goals</li>
          </ol>
        </div>
      ),
      category: "general"
    },
    {
      id: "account-setup",
      question: "How do I customize my account settings?",
      answer: (
        <div className="space-y-4">
          <p>
            Learn how to set up your account preferences and customize ShopAI Insight to match your workflow.
          </p>
          <h4 className="text-md font-medium">Account Settings:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Profile and notification preferences</li>
            <li>Dark/light mode configuration</li>
            <li>Default dashboard views</li>
            <li>User permissions (for team accounts)</li>
          </ul>
          <p>
            Visit the Settings page to customize these options and more.
          </p>
        </div>
      ),
      category: "general"
    },
    {
      id: "dashboard-overview",
      question: "How do I understand my analytics dashboard?",
      answer: (
        <div className="space-y-4">
          <p>
            Your analytics dashboard provides a comprehensive overview of your store's performance. Here's what each section means:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Sales Overview:</strong> Total revenue, order count, and average order value</li>
            <li><strong>Customer Insights:</strong> New vs returning customers, lifetime value, and churn risk</li>
            <li><strong>Product Performance:</strong> Best and worst selling products, inventory insights</li>
            <li><strong>Marketing Effectiveness:</strong> Channel attribution and campaign performance</li>
          </ul>
        </div>
      ),
      category: "analytics"
    },
    {
      id: "ai-assistant-intro",
      question: "How do I use the AI Assistant?",
      answer: (
        <div className="space-y-4">
          <p>
            The AI Assistant is your personal analytics expert, available 24/7 to answer questions about your store data.
          </p>
          <h4 className="text-md font-medium">Example questions you can ask:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>"What were my best selling products last month?"</li>
            <li>"Compare my sales performance to previous quarter"</li>
            <li>"Which customer segment has the highest churn rate?"</li>
            <li>"What's my average customer acquisition cost?"</li>
          </ul>
        </div>
      ),
      category: "ai-assistant"
    },
    {
      id: "pricing-plans",
      question: "What pricing plans are available?",
      answer: (
        <div className="space-y-4">
          <p>
            ShopAI Insight offers several pricing plans to accommodate businesses of all sizes.
          </p>
          <h4 className="text-md font-medium">Available plans:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Free:</strong> Basic analytics and limited AI features</li>
            <li><strong>Pro ($49/month):</strong> Full access to all analytics and AI features</li>
            <li><strong>Enterprise ($199/month):</strong> Advanced features, dedicated support, and custom integrations</li>
          </ul>
        </div>
      ),
      category: "billing"
    },
    {
      id: "data-handling",
      question: "How is my data handled and stored?",
      answer: (
        <div className="space-y-4">
          <p>
            ShopAI Insight takes data privacy seriously and adheres to the highest security standards.
          </p>
          <h4 className="text-md font-medium">Our data practices:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>All data is encrypted both in transit and at rest</li>
            <li>We never sell your data to third parties</li>
            <li>Store data is processed within your selected region</li>
            <li>You maintain full ownership of your data</li>
            <li>Data retention policies comply with GDPR and CCPA</li>
          </ul>
        </div>
      ),
      category: "privacy"
    }
  ];
  
  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Replace with actual API call for support message
    console.log("Contact form submitted:", { contactEmail, contactMessage });
    
    toast({
      title: "Message sent",
      description: "We've received your message and will respond shortly.",
    });
    
    // Reset form
    setContactEmail("");
    setContactMessage("");
  };
  
  // Filter FAQ items based on search query
  const filteredFAQs = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : faqItems;

  if (loading) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-12 w-full mb-8 rounded-2xl" />
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!hasContent) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-5xl mx-auto">
          <EmptyState
            title="Help center is unavailable"
            description="We're currently updating our help documentation. Please check back later."
            actionLabel="Contact Support"
            onAction={() => {
              console.log("Contact support clicked");
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Help & Support</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions or contact our support team</p>

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
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Thank you for your feedback" })}>
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Thank you for your feedback" })}>
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
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email address" 
                    className="rounded-xl"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    className="min-h-[120px] rounded-xl"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  <Mail className="h-4 w-4 mr-1" />
                  Send Message
                </Button>
                <p className="text-sm text-muted-foreground mt-2">We usually respond within 24 hours</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Help;
