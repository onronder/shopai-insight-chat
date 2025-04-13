
import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Privacy Policy page - Static legal content page
 */
const Privacy: React.FC = () => {
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
          title="Privacy Policy" 
          description="Effective Date: April 13, 2025"
        />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <p className="mb-4 text-muted-foreground">
              This Privacy Policy explains how <strong>Fittechs Yazilim AS</strong> ("Company," "we," or "us") collects, uses, stores, and protects personal data when you use ShopAI Insight ("Application," "Service," or "Platform").
            </p>
            <p className="mb-4 text-muted-foreground">
              We are committed to protecting your privacy and ensuring transparency in data handling practices in compliance with the <strong>General Data Protection Regulation (GDPR)</strong>, <strong>California Consumer Privacy Act (CCPA)</strong>, and other applicable regulations.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">1. Data We Collect</h2>
            <p className="mb-4 text-muted-foreground">
              When you connect your Shopify store and use ShopAI Insight, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2"><strong>Shopify-provided data:</strong> Store details, orders, products, customers, and other standard e-commerce data.</li>
              <li className="mb-2"><strong>Usage data:</strong> Analytics about your interaction with our platform (pages visited, query types, etc.).</li>
              <li className="mb-2"><strong>Optional user-input:</strong> Feedback, support inquiries, or manual configuration inputs.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              We do <strong>not</strong> collect or process payment details or sensitive personal data unless required and explicitly authorized.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Data</h2>
            <p className="mb-4 text-muted-foreground">
              We use your data to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Provide AI-powered insights and analytics.</li>
              <li className="mb-2">Personalize the dashboard and metrics.</li>
              <li className="mb-2">Improve our services and user experience.</li>
              <li className="mb-2">Troubleshoot issues and deliver support.</li>
              <li className="mb-2">Ensure security and monitor for misuse.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">3. Legal Basis for Processing</h2>
            <p className="mb-4 text-muted-foreground">
              Our processing of personal data is based on:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Your <strong>consent</strong>, given via checkbox acceptance.</li>
              <li className="mb-2">Fulfillment of a <strong>contract</strong> (our Terms of Use).</li>
              <li className="mb-2"><strong>Legitimate interests</strong> to improve and secure the platform.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">4. Data Sharing & Disclosure</h2>
            <p className="mb-4 text-muted-foreground">
              We do <strong>not sell</strong> or rent your personal data.
              We may share it only with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Third-party processors (e.g., hosting, analytics) under strict confidentiality and data protection agreements.</li>
              <li className="mb-2">Legal authorities if required by law or court order.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">5. AI-Specific Data Practices</h2>
            <p className="mb-4 text-muted-foreground">
              When using our AI features:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Input data may be used to generate responses and visualizations.</li>
              <li className="mb-2">Output is automatically deleted after generation.</li>
              <li className="mb-2">Data is never used for model training without explicit consent.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
            <p className="mb-4 text-muted-foreground">
              We retain your data for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Provide the services.</li>
              <li className="mb-2">Comply with legal obligations.</li>
              <li className="mb-2">Enforce our Terms.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              You can request deletion of your data at any time via <a href="mailto:legal@fittechs.com" className="text-primary hover:underline">legal@fittechs.com</a> or through your account.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">7. User Rights</h2>
            <p className="mb-4 text-muted-foreground">
              Depending on your location, you have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Access, correct, or delete your personal data.</li>
              <li className="mb-2">Withdraw consent at any time.</li>
              <li className="mb-2">Object to processing.</li>
              <li className="mb-2">Request data portability.</li>
            </ul>
            <p className="mb-4 text-muted-foreground">
              We respond to all valid requests within 30 days.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">8. Security Measures</h2>
            <p className="mb-4 text-muted-foreground">
              We implement industry-standard safeguards, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-muted-foreground">
              <li className="mb-2">Encryption (at rest and in transit).</li>
              <li className="mb-2">Access controls.</li>
              <li className="mb-2">Secure infrastructure.</li>
              <li className="mb-2">Periodic audits.</li>
            </ul>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="mb-4 text-muted-foreground">
              ShopAI Insight is not intended for individuals under 18. We do not knowingly collect data from children.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="mb-4 text-muted-foreground">
              We may update this Privacy Policy. Any material changes will be communicated via in-app notice or email.
            </p>

            <div className="my-6 border-t border-slate-200"></div>

            <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4 text-muted-foreground">
              For privacy-related inquiries:<br />
              <strong>Email:</strong> <a href="mailto:support@fittechs.com" className="text-primary hover:underline">support@fittechs.com</a><br />
              <strong>Address:</strong> Fittechs Yazilim AS, Yildiz Posta Caddesi Akin Sitesi 8/34 Gayrettepe Besiktas İstanbul Türkiye
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

export default Privacy;
