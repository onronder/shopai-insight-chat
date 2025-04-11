import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface HelpArticle {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface HelpCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

const Help: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasArticles, setHasArticles] = useState(true);
  
  const helpCategories: HelpCategory[] = [
    {
      id: "general",
      label: "General",
      icon: <Info className="h-4 w-4" />,
      articles: [
        {
          id: "getting-started",
          title: "Getting Started with ShopAI Insight",
          content: (
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
              <p>
                Our platform automatically analyzes your store data and provides actionable insights using advanced AI technology.
              </p>
            </div>
          )
        },
        {
          id: "account-setup",
          title: "Account Setup and Customization",
          content: (
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
          )
        }
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      articles: [
        {
          id: "dashboard-overview",
          title: "Understanding Your Analytics Dashboard",
          content: (
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
              <p>
                Use the date range selector to view data for different time periods, and hover over charts for detailed tooltips.
              </p>
            </div>
          )
        },
        {
          id: "custom-reports",
          title: "Creating Custom Reports",
          content: (
            <div className="space-y-4">
              <p>
                ShopAI Insight allows you to create custom reports tailored to your specific business needs.
              </p>
              <h4 className="text-md font-medium">To create a custom report:</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Navigate to the Analytics section</li>
                <li>Click "Create Custom Report" button</li>
                <li>Select metrics and dimensions from the available options</li>
                <li>Choose visualization type (chart, table, etc.)</li>
                <li>Save your report with a unique name</li>
              </ol>
              <p>
                Saved reports appear in your dashboard and can be scheduled for email delivery.
              </p>
            </div>
          )
        }
      ]
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: <Bot className="h-4 w-4" />,
      articles: [
        {
          id: "ai-assistant-intro",
          title: "How to Use the AI Assistant",
          content: (
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
              <p>
                The more you use the AI Assistant, the better it becomes at understanding your specific needs and store context.
              </p>
            </div>
          )
        },
        {
          id: "ai-insights",
          title: "Understanding AI-Generated Insights",
          content: (
            <div className="space-y-4">
              <p>
                ShopAI Insight automatically generates intelligent observations from your store data, helping you discover opportunities you might miss.
              </p>
              <h4 className="text-md font-medium">AI insights can help you:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Identify sudden changes in customer behavior</li>
                <li>Spot underperforming products or categories</li>
                <li>Detect pricing opportunities</li>
                <li>Forecast inventory needs</li>
                <li>Recognize customer segments with growth potential</li>
              </ul>
              <p>
                Look for insight cards throughout your dashboard or ask the AI Assistant for specific recommendations.
              </p>
            </div>
          )
        }
      ]
    },
    {
      id: "billing",
      label: "Billing & Subscriptions",
      icon: <CreditCard className="h-4 w-4" />,
      articles: [
        {
          id: "pricing-plans",
          title: "Understanding Our Pricing Plans",
          content: (
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
              <p>
                Visit the Settings page and navigate to Subscription & Billing to manage your plan.
              </p>
            </div>
          )
        },
        {
          id: "payment-issues",
          title: "Resolving Payment Issues",
          content: (
            <div className="space-y-4">
              <p>
                If you're experiencing issues with payments or billing, here are some common solutions:
              </p>
              <h4 className="text-md font-medium">Troubleshooting steps:</h4>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Verify your payment method is current and has sufficient funds</li>
                <li>Check that your billing address matches your card information</li>
                <li>Ensure your Shopify billing permissions are properly configured</li>
                <li>Contact your payment provider to authorize recurring payments</li>
              </ol>
              <p>
                If you continue to experience issues, please contact our support team for assistance.
              </p>
            </div>
          )
        }
      ]
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: <Shield className="h-4 w-4" />,
      articles: [
        {
          id: "data-handling",
          title: "How We Handle Your Data",
          content: (
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
              <p>
                For detailed information, please review our complete Privacy Policy.
              </p>
            </div>
          )
        },
        {
          id: "gdpr-compliance",
          title: "GDPR and CCPA Compliance",
          content: (
            <div className="space-y-4">
              <p>
                ShopAI Insight is fully compliant with major privacy regulations including GDPR and CCPA.
              </p>
              <h4 className="text-md font-medium">Your rights include:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Right to access your data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to delete your data</li>
                <li>Right to data portability</li>
                <li>Right to object to data processing</li>
              </ul>
              <p>
                To exercise any of these rights, visit the Privacy section in Settings or contact our Data Protection Officer.
              </p>
            </div>
          )
        }
      ]
    }
  ];

  React.useEffect(() => {
    if (helpCategories.length > 0 && helpCategories[0].articles.length > 0) {
      setSelectedArticle(helpCategories[0].articles[0]);
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleArticleSelect = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    console.log(`User found article ${selectedArticle?.id} ${type}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-7xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-12 w-full mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-80 md:col-span-1" />
            <Skeleton className="h-80 md:col-span-3" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasArticles || helpCategories.length === 0) {
    return (
      <AppLayout>
        <div className="container py-6 max-w-7xl">
          <EmptyState
            title="Help articles are unavailable"
            description="We're currently updating our help documentation. Please check back later."
            actionLabel="Contact Support"
            onAction={() => console.log("Contact support clicked")}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Help & Support</h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search help topics..." 
            className="pl-10 w-full md:w-96"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Tabs 
              defaultValue="general" 
              className="w-full" 
              orientation="vertical"
              onValueChange={(value) => {
                const category = helpCategories.find(c => c.id === value);
                if (category && category.articles.length > 0) {
                  setSelectedArticle(category.articles[0]);
                }
              }}
            >
              <TabsList className="flex flex-col h-auto w-full bg-card rounded-md p-1 md:space-y-1">
                {helpCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id}
                    className="justify-start w-full text-left gap-2 px-3 py-2 h-auto"
                  >
                    {category.icon}
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {helpCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="hidden md:block">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">{category.label} Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex flex-col">
                        {category.articles.map((article) => (
                          <Button
                            key={article.id}
                            variant="ghost"
                            className={`justify-start rounded-none text-left px-4 py-2 ${
                              selectedArticle?.id === article.id ? 'bg-muted font-medium' : ''
                            }`}
                            onClick={() => handleArticleSelect(article)}
                          >
                            {article.title}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="md:col-span-3">
            {selectedArticle && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedArticle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedArticle.content}
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Was this article helpful?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleFeedback('helpful')}>
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFeedback('not-helpful')}>
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Still need help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Can't find what you're looking for? Our support team is ready to assist you.</p>
                <Button className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
                <p className="text-sm text-muted-foreground mt-2">We usually respond within 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
