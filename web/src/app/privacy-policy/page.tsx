import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AAS Leathers collects, uses, protects and returns your personal data — under India's Digital Personal Data Protection Act, 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <EditorialPage
      eyebrow="Policies"
      title="Privacy Policy"
      updated="5 July 2026"
      intro="We collect as little as the craft allows, and treat what we hold the way we treat leather — carefully. This policy explains what we collect, why, how long we keep it, and the rights you have over it under India's Digital Personal Data Protection Act, 2023."
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            "AAS Leathers (“we”, “us”, the workshop) operates this store from Chennai, India, and is the Data Fiduciary responsible for the personal data described here. You can reach us at workshop@aasleathers.in or The Workshop, 14 Leather Lane, Chennai 600 004.",
          ],
        },
        {
          heading: "What we collect",
          paragraphs: [
            "We collect only what an order or an account genuinely needs:",
          ],
          list: [
            "Identity and contact — your name, email, phone number and delivery address.",
            "Order details — the pieces you bought, order history and invoices, kept to honour our lifetime repair promise.",
            "Account credentials — your email and a securely hashed password (we never store passwords in readable form).",
            "Payment confirmations — the status and reference of a payment. Your full card, UPI or bank details go to Razorpay and are never seen or stored by us.",
            "Technical basics — device type, browser and pages visited, used to keep the site working and secure.",
          ],
        },
        {
          heading: "Why we use it, and on what basis",
          paragraphs: [
            "We process your data to fulfil and deliver your order, to provide your account and order tracking, to answer you when you write in, to send transactional emails (order and shipping confirmations, invoices), and — only if you asked — to send our monthly letter.",
            "Our lawful bases are the performance of your order, our legitimate interest in running the workshop securely, our legal obligations (tax and accounting), and your consent for anything optional such as the newsletter.",
            "We do not buy data about you, sell your data, track you across other websites, or build advertising profiles.",
          ],
        },
        {
          heading: "Who we share it with",
          paragraphs: [
            "We share the minimum necessary with the partners who help fulfil your order, each under contract to protect it:",
          ],
          list: [
            "Razorpay — to process payments securely (PCI-DSS certified).",
            "Courier and logistics partners — your name, address and phone, to deliver.",
            "Email and cloud infrastructure providers — to store data and send transactional email.",
            "Government authorities — only where the law requires it.",
          ],
        },
        {
          heading: "How long we keep it",
          paragraphs: [
            "Order and invoice records are retained for the period required by Indian tax law (currently eight years) and, for the pieces themselves, for as long as the lifetime repair promise may be called upon. Account data is kept until you close your account. Newsletter data is kept until you unsubscribe.",
          ],
        },
        {
          heading: "How we protect it",
          paragraphs: [
            "We use encryption in transit (HTTPS), hashed passwords, short-lived access tokens, rate limiting, and role-based access so staff see only what their work requires. No system is perfectly secure, but we apply reasonable security practices as required under the IT Act, 2000 and review them regularly.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Under the Digital Personal Data Protection Act, 2023, you may:",
          ],
          list: [
            "Access the personal data we hold about you.",
            "Ask us to correct or complete anything inaccurate.",
            "Ask us to erase data we no longer need to keep.",
            "Withdraw consent for optional processing, such as the newsletter, at any time.",
            "Nominate another person to exercise these rights on your behalf.",
            "Raise a grievance with us, and escalate to the Data Protection Board of India if unresolved.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "We use only the essential storage needed to keep you signed in and to remember your cart and wishlist on your own device. We do not use advertising or third-party tracking cookies. You can clear this storage from your browser at any time; the store will simply forget your cart.",
          ],
        },
        {
          heading: "Children",
          paragraphs: [
            "This store is intended for adults. We do not knowingly collect data from anyone under 18, and we will delete such data if we learn we have it.",
          ],
        },
        {
          heading: "Grievance Officer",
          paragraphs: [
            "In line with the IT Act, 2000 and the DPDP Act, 2023, you can contact our Grievance Officer with any privacy concern. We acknowledge every grievance within 48 hours and resolve it within 30 days.",
            "Grievance Officer — [Name to be appointed], AAS Leathers, 14 Leather Lane, Chennai 600 004. Email: grievance@aasleathers.in.",
          ],
        },
      ]}
      footnote={[
        "This policy may be updated as the law or our practices change; the effective date above always reflects the current version.",
        "Placeholder details (Grievance Officer name, legal entity, registered address) must be replaced with your registered business information before this store goes live, and the policy reviewed by a qualified lawyer.",
      ]}
    />
  );
}
