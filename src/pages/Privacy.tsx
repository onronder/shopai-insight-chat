
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
          description="Last updated: April 10, 2025"
        />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4 text-muted-foreground">
              We collect information about your Shopify store, including but not limited to: order data, 
              product information, customer metrics, and store performance statistics. This is done with
              your explicit permission during the authorization process.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4 text-muted-foreground">
              We use your information to provide analytics, insights, and recommendations to help improve
              your store's performance. We may also use aggregated, anonymized data to improve our services.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
            <p className="mb-4 text-muted-foreground">
              We implement a variety of security measures to maintain the safety of your personal information
              and store data. Your data is encrypted in transit and at rest.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="mb-4 text-muted-foreground">
              We may use third-party services to help us operate our business and the ShopAI Insight platform. 
              These services may have access to your information only to perform tasks on our behalf.
            </p>
            
            {/* Placeholder sections that can be replaced with actual content later */}
            <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Your Rights section. Replace with actual privacy information.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Cookies section. Replace with actual privacy information.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Changes to Policy</h2>
            <p className="mb-4 text-muted-foreground">
              This is placeholder content for the Changes to Policy section. Replace with actual privacy information.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
            <p className="mb-4 text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@shopaiinsight.com
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
