
import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Terms of Use page - Static legal content page
 */
const Terms: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link to="/shopify-login">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <PageHeader 
          title="Terms of Use" 
          description="Last updated: April 10, 2025"
        />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4 text-muted-foreground">
              Welcome to ShopAI Insight. These Terms of Use govern your use of our website and services. 
              By using ShopAI Insight, you agree to these terms. Please read them carefully.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Use of Services</h2>
            <p className="mb-4 text-muted-foreground">
              Our services are designed to help Shopify merchants analyze and improve their store performance.
              You may use our services only as permitted by these terms and any applicable laws.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Privacy</h2>
            <p className="mb-4 text-muted-foreground">
              Your privacy is important to us. Our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> explains 
              how we collect, use, and protect your information when you use our services.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Account Security</h2>
            <p className="mb-4 text-muted-foreground">
              You are responsible for safeguarding your account and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Content Ownership</h2>
            <p className="mb-4 text-muted-foreground">
              ShopAI Insight does not claim ownership of your store's data. You retain all rights to your content.
            </p>
            
            {/* Placeholder sections that can be replaced with actual content later */}
            <h2 className="text-xl font-semibold mb-4">6. Limitations</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Limitations section. Replace with actual terms.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Governing Law</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Governing Law section. Replace with actual terms.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Changes to Terms section. Replace with actual terms.
            </p>

            <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
            <p className="mb-4 text-muted-foreground">
              If you have any questions about these Terms, please contact us at support@shopaiinsight.com
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground pb-8">
        © 2025 ShopAI Insight. All rights reserved.
      </div>
    </div>
  );
};

export default Terms;
