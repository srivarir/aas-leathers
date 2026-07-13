import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms on which AAS Leathers sells its leather goods — orders, pricing, delivery, warranty, liability and governing law.",
};

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Policies"
      title="Terms of Service"
      updated="5 July 2026"
      intro="These terms govern your use of this store and any purchase you make from AAS Leathers. By browsing, creating an account, or placing an order, you agree to them. We have kept them plain, because fairness does not need fine print."
      sections={[
        {
          heading: "Who may order",
          paragraphs: [
            "You must be at least 18 years old and able to enter a contract under Indian law. When you create an account you agree to give accurate details and to keep your password to yourself; you are responsible for activity under your account until you tell us otherwise.",
          ],
        },
        {
          heading: "How an order becomes a contract",
          paragraphs: [
            "Adding a piece to your cart or placing an order is an offer to buy. A binding contract forms only when your payment is verified and we send you an order confirmation. Until then we may decline or cancel an order — for example if a piece has sold out, a price was listed in clear error, or payment cannot be verified — and we will refund anything already paid.",
            "Every piece is made in small numbers. Numbered editions are allocated strictly in the order payments clear.",
          ],
        },
        {
          heading: "Prices and payment",
          paragraphs: [
            "All prices are in Indian Rupees (INR) and inclusive of GST unless stated otherwise. Shipping within India is complimentary and insured; any duties or taxes on international delivery are the recipient's responsibility.",
            "Payments are handled by Razorpay, supporting UPI, cards, net banking, wallets and EMI. We never see or store your full payment credentials. If a payment fails or is reversed, the order will not be fulfilled.",
          ],
        },
        {
          heading: "Delivery",
          paragraphs: [
            "We aim to dispatch within two working days of confirmation and share tracking as soon as the courier collects your parcel. Delivery timelines are estimates, not guarantees; once a parcel leaves the workshop it is in the courier's hands, though we will always help chase a delayed or lost shipment.",
          ],
        },
        {
          heading: "The nature of the material",
          paragraphs: [
            "Full-grain leather carries the marks of the animal's life — healed scratches, subtle tonal shifts, grain variation. These are the signature of the material, not defects, and no two pieces are identical. Colours may also differ slightly from how a screen renders them.",
          ],
        },
        {
          heading: "Returns, refunds and cancellations",
          paragraphs: [
            "Your rights to return, refund and cancel are set out in full in our Returns & Refunds policy, which forms part of these terms. In short: unused pieces may be returned within 30 days, and genuine faults are always put right.",
          ],
        },
        {
          heading: "The repair promise and warranty",
          paragraphs: [
            "We repair the stitching, edges, structure and hardware of every piece we have made, for as long as this workshop exists. You cover shipping to the bench; the work is ours. This promise covers craftsmanship, not damage from ordinary wear, accident or neglect — though we will still repair those, fairly priced.",
          ],
        },
        {
          heading: "Using this website",
          paragraphs: [
            "You agree not to misuse the store — no attempts to breach security, scrape at scale, disrupt the service, or use it for anything unlawful. We may suspend accounts that do. All content on this site — text, photography, design and the AAS Leathers name and marks — belongs to us and may not be copied or used commercially without written permission.",
          ],
        },
        {
          heading: "Our liability",
          paragraphs: [
            "We stand fully behind the pieces we make and behind your statutory rights under the Consumer Protection Act, 2019, which nothing here limits. Beyond that, and to the extent the law allows, our liability for any order is limited to the amount you paid for it, and we are not liable for indirect or consequential loss.",
          ],
        },
        {
          heading: "Governing law and disputes",
          paragraphs: [
            "These terms are governed by the laws of India. We would always rather resolve a concern directly — write to us first. Any dispute that cannot be settled that way is subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.",
          ],
        },
        {
          heading: "Grievance redressal",
          paragraphs: [
            "For any complaint about an order or this store, contact our Grievance Officer at grievance@aasleathers.in or AAS Leathers, 14 Leather Lane, Chennai 600 004. We acknowledge within 48 hours and aim to resolve within 30 days, in line with the Consumer Protection (E-Commerce) Rules, 2020.",
          ],
        },
      ]}
      footnote={[
        "We may update these terms from time to time; the version in force is the one dated above, and it applies to orders placed after that date.",
        "Placeholder details (legal entity name, GSTIN, Grievance Officer name) must be replaced with your registered business information, and these terms reviewed by a qualified lawyer, before the store goes live.",
      ]}
    />
  );
}
