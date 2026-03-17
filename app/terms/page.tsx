import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - Pivtu",
  description: "Terms of Service for Pivtu VTU Service on Pi Network",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground">Terms of Service</h1>
            <p className="text-xs text-muted-foreground">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <p className="text-sm text-foreground">
            By using Pivtu, you agree to these terms. Please read them carefully before making any transactions.
          </p>
        </div>

        <div className="prose prose-sm prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                By accessing or using Pivtu ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">2. Service Description</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Pivtu is a Virtual Top-Up (VTU) service that allows users to purchase mobile data bundles using Pi cryptocurrency. Our services include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Mobile data recharge for Nigerian networks (MTN, Airtel, Glo, 9mobile)</li>
                <li>Pi cryptocurrency payment processing</li>
                <li>Transaction history and receipts</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">3. Pi Network Requirements</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>To use Pivtu, you must:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Have a verified Pi Network account with completed KYC</li>
                <li>Have sufficient Pi balance in your wallet for transactions</li>
                <li>Use the Pi Browser or an approved Pi-enabled environment</li>
                <li>Comply with all Pi Network policies and guidelines</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">4. Transactions and Payments</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground">4.1 Payment Processing</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>All payments are processed through Pi Network's official payment system</li>
                <li>Transactions are final once confirmed on the Pi blockchain</li>
                <li>Prices are displayed in Pi and are subject to change without notice</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4">4.2 Transaction Confirmation</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Data delivery is initiated after successful payment confirmation</li>
                <li>You will receive a transaction receipt with a unique TXID</li>
                <li>All transactions can be verified on the Pi BlockExplorer</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4">4.3 Refund Policy</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Successfully delivered data cannot be refunded</li>
                <li>Failed transactions due to technical issues may be eligible for refund</li>
                <li>Refund requests must be made within 24 hours of the transaction</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">5. User Responsibilities</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>As a user, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate phone numbers for data delivery</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to manipulate or abuse the service</li>
                <li>Keep your Pi wallet credentials secure</li>
                <li>Report any suspicious activities or errors immediately</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">6. Service Availability</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                We strive to maintain continuous service availability but cannot guarantee uninterrupted access. Service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Scheduled maintenance</li>
                <li>Pi Network downtime or issues</li>
                <li>Network provider outages</li>
                <li>Technical difficulties beyond our control</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">7. Limitation of Liability</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Pivtu is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Delays in data delivery caused by network providers</li>
                <li>Incorrect phone numbers entered by users</li>
                <li>Pi Network or blockchain-related issues</li>
                <li>Loss of funds due to user error or security breaches</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">8. PiRC Compliance</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Pivtu complies with Pi Network Resource Center (PiRC) guidelines for service payments. Our payment metadata follows PiRC standards for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Service type identification</li>
                <li>Recipient identification</li>
                <li>Payment tracking and verification</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">9. Intellectual Property</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                All content, designs, and functionality of Pivtu are owned by us and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without permission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">10. Account Termination</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate access to the Service for users who:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent activities</li>
                <li>Abuse the service or attempt unauthorized access</li>
                <li>Violate Pi Network policies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">11. Governing Law</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through Pi Network's dispute resolution mechanisms or appropriate legal channels.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">12. Changes to Terms</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">13. Contact Information</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                For questions about these Terms of Service, please contact us through the Pi Network app or our support channels.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/" className="hover:text-primary">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
