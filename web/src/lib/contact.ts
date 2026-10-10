/**
 * Every contact detail the site shows, in one place.
 *
 * These appear on the contact page and inside the Terms, Privacy, Returns and
 * Data & Compliance pages. They used to be typed out separately in five files,
 * which meant changing an address meant finding all five. Change them here.
 *
 * Anything marked TODO is still invented and must be replaced with the real
 * registered details before the store takes real customers.
 */
export const CONTACT = {
  /** The address customers and regulators write to. */
  email: "orders@aas-leather-craft-bags.com",

  /** TODO: real workshop number. */
  phone: "+91 44 2811 0000",
  phoneHours: "Monday to Saturday, 10:00–18:00 IST",

  /** TODO: real registered address. */
  addressLines: ["The Workshop, 14 Leather Lane", "Chennai 600 004, Tamil Nadu, India"],
} as const;

/** One-line form of the postal address, for running text in the policies. */
export const ADDRESS_INLINE = `AAS Leather, ${CONTACT.addressLines.join(", ")}`;

/**
 * India's Consumer Protection (E-Commerce) Rules, 2020 and the DPDP Act, 2023
 * both require a named grievance contact to be published, so this section
 * stays on the policy pages. Grievances come to the same mailbox as everything
 * else — a separate one is not required, only a reachable one.
 *
 * TODO: `officer` should be the name of the real person who holds the role.
 */
export const GRIEVANCE = {
  officer: "The Grievance Officer",
  email: CONTACT.email,
  acknowledgeWithin: "48 hours",
  resolveWithin: "30 days",
} as const;
