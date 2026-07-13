import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function RefundPolicyPage() {
  return (
    <EditorialPage
      eyebrow="Policies"
      title="Returns & Refunds"
      updated="5 July 2026"
      intro="Buying leather unseen deserves generous terms. Here they are — and they sit alongside, never below, your rights under the Consumer Protection Act, 2019."
      sections={[
        {
          heading: "Thirty days, freely",
          paragraphs: [
            "Return any unused piece in its original packaging within 30 days of delivery for a full refund — no forms, no restocking fee, no questions beyond how we could have described it better.",
            "Arrange a return by writing to workshop@aasleathers.in with your order number. We schedule the pickup; you tape the box.",
          ],
        },
        {
          heading: "Once the patina begins",
          paragraphs: [
            "Leather that has started taking your marks — creases, darkened handles, the shape of your carry — can no longer be sold as new, so it can no longer be returned. This line is why we photograph, measure and describe every piece so thoroughly before you buy.",
          ],
        },
        {
          heading: "Refund timing",
          paragraphs: [
            "Refunds are issued to the original payment method within 5 working days of the piece reaching our bench and passing inspection. Razorpay typically settles them to your account in a further 3–7 working days.",
          ],
        },
        {
          heading: "Faults",
          paragraphs: [
            "If a piece arrives with a genuine fault — a missed stitch, failed hardware — we repair or replace it at our cost, shipping included, at any age covered by the repair promise. Which is to say: always.",
          ],
        },
        {
          heading: "Cancellations",
          paragraphs: [
            "You may cancel an order any time before it is dispatched for a full refund — simply write to us with your order number. Once a parcel is with the courier, treat it as a return.",
          ],
        },
        {
          heading: "How to reach us",
          paragraphs: [
            "For any return, refund or cancellation, email workshop@aasleathers.in with your order number, or contact our Grievance Officer at grievance@aasleathers.in. We acknowledge within 48 hours and resolve within 30 days, in keeping with the Consumer Protection (E-Commerce) Rules, 2020.",
          ],
        },
      ]}
      footnote={[
        "Nothing in this policy limits your statutory rights under Indian consumer law.",
      ]}
    />
  );
}
