'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: June 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to LuckyLease ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our peer-to-peer sublet marketplace platform and services. By accessing or using LuckyLease, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              LuckyLease is a platform that connects students and individuals seeking short-term housing arrangements with property owners and subletters. We facilitate these connections but are not a party to any rental agreements.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">2. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By creating an account, accessing, or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with these Terms, you must not use our services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 18 years old to use LuckyLease. By using our services, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          {/* User Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must provide accurate, complete, and current information when creating your account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must immediately notify us of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from your failure to protect your account information.
                </p>
              </div>
            </div>
          </section>

          {/* Platform Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">4. Platform Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 Service Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  LuckyLease provides a platform for users to list, discover, and connect regarding short-term housing arrangements. We facilitate communication between parties but do not provide housing services directly.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 No Guarantee</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not guarantee the availability, quality, safety, or legality of any listings. Users are responsible for conducting their own due diligence before entering into any rental agreements.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">5. User Responsibilities</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Listing Accuracy</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users posting listings must provide accurate, complete, and truthful information about their properties and rental terms. Misleading or false information is prohibited.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Legal Compliance</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users must comply with all applicable local, state, and federal laws, including housing discrimination laws, zoning regulations, and rental licensing requirements.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">5.3 Respectful Communication</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users must communicate respectfully and professionally. Harassment, discrimination, or abusive behavior is strictly prohibited.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">6. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Users may not:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
              <li>Post false, misleading, or fraudulent listings</li>
              <li>Engage in discriminatory practices based on race, religion, gender, sexual orientation, or other protected characteristics</li>
              <li>Use the platform for illegal activities or purposes</li>
              <li>Spam, harass, or abuse other users</li>
              <li>Attempt to circumvent platform fees or payment systems</li>
              <li>Scrape, copy, or misuse platform data or content</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Interfere with platform operations or security</li>
            </ul>
          </section>

          {/* Payment and Fees */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">7. Payment and Fees</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">7.1 Platform Fees</h3>
                <p className="text-gray-700 leading-relaxed">
                  LuckyLease may charge service fees for certain transactions or premium features. All fees will be clearly disclosed before any charges are incurred.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">7.2 Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Payments between users for rental arrangements are handled directly between parties. LuckyLease is not responsible for payment disputes between users.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">8. Privacy and Data</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">9. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">9.1 Platform Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  LuckyLease and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">9.2 User Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of content you post but grant us a license to use, display, and distribute your content on our platform for the purpose of providing our services.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">10. Disclaimers</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed font-medium">
                IMPORTANT: LuckyLease is provided "as is" without warranties of any kind.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that our services will be uninterrupted, secure, or error-free.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We are not responsible for the conduct of users, the accuracy of listings, or the outcome of rental arrangements made through our platform.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">11. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, LuckyLease shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of our services.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">12. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and access to our services at any time, with or without notice, for any reason, including violation of these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time by contacting us. Upon termination, your right to use our services will cease immediately.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our platform and updating the "Last updated" date.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>


          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-emerald-700">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> LuckyLease2025@gmail.com</p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500">
              By using LuckyLease, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
} 