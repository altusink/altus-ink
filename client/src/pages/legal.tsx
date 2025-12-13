/**
 * LEGAL PAGES
 * Terms of Service, Privacy Policy, Cancellation Policy, Cookie Policy
 * 
 * Features:
 * - Tab-based navigation
 * - Table of contents
 * - Anchor links
 * - Print-friendly
 * - Last updated dates
 * - Language translations
 * - Collapsible sections
 * - Search functionality
 */

import { useState, useMemo, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Shield,
    Cookie,
    XCircle,
    Search,
    Printer,
    Download,
    ChevronUp,
    Globe,
    Calendar,
    Mail,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Info,
    ArrowLeft
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface Section {
    id: string;
    title: string;
    content: string;
}

interface LegalDocument {
    id: string;
    title: string;
    icon: any;
    lastUpdated: string;
    effectiveDate: string;
    version: string;
    sections: Section[];
}

// =============================================================================
// LEGAL CONTENT
// =============================================================================

const TERMS_OF_SERVICE: Section[] = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: `By accessing and using Altus Ink ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use our services.

The Platform is operated by Altus Ink B.V., a company registered in the Netherlands (KvK: 12345678). These terms apply to all users of the Platform, including tattoo artists ("Artists") and customers ("Customers").

By creating an account, you represent that you are at least 18 years old and have the legal capacity to enter into binding contracts. If you are accessing the Platform on behalf of a company, you represent that you have authority to bind that company to these terms.`
    },
    {
        id: "services",
        title: "2. Description of Services",
        content: `Altus Ink provides a booking platform connecting Customers with professional tattoo Artists. Our services include:

**For Customers:**
- Browse and discover tattoo artists
- View artist portfolios and availability
- Book tattoo sessions online
- Pay deposits securely
- Receive booking confirmations and reminders
- Manage and reschedule bookings

**For Artists:**
- Create and manage professional profiles
- Showcase portfolio work
- Set availability and working hours
- Accept and manage bookings
- Receive secure payments
- Access analytics and insights

The Platform acts as an intermediary between Artists and Customers. We do not provide tattoo services directly and are not responsible for the quality or outcome of tattoo work performed by Artists.`
    },
    {
        id: "accounts",
        title: "3. User Accounts",
        content: `**Account Creation:**
Users must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.

**Account Types:**
- **Customer Account:** Free to create, allows booking tattoo sessions
- **Artist Account:** Requires verification, allows listing services and accepting bookings

**Account Verification:**
Artists must complete our verification process, which may include identity verification, portfolio review, and professional certification checks. We reserve the right to reject applications that do not meet our quality standards.

**Account Termination:**
We may suspend or terminate accounts that violate these terms, engage in fraudulent activity, or harm the Platform's reputation. Users may close their accounts at any time by contacting support.`
    },
    {
        id: "bookings",
        title: "4. Bookings and Payments",
        content: `**Booking Process:**
Customers can book sessions by selecting an Artist, choosing a date and time, providing session details, and paying the required deposit. Bookings are confirmed upon successful payment.

**Deposits:**
- Deposits are non-refundable unless cancelled within the Artist's cancellation policy
- Deposit amounts are set by individual Artists
- The remaining balance is paid directly to the Artist on the day of the session

**Payment Processing:**
Payments are processed securely through Stripe. By making a payment, you agree to Stripe's terms of service. We do not store credit card details on our servers.

**Platform Fees:**
Altus Ink charges a commission on each booking. This fee is deducted from the Artist's payment before payout. Current commission rate: 15%.

**Payouts:**
Artists receive payouts according to their chosen schedule (weekly, bi-weekly, or monthly) via Stripe Connect. Minimum payout threshold applies.`
    },
    {
        id: "cancellation",
        title: "5. Cancellation and Refunds",
        content: `**Customer Cancellations:**
Refund amounts depend on the Artist's cancellation policy and the timing of cancellation:

**Flexible Policy:**
- 24+ hours before: 100% refund
- 6-24 hours before: 50% refund
- Under 6 hours: No refund

**Moderate Policy:**
- 48+ hours before: 100% refund
- 24-48 hours before: 75% refund
- 12-24 hours before: 50% refund
- Under 12 hours: 25% refund

**Strict Policy:**
- 72+ hours before: 100% refund
- 48-72 hours before: 50% refund
- Under 48 hours: No refund

**Artist Cancellations:**
If an Artist cancels a session, the Customer receives a 100% refund plus assistance rebooking with another Artist if desired.

**No-Shows:**
Customers who do not show up for their appointment without prior cancellation forfeit their entire deposit.`
    },
    {
        id: "conduct",
        title: "6. User Conduct",
        content: `**All Users:**
Users agree not to:
- Provide false or misleading information
- Harass, abuse, or threaten other users
- Circumvent the Platform's payment system
- Scrape or collect user data without permission
- Upload malicious content or spam
- Violate any applicable laws or regulations

**Artists:**
Artists additionally agree to:
- Maintain professional standards and hygiene
- Honor confirmed bookings
- Provide accurate portfolio images of their own work
- Respond to booking requests in a timely manner
- Comply with local licensing and health regulations

**Content:**
Users retain ownership of content they upload but grant Altus Ink a license to use, display, and distribute this content for Platform purposes.`
    },
    {
        id: "liability",
        title: "7. Limitation of Liability",
        content: `**Platform Liability:**
Altus Ink provides the Platform "as is" and makes no warranties regarding service availability, accuracy of information, or the quality of services provided by Artists.

We are not liable for:
- The quality or outcome of tattoo work
- Injuries or adverse reactions from tattoo procedures
- Disputes between Artists and Customers
- Lost profits or consequential damages
- Service interruptions or technical issues

**Maximum Liability:**
Our total liability for any claim arising from use of the Platform is limited to the amount of fees paid by you in the preceding 12 months.

**Indemnification:**
Users agree to indemnify Altus Ink against claims arising from their use of the Platform or violation of these terms.`
    },
    {
        id: "intellectual",
        title: "8. Intellectual Property",
        content: `**Platform IP:**
The Altus Ink name, logo, and Platform design are owned by Altus Ink B.V. Users may not use our trademarks without written permission.

**User Content:**
Artists retain copyright to their portfolio images. By uploading content, Artists grant Altus Ink a non-exclusive license to display this content on the Platform and in marketing materials.

**Tattoo Designs:**
Custom tattoo designs created by Artists remain their intellectual property unless otherwise agreed with the Customer. Customers receive a license to display their tattoo but may not reproduce the design commercially.`
    },
    {
        id: "privacy",
        title: "9. Privacy and Data Protection",
        content: `Your privacy is important to us. Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal data.

**Key Points:**
- We comply with GDPR and applicable data protection laws
- We collect only necessary information
- We do not sell personal data to third parties
- Users can request data access, correction, or deletion
- We use industry-standard security measures`
    },
    {
        id: "changes",
        title: "10. Changes to Terms",
        content: `We may update these Terms of Service from time to time. Material changes will be notified via email and Platform notification at least 30 days before taking effect.

Continued use of the Platform after changes take effect constitutes acceptance of the new terms. If you disagree with changes, you should stop using the Platform and close your account.`
    },
    {
        id: "governing",
        title: "11. Governing Law and Disputes",
        content: `**Governing Law:**
These terms are governed by the laws of the Netherlands.

**Dispute Resolution:**
We encourage users to contact our support team to resolve disputes amicably. If unable to resolve a dispute, it may be submitted to the competent court in Amsterdam, Netherlands.

**EU Consumers:**
Consumers residing in the EU may also use the EU Online Dispute Resolution platform: https://ec.europa.eu/consumers/odr`
    },
    {
        id: "contact",
        title: "12. Contact Information",
        content: `**Altus Ink B.V.**
Herengracht 123
1015 BZ Amsterdam
The Netherlands

Email: legal@altusink.com
Support: support@altusink.com
Phone: +31 20 123 4567

KvK Registration: 12345678
VAT Number: NL123456789B01`
    }
];

const PRIVACY_POLICY: Section[] = [
    {
        id: "intro",
        title: "1. Introduction",
        content: `Altus Ink B.V. ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Platform.

We comply with the General Data Protection Regulation (GDPR), the Dutch Data Protection Act, and other applicable privacy laws.

**Data Controller:**
Altus Ink B.V.
Herengracht 123
1015 BZ Amsterdam
The Netherlands
Email: privacy@altusink.com`
    },
    {
        id: "collection",
        title: "2. Information We Collect",
        content: `**Information You Provide:**
- Account information (name, email, password)
- Profile details (bio, location, social links)
- Booking information (dates, preferences, contact details)
- Payment information (processed by Stripe)
- Communications (messages, support requests)
- Portfolio images (for Artists)

**Information Collected Automatically:**
- Device information (browser type, operating system)
- Usage data (pages visited, features used)
- IP address and location data
- Cookies and similar technologies

**Information from Third Parties:**
- Social media profiles (with your consent)
- Payment processor data (Stripe)
- Identity verification services (for Artists)`
    },
    {
        id: "use",
        title: "3. How We Use Your Information",
        content: `**To Provide Services:**
- Process bookings and payments
- Facilitate communication between users
- Send booking confirmations and reminders
- Manage user accounts

**To Improve the Platform:**
- Analyze usage patterns
- Develop new features
- Fix bugs and technical issues
- Personalize user experience

**To Communicate:**
- Send service-related notifications
- Respond to inquiries and support requests
- Send marketing communications (with consent)
- Notify about policy changes

**For Safety and Compliance:**
- Prevent fraud and abuse
- Verify user identities
- Comply with legal obligations
- Enforce our Terms of Service`
    },
    {
        id: "sharing",
        title: "4. Information Sharing",
        content: `**With Other Users:**
- Artists see Customer booking information
- Customers see Artist profile information
- Reviews and ratings are publicly visible

**With Service Providers:**
- Stripe (payment processing)
- SendGrid/Resend (email delivery)
- Cloudinary (image storage)
- Analytics providers

**With Authorities:**
We may disclose information when required by law, court order, or to protect rights, safety, or property.

**No Selling of Data:**
We do not sell your personal information to third parties for marketing purposes.`
    },
    {
        id: "rights",
        title: "5. Your Rights",
        content: `Under GDPR, you have the following rights:

**Right of Access:**
Request a copy of your personal data.

**Right to Rectification:**
Correct inaccurate or incomplete data.

**Right to Erasure:**
Request deletion of your data ("right to be forgotten").

**Right to Restrict Processing:**
Limit how we use your data.

**Right to Data Portability:**
Receive your data in a machine-readable format.

**Right to Object:**
Object to processing based on legitimate interests.

**Right to Withdraw Consent:**
Withdraw consent for marketing communications.

To exercise these rights, contact privacy@altusink.com. We will respond within 30 days.`
    },
    {
        id: "retention",
        title: "6. Data Retention",
        content: `We retain personal data for as long as necessary to provide services and comply with legal obligations:

- **Active accounts:** Data retained while account is active
- **Closed accounts:** Core data deleted within 30 days, some data retained for legal purposes up to 5 years
- **Booking records:** Retained for 7 years for tax/legal purposes
- **Communication logs:** Retained for 2 years
- **Server logs:** Retained for 90 days

You may request deletion of your data at any time, subject to legal retention requirements.`
    },
    {
        id: "security",
        title: "7. Security Measures",
        content: `We implement industry-standard security measures:

**Technical Measures:**
- HTTPS encryption for all data transmission
- Encrypted database storage
- Regular security audits
- Two-factor authentication option
- Secure password hashing

**Organizational Measures:**
- Staff training on data protection
- Access controls and authentication
- Regular policy reviews
- Incident response procedures

Despite our efforts, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`
    },
    {
        id: "international",
        title: "8. International Transfers",
        content: `Your data may be transferred to and processed in countries outside the European Economic Area (EEA). When transferring data, we ensure adequate protection through:

- EU Standard Contractual Clauses
- Adequacy decisions
- Binding corporate rules

Our primary data centers are located in the European Union.`
    },
    {
        id: "cookies",
        title: "9. Cookies",
        content: `Please refer to our Cookie Policy for detailed information about cookies and tracking technologies used on the Platform.

**Essential Cookies:** Required for Platform functionality
**Analytics Cookies:** Help us understand usage patterns
**Marketing Cookies:** Used for targeted advertising (with consent)

You can manage cookie preferences through our cookie consent tool or your browser settings.`
    },
    {
        id: "children",
        title: "10. Children's Privacy",
        content: `Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.

If we become aware that we have collected data from a minor, we will take steps to delete this information promptly.

If you believe a minor has provided personal information to us, please contact privacy@altusink.com.`
    },
    {
        id: "changes",
        title: "11. Changes to This Policy",
        content: `We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.

For material changes, we will notify you via email and Platform notification at least 30 days before the changes take effect.

We encourage you to review this policy regularly to stay informed about how we protect your information.`
    },
    {
        id: "contact",
        title: "12. Contact Us",
        content: `For privacy-related inquiries or to exercise your rights:

**Data Protection Officer:**
Email: privacy@altusink.com
Address: Altus Ink B.V., Herengracht 123, 1015 BZ Amsterdam, Netherlands

**Supervisory Authority:**
You have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens): https://autoriteitpersoonsgegevens.nl

**Response Time:**
We will respond to requests within 30 days.`
    }
];

const CANCELLATION_POLICY: Section[] = [
    {
        id: "overview",
        title: "1. Cancellation Overview",
        content: `This Cancellation Policy governs the cancellation and refund procedures for bookings made through the Altus Ink Platform.

Each Artist on our platform sets their own cancellation policy, which is displayed at the time of booking. Customers are encouraged to review the Artist's policy before confirming a booking.

Deposits are required to confirm all bookings and help protect Artists from last-minute cancellations.`
    },
    {
        id: "policies",
        title: "2. Cancellation Policy Types",
        content: `Artists can choose from three cancellation policy options:

**Flexible Policy:**
For customers who need maximum flexibility.
- Cancel 24+ hours before: Full deposit refund
- Cancel 6-24 hours before: 50% deposit refund
- Cancel within 6 hours: No refund

**Moderate Policy (Most Common):**
Balanced protection for both parties.
- Cancel 48+ hours before: Full deposit refund
- Cancel 24-48 hours before: 75% deposit refund
- Cancel 12-24 hours before: 50% deposit refund
- Cancel within 12 hours: 25% deposit refund

**Strict Policy:**
For high-demand Artists or complex sessions.
- Cancel 72+ hours before: Full deposit refund
- Cancel 48-72 hours before: 50% deposit refund
- Cancel within 48 hours: No refund

The applicable policy is clearly displayed on the booking confirmation.`
    },
    {
        id: "howto",
        title: "3. How to Cancel",
        content: `**Customers:**
1. Log in to your Altus Ink account
2. Go to "My Bookings"
3. Select the booking you wish to cancel
4. Click "Cancel Booking"
5. Confirm cancellation
6. Refund will be processed automatically based on the policy

**Artists:**
1. Log in to your dashboard
2. Navigate to "Bookings"
3. Select the booking to cancel
4. Click "Cancel Booking"
5. Provide a reason for cancellation
6. Customer receives full refund automatically

**Important:** Cancellations are based on the time at which the cancellation request is submitted, not when it is processed.`
    },
    {
        id: "refunds",
        title: "4. Refund Process",
        content: `**Refund Timeline:**
- Refunds are initiated immediately upon cancellation
- Credit card refunds: 5-10 business days
- Bank transfers (SEPA): 3-5 business days
- iDEAL/Bancontact: 3-5 business days

**Refund Method:**
Refunds are processed to the original payment method used at booking. We cannot redirect refunds to different accounts.

**Partial Refunds:**
When a partial refund applies, the refunded amount is calculated as a percentage of the original deposit paid, not the total session value.

**Processing Fees:**
Payment processing fees (typically 2-3%) may be deducted from refunds, depending on the payment method used.`
    },
    {
        id: "noshow",
        title: "5. No-Show Policy",
        content: `**Definition:**
A "no-show" occurs when a Customer fails to appear for their scheduled appointment without prior cancellation.

**Consequences:**
- Full deposit is forfeited
- No refund is provided
- The Artist may charge for the session time lost

**Grace Period:**
Customers have a 15-minute grace period. After 15 minutes past the scheduled time, the Artist may mark the booking as a no-show.

**Communication:**
If you are running late, please contact your Artist directly. Many Artists will accommodate delays if communicated in advance.

**Repeated No-Shows:**
Customers with multiple no-shows may have their account suspended or terminated.`
    },
    {
        id: "artist",
        title: "6. Artist Cancellations",
        content: `**Artist Responsibilities:**
Artists should only cancel in exceptional circumstances (illness, emergency, equipment failure).

**Customer Compensation:**
When an Artist cancels:
- Customer receives 100% refund
- Altus Ink assists with rebooking if desired
- Customers may receive a discount on their next booking

**Repeated Cancellations:**
Artists who frequently cancel may face:
- Lower ranking in search results
- Account review
- Potential suspension or termination

Artists are encouraged to keep their calendars updated to prevent last-minute cancellations.`
    },
    {
        id: "reschedule",
        title: "7. Rescheduling Policy",
        content: `**Customer Rescheduling:**
Customers may reschedule instead of cancelling:
- Rescheduling within 48 hours of the appointment may be subject to Artist approval
- One free reschedule per booking is typically allowed
- Additional reschedules may incur fees

**How to Reschedule:**
1. Contact your Artist directly through the Platform
2. Propose alternative dates/times
3. Once agreed, the original booking is updated
4. No additional deposit required

**Artist Rescheduling:**
Artists may request to reschedule with Customer agreement. If the Customer cannot accommodate the new time, they receive a full refund.`
    },
    {
        id: "exceptional",
        title: "8. Exceptional Circumstances",
        content: `**Force Majeure:**
In cases of genuine emergencies or unforeseen circumstances (natural disasters, severe illness, bereavement), exceptions to the standard policy may be considered.

**How to Request Exception:**
1. Contact support@altusink.com
2. Explain the circumstances
3. Provide documentation if applicable
4. Our team will review and respond within 48 hours

**Medical Emergencies:**
With valid medical documentation, we may provide full refunds regardless of timing.

**COVID-19 & Health Concerns:**
We follow current health guidelines. If sessions cannot proceed due to health restrictions, full refunds are provided.`
    },
    {
        id: "disputes",
        title: "9. Dispute Resolution",
        content: `**Raising a Dispute:**
If you believe a refund decision was incorrect:
1. Contact the Artist directly to discuss
2. If unresolved, contact support@altusink.com
3. Provide booking details and explanation
4. Our team will investigate and mediate

**Review Process:**
- Disputes are reviewed within 5 business days
- Both parties are contacted
- Decision is based on policy, communication records, and circumstances

**Final Decision:**
Altus Ink's decision on disputes is final. We aim for fair resolution for all parties.`
    },
    {
        id: "contact",
        title: "10. Contact Information",
        content: `For cancellation assistance or questions:

**Support Email:** support@altusink.com
**Response Time:** Within 24 hours on business days

**Urgent Cancellations:**
For same-day cancellation emergencies, please call: +31 20 123 4567

**Hours of Operation:**
Monday - Friday: 9:00 - 18:00 CET
Saturday: 10:00 - 16:00 CET
Sunday: Closed`
    }
];

const COOKIE_POLICY: Section[] = [
    {
        id: "about",
        title: "1. About Cookies",
        content: `**What Are Cookies?**
Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and understand how you interact with the site.

**Types of Cookies:**
- **Session Cookies:** Temporary, deleted when you close your browser
- **Persistent Cookies:** Remain on your device for a set period
- **First-Party Cookies:** Set by the website you're visiting
- **Third-Party Cookies:** Set by external services embedded in the website`
    },
    {
        id: "essential",
        title: "2. Essential Cookies",
        content: `Essential cookies are necessary for the Platform to function properly. They cannot be disabled.

**We use essential cookies to:**
- Keep you logged in to your account
- Maintain your session during booking
- Remember your language preference
- Ensure security (CSRF protection)
- Remember your cookie consent preferences

**Cookie Details:**
| Name | Purpose | Duration |
|------|---------|----------|
| session_id | Session management | Session |
| csrf_token | Security protection | Session |
| lang | Language preference | 1 year |
| cookie_consent | Consent preferences | 1 year |`
    },
    {
        id: "analytics",
        title: "3. Analytics Cookies",
        content: `Analytics cookies help us understand how visitors use the Platform.

**We use analytics to:**
- Count visitors and page views
- Understand popular pages and features
- Identify performance issues
- Improve user experience

**Third-Party Analytics:**
We may use Google Analytics, which collects anonymized usage data. Google's privacy policy: https://policies.google.com/privacy

**Opting Out:**
You can opt out of analytics cookies through:
- Our cookie consent tool
- Google Analytics opt-out browser add-on
- Your browser's cookie settings`
    },
    {
        id: "marketing",
        title: "4. Marketing Cookies",
        content: `Marketing cookies are used to deliver relevant advertisements.

**We use marketing cookies to:**
- Show personalized ads on other platforms
- Measure advertising effectiveness
- Limit how often you see an ad
- Understand campaign performance

**Third-Party Marketing:**
We may use:
- Meta (Facebook/Instagram) Pixel
- Google Ads

**Your Choice:**
Marketing cookies are only set with your explicit consent. You can change your preferences at any time through our cookie settings.`
    },
    {
        id: "manage",
        title: "5. Managing Cookies",
        content: `**Our Cookie Tool:**
Click the "Cookie Settings" link in our footer to manage your preferences at any time.

**Browser Settings:**
Most browsers allow you to:
- See what cookies are set
- Delete all or specific cookies
- Block cookies entirely
- Block third-party cookies only

**Browser-Specific Instructions:**
- Chrome: Settings > Privacy > Cookies
- Firefox: Settings > Privacy > Cookies
- Safari: Preferences > Privacy > Cookies
- Edge: Settings > Privacy > Cookies

**Note:** Blocking essential cookies may impact Platform functionality.`
    },
    {
        id: "changes",
        title: "6. Changes to This Policy",
        content: `We may update this Cookie Policy to reflect changes in cookies we use or legal requirements.

Changes will be posted on this page with an updated revision date.

For significant changes, we will request new consent from users.

**Last Updated:** December 2024
**Version:** 2.0`
    },
    {
        id: "contact",
        title: "7. Contact Us",
        content: `For questions about our use of cookies:

**Email:** privacy@altusink.com
**Address:** Altus Ink B.V., Herengracht 123, 1015 BZ Amsterdam, Netherlands

We aim to respond to all inquiries within 5 business days.`
    }
];

// =============================================================================
// LEGAL DOCUMENTS
// =============================================================================

const LEGAL_DOCUMENTS: LegalDocument[] = [
    {
        id: "terms",
        title: "Terms of Service",
        icon: FileText,
        lastUpdated: "December 12, 2024",
        effectiveDate: "January 1, 2025",
        version: "3.0",
        sections: TERMS_OF_SERVICE
    },
    {
        id: "privacy",
        title: "Privacy Policy",
        icon: Shield,
        lastUpdated: "December 12, 2024",
        effectiveDate: "January 1, 2025",
        version: "2.5",
        sections: PRIVACY_POLICY
    },
    {
        id: "cancellation",
        title: "Cancellation Policy",
        icon: XCircle,
        lastUpdated: "December 12, 2024",
        effectiveDate: "January 1, 2025",
        version: "2.0",
        sections: CANCELLATION_POLICY
    },
    {
        id: "cookies",
        title: "Cookie Policy",
        icon: Cookie,
        lastUpdated: "December 12, 2024",
        effectiveDate: "January 1, 2025",
        version: "2.0",
        sections: COOKIE_POLICY
    }
];

// =============================================================================
// COMPONENTS
// =============================================================================

function TableOfContents({ sections, activeSection, onSectionClick }: {
    sections: Section[];
    activeSection: string;
    onSectionClick: (id: string) => void;
}) {
    return (
        <Card className="card-white sticky top-24">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
                <nav className="space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => onSectionClick(section.id)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === section.id
                                ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium"
                                : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </nav>
            </CardContent>
        </Card>
    );
}

function DocumentContent({ document, searchQuery }: {
    document: LegalDocument;
    searchQuery: string;
}) {
    const [activeSection, setActiveSection] = useState("");

    const filteredSections = useMemo(() => {
        if (!searchQuery) return document.sections;
        return document.sections.filter(
            s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [document.sections, searchQuery]);

    const scrollToSection = (id: string) => {
        const element = window.document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
        }
    };

    // Track active section on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -50% 0px" }
        );

        document.sections.forEach(section => {
            const element = window.document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [document.sections]);

    return (
        <div className="grid lg:grid-cols-[1fr_250px] gap-8">
            {/* Content */}
            <div className="space-y-8">
                {/* Document Header */}
                <div className="pb-6 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-4 mb-4">
                        <document.icon className="w-8 h-8 text-[var(--brand-primary)]" />
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{document.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Last updated: {document.lastUpdated}
                                </span>
                                <Badge variant="secondary">v{document.version}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--bg-surface)]">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-[var(--signal-info)] flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Effective Date</p>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    This version takes effect on {document.effectiveDate}. By continuing to use our services after this date, you agree to these terms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                {searchQuery && filteredSections.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-secondary)]">No sections match your search.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredSections.map(section => (
                            <motion.section
                                key={section.id}
                                id={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="scroll-mt-24"
                            >
                                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                                    {section.title}
                                </h2>
                                <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                                    {section.content.split("\n\n").map((paragraph, i) => {
                                        // Handle headers
                                        if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                                            return (
                                                <h4 key={i} className="font-semibold text-[var(--text-primary)] mt-4 mb-2">
                                                    {paragraph.replace(/\*\*/g, "")}
                                                </h4>
                                            );
                                        }

                                        // Handle bold text
                                        const formattedText = paragraph.replace(
                                            /\*\*(.*?)\*\*/g,
                                            '<strong class="text-[var(--text-primary)]">$1</strong>'
                                        );

                                        // Handle lists
                                        if (paragraph.includes("\n-")) {
                                            const items = paragraph.split("\n-").filter(Boolean);
                                            return (
                                                <ul key={i} className="list-disc pl-5 space-y-1">
                                                    {items.map((item, j) => (
                                                        <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    ))}
                                                </ul>
                                            );
                                        }

                                        return (
                                            <p key={i} dangerouslySetInnerHTML={{ __html: formattedText }} />
                                        );
                                    })}
                                </div>
                            </motion.section>
                        ))}
                    </div>
                )}
            </div>

            {/* Table of Contents */}
            <div className="hidden lg:block">
                <TableOfContents
                    sections={document.sections}
                    activeSection={activeSection}
                    onSectionClick={scrollToSection}
                />
            </div>
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LegalPage() {
    const [location, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("terms");
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Get tab from URL
    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (LEGAL_DOCUMENTS.find(d => d.id === hash)) {
            setActiveTab(hash);
        }
    }, [location]);

    // Show scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchQuery("");
        window.history.replaceState(null, "", `#${tab}`);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePrint = () => {
        window.print();
    };

    const currentDocument = LEGAL_DOCUMENTS.find(d => d.id === activeTab)!;

    return (
        <div className="min-h-screen bg-[var(--bg-surface)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--border-subtle)] sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">
                                Altus<span className="text-[var(--brand-primary)]">Ink</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Select defaultValue="en">
                                <SelectTrigger className="w-32">
                                    <Globe className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="pt">Português</SelectItem>
                                    <SelectItem value="nl">Nederlands</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Legal Information</h1>
                        <p className="text-[var(--text-secondary)]">
                            Review our terms, policies, and legal documents.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {LEGAL_DOCUMENTS.map(doc => {
                                    const Icon = doc.icon;
                                    return (
                                        <button
                                            key={doc.id}
                                            onClick={() => handleTabChange(doc.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === doc.id
                                                ? "bg-[var(--brand-primary)] text-white"
                                                : "bg-white border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {doc.title}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <Input
                                    placeholder="Search in document..."
                                    className="pl-10 w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Content */}
                    <Card className="card-white">
                        <CardContent className="p-6 md:p-8">
                            <DocumentContent document={currentDocument} searchQuery={searchQuery} />
                        </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <div className="mt-8 p-6 rounded-xl bg-white border border-[var(--border-subtle)]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-[var(--brand-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Questions about our policies?</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Our legal team is here to help.
                                    </p>
                                </div>
                            </div>
                            <Button className="btn-primary">
                                <Mail className="w-4 h-4 mr-2" />
                                Contact Legal Team
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[var(--border-subtle)] py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
                    <p>© {new Date().getFullYear()} Altus Ink B.V. All rights reserved.</p>
                    <p className="mt-1">KvK: 12345678 | VAT: NL123456789B01</p>
                </div>
            </footer>

            {/* Scroll to Top */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <ChevronUp className="w-6 h-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

// =============================================================================
// NAMED EXPORTS FOR INDIVIDUAL PAGES
// =============================================================================

export function TermsPage() {
    return <LegalPage />;
}

export function PrivacyPage() {
    return <LegalPage />;
}

export function CancellationPage() {
    return <LegalPage />;
}

export function CookiesPage() {
    return <LegalPage />;
}
