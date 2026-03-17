import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Pivtu",
  description: "Privacy Policy for Pivtu VTU Service on Pi Network",
};

export default function PrivacyPage() {
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
            <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground">
              Last updated: March 2026
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <p className="text-sm text-foreground">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        <div className="prose prose-sm prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                When you use Pivtu, we collect limited information to provide our VTU services:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Pi Network Authentication Data:</strong> Your Pi username, user ID, and wallet address provided through Pi SDK authentication.
                </li>
                <li>
                  <strong className="text-foreground">Transaction Information:</strong> Phone numbers you provide for data recharge, selected network providers, data plans, and transaction IDs.
                </li>
                <li>
                  <strong className="text-foreground">Payment Information:</strong> Pi payment records including transaction hashes stored on the Pi blockchain.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Processing and fulfilling your data recharge requests</li>
                <li>Verifying your identity through Pi Network KYC</li>
                <li>Communicating transaction status and receipts</li>
                <li>Maintaining transaction history for your records</li>
                <li>Improving our services and user experience</li>
                <li>Complying with legal obligations and Pi Network guidelines</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">3. Pi Network Integration</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                Pivtu integrates with Pi Network for authentication and payments. By using our service:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You consent to Pi Network's authentication process and privacy policies</li>
                <li>Your Pi transactions are recorded on the Pi blockchain and are publicly visible</li>
                <li>We comply with Pi Network Resource Center (PiRC) guidelines for service payments</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">4. Data Storage and Security</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>We implement industry-standard security measures:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Secure session management with HTTP-only cookies</li>
                <li>Encrypted data transmission using HTTPS</li>
                <li>Limited data retention periods</li>
                <li>Access controls for administrative functions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">5. Information Sharing</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Network providers (MTN, Airtel, Glo, 9mobile) to fulfill data recharge requests</li>
                <li>Pi Network for authentication and payment processing</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your transaction history within the app</li>
                <li>Request deletion of your account data</li>
                <li>Disconnect your Pi wallet at any time</li>
                <li>Contact us regarding privacy concerns</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">7. Cookies and Local Storage</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                We use essential cookies for session management and local storage to save your transaction history locally on your device. You can clear this data through your browser settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">8. Changes to This Policy</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify users of significant changes through the app. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">9. Contact Us</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us through the Pi Network app or our support channels.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-primary">
            Terms of Service
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
