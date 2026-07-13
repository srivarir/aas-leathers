import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Data & Compliance",
  description:
    "AAS Leathers business, payment security, data protection and consumer compliance disclosures for India.",
};

export default function DataCompliancePage() {
  return (
    <EditorialPage
      eyebrow="Policies"
      title="Data & Compliance"
      updated="5 July 2026"
      intro="The disclosures a customer is entitled to before trusting a store with an order and their data — who we are, how payments are secured, and the laws we hold ourselves to. It sits alongside our Privacy Policy and Terms of Service."
      sections={[
        {
          heading: "Business information",
          paragraphs: [
            "As required under the Consumer Protection (E-Commerce) Rules, 2020, our merchant details are:",
          ],
          list: [
            "Legal entity — [Registered legal name, e.g. AAS Leathers Pvt. Ltd.]",
            "Registered address — 14 Leather Lane, Chennai 600 004, Tamil Nadu, India",
            "GSTIN — [15-digit GST identification number]",
            "CIN — [Corporate Identity Number, if incorporated]",
            "Contact — workshop@aasleathers.in · +91 44 2811 0000",
          ],
        },
        {
          heading: "Payment security",
          paragraphs: [
            "All payments are processed by Razorpay, a PCI-DSS Level 1 certified payment gateway — the highest level of certification in the card industry. Your card, UPI and bank details are entered on Razorpay's encrypted systems and are never transmitted to or stored by us; we receive only the status and a reference for each payment.",
            "Every page that handles data is served over HTTPS, so information is encrypted in transit between your device and our systems.",
          ],
        },
        {
          heading: "Data protection",
          paragraphs: [
            "We handle personal data as a Data Fiduciary under India's Digital Personal Data Protection Act, 2023, and follow the reasonable security practices expected under the Information Technology Act, 2000. What we collect, why, how long we keep it, and the rights you hold are set out in full in our Privacy Policy.",
          ],
        },
        {
          heading: "How your account is secured",
          paragraphs: [
            "Passwords are stored only as salted bcrypt hashes — never in readable form. Sessions use short-lived access tokens with rotating, single-use refresh tokens, so a stolen token quickly stops working. Access to customer and order data is role-based: staff see only what their role requires, and every sensitive action is authorised on the server, never trusted from the browser.",
          ],
        },
        {
          heading: "Cookies and local storage",
          paragraphs: [
            "We use only essential storage: a secure session cookie to keep you signed in, and local storage on your own device to remember your cart and wishlist. We do not use advertising cookies or third-party trackers, and we do not profile you for marketing. Clearing your browser storage resets this at any time.",
          ],
        },
        {
          heading: "Taxes and invoicing",
          paragraphs: [
            "Prices include GST where applicable, and a tax invoice is generated for every order and available to download from your account. Records are retained for the period Indian tax law requires.",
          ],
        },
        {
          heading: "Consumer protection & grievances",
          paragraphs: [
            "Your rights under the Consumer Protection Act, 2019 and the E-Commerce Rules, 2020 always apply. For any grievance — about an order, a payment, your data, or the store itself — contact our Grievance Officer at grievance@aasleathers.in or AAS Leathers, 14 Leather Lane, Chennai 600 004. We acknowledge within 48 hours and aim to resolve within 30 days.",
          ],
        },
        {
          heading: "Accessibility",
          paragraphs: [
            "We build the store to be usable by everyone: keyboard navigable, screen-reader friendly, with sufficient colour contrast and respect for reduced-motion settings. If any part of the experience is difficult to use, tell us and we will put it right.",
          ],
        },
      ]}
      footnote={[
        "Bracketed placeholders must be replaced with your registered business details before the store goes live.",
        "This page is a good-faith summary, not legal advice. Have your final policies reviewed by a qualified lawyer and, where relevant, a chartered accountant.",
      ]}
    />
  );
}
