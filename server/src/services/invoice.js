import PDFDocument from "pdfkit";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
// PDFKit's built-in fonts lack the ₹ glyph — print INR amounts as "Rs."
const money = (n) => currency.format(n).replace("₹", "Rs. ");

const INK = "#1d1915";
const MUTED = "#857b6f";
const LINE = "#ddd4c6";

/** Streams a branded PDF invoice for an order into `res`. */
export function streamInvoice(order, res) {
  const doc = new PDFDocument({ size: "A4", margin: 56 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="invoice-${order.number}.pdf"`,
  );
  doc.pipe(res);

  // Masthead
  doc.font("Times-Roman").fontSize(26).fillColor(INK).text("AAS Leathers");
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text("MADE SLOWLY IN INDIA · CARRIED EVERYWHERE", { characterSpacing: 2 });

  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text("TAX INVOICE");
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(MUTED)
    .text(`Invoice ${order.number}`)
    .text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
    );

  doc.moveDown(1);
  doc.fillColor(INK).text("Billed & delivered to:");
  doc
    .fillColor(MUTED)
    .text(order.shippingAddress.name)
    .text(order.shippingAddress.line1)
    .text(`${order.shippingAddress.city} ${order.shippingAddress.pincode}`)
    .text(order.email);

  // Items table
  doc.moveDown(2);
  const tableTop = doc.y;
  const col = { item: 56, qty: 360, price: 420, total: 480 };

  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK);
  doc.text("PIECE", col.item, tableTop);
  doc.text("QTY", col.qty, tableTop);
  doc.text("PRICE", col.price, tableTop, { width: 55, align: "right" });
  doc.text("TOTAL", col.total, tableTop, { width: 60, align: "right" });

  doc
    .moveTo(col.item, tableTop + 14)
    .lineTo(540, tableTop + 14)
    .strokeColor(LINE)
    .stroke();

  let y = tableTop + 24;
  doc.font("Helvetica").fontSize(10);
  for (const item of order.items) {
    doc.fillColor(INK).text(item.name, col.item, y, { width: 280 });
    doc.text(String(item.qty), col.qty, y);
    doc.text(money(item.unitPrice), col.price, y, { width: 55, align: "right" });
    doc.text(money(item.unitPrice * item.qty), col.total, y, {
      width: 60,
      align: "right",
    });
    y += 22;
  }

  doc.moveTo(col.item, y).lineTo(540, y).strokeColor(LINE).stroke();
  y += 12;
  doc.fillColor(MUTED).text("Shipping", col.price - 60, y, { width: 115 });
  doc.text(
    order.amounts.shipping === 0 ? "Complimentary" : money(order.amounts.shipping),
    col.total,
    y,
    { width: 60, align: "right" },
  );
  y += 20;
  doc.font("Helvetica-Bold").fillColor(INK).text("Total", col.price - 60, y);
  doc.text(money(order.amounts.total), col.total, y, { width: 60, align: "right" });

  // Footer
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "Every piece carries our lifetime repair promise. Prices include GST.",
      56,
      760,
      { width: 480, align: "center" },
    );

  doc.end();
}
