
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
          description="Effective Date: April 13, 2025"
        />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <p className="mb-4 text-muted-foreground">
              Welcome to ShopAI Insight, a product of <strong>Fittechs Yazilim AS</strong> ("Company," "we," or "us"). 
              These Terms of Use ("Terms") govern your access to and use of the ShopAI Insight application, 
              services, features, and website (collectively, the "Services"). By accessing or using our 
              Services, you agree to be bound by these Terms.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4 text-muted-foreground">
              By clicking "Connect your Shopify Store," or by otherwise accessing or using ShopAI Insight, you represent that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">You are at least 18 years of age or of legal age in your jurisdiction.</li>
              <li className="mb-2">You have authority to bind your company to these Terms.</li>
              <li className="mb-2">You consent to these Terms and our Privacy Policy.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              If you do not agree, do not use our Services.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">2. Account Registration and Shopify Authorization</h2>
            <p className="mb-4 text-muted-foreground">
              To use ShopAI Insight, you must:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Authorize the application through your Shopify store.</li>
              <li className="mb-2">Provide accurate information and keep it up-to-date.</li>
              <li className="mb-2">Maintain the confidentiality of your Shopify access tokens and account information.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              You are responsible for all activities that occur under your account.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">3. Access and Usage</h2>
            <p className="mb-4 text-muted-foreground">
              We grant you a limited, non-exclusive, non-transferable license to use the Services in accordance with these Terms. 
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Reverse engineer, modify, or copy any part of the Service.</li>
              <li className="mb-2">Use the Service in violation of any laws or Shopify's terms.</li>
              <li className="mb-2">Use any automated system (e.g. bots, scrapers) without our prior written consent.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">4. Data Usage & Ownership</h2>
            <p className="mb-4 text-muted-foreground">
              You retain ownership of the data imported from your Shopify store. By using ShopAI Insight, you grant us permission to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Store and process your data to generate insights.</li>
              <li className="mb-2">Aggregate and anonymize data for analytical and service improvement purposes.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              We will never sell your data or use it to compete with you.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">5. AI-Generated Content Disclaimer</h2>
            <p className="mb-4 text-muted-foreground">
              Some features include AI-powered responses and visualizations. These are provided for informational purposes only and:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Do not constitute professional advice.</li>
              <li className="mb-2">Should be independently verified where critical.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">6. Subscription & Billing</h2>
            <p className="mb-4 text-muted-foreground">
              If you use a paid plan:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Fees are billed monthly or annually based on your selection.</li>
              <li className="mb-2">You may cancel anytime, but no refunds are issued for the remaining period.</li>
              <li className="mb-2">We reserve the right to update pricing with notice.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
            <p className="mb-4 text-muted-foreground">
              We may suspend or terminate access to the Services without notice for:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Breach of these Terms.</li>
              <li className="mb-2">Legal requirements.</li>
              <li className="mb-2">Harmful activity or abuse.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              You may terminate your account by disconnecting your Shopify store.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-4 text-muted-foreground">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">ShopAI Insight and Fittechs Software AS shall not be liable for indirect, incidental, or consequential damages.</li>
              <li className="mb-2">Our liability is limited to the amount you paid for the Services in the last 3 months.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="mb-4 text-muted-foreground">
              We may revise these Terms at any time. Continued use of the Services indicates your acceptance. 
              Material changes will be notified via the application or email.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">10. Governing Law & Disputes</h2>
            <p className="mb-4 text-muted-foreground">
              These Terms are governed by the laws of Norway. Any disputes shall be subject to the exclusive 
              jurisdiction of the courts in Oslo, Norway.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
            <p className="mb-4 text-muted-foreground">
              For questions about these Terms, contact us at: <strong>support@fittechs.com</strong>
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
