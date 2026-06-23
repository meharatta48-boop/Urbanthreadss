import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getImageUrl } from "./imageUrl";

const getName = (order) => order?.user?.name || order?.guestInfo?.name || order?.shippingAddress?.fullName || "Customer";
const getPhone = (order) => order?.shippingAddress?.phone || order?.guestInfo?.phone || "";
const getEmail = (order) => order?.user?.email || order?.guestInfo?.email || "";

export const generateInvoiceHtml = (order, settings) => {
  const name = getName(order);
  const phone = getPhone(order);
  const email = getEmail(order);
  const addr = order?.shippingAddress || null;
  const invoiceNo = (order?._id || "ORDER").slice(-10).toUpperCase();
  const orderId = (order?._id || "ORDER").slice(-8).toUpperCase();
  
  const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  }) : "N/A";
  
  const printDate = new Date().toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric"
  });

  const orderStatus = order?.orderStatus || "pending";

  const statusColor = {
    pending: "#f59e0b",
    processing: "#c9a84c",
    shipped: "#818cf8",
    delivered: "#16a34a",
    cancelled: "#ef4444",
  }[orderStatus] || "#888";

  const statusLabel = {
    pending: "Order Received",
    processing: "Packing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }[orderStatus] || orderStatus;

  const itemRows = (order?.orderItems || []).map((item, i) => {
    const variant = [item?.size, item?.color].filter(Boolean).join(", ");
    const lineTotal = ((item?.price || 0) * (item?.quantity || 0)).toLocaleString();
    return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#888;font-size:12px;text-align:center;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;">
        <div style="font-weight:600;color:#1a1208;font-size:13px;">${item?.name || "Item"}</div>
        ${variant ? `<div style="font-size:11px;color:#9e8a6a;margin-top:2px;">${variant}</div>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:center;font-weight:600;color:#1a1208;">${item?.quantity || 0}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;color:#5a4a30;">Rs. ${(item?.price || 0).toLocaleString()}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;font-weight:700;color:#c9a84c;">Rs. ${lineTotal}</td>
    </tr>`;
  }).join("");

  const brandName = settings?.brandName || "URBAN THREADS";
  const brandTagline = settings?.invoiceTagline || "Official Invoice / Receipt";
  const thankYouText = settings?.invoiceThankYou || "Thank you for shopping with us! 🌸";
  const footerNote = settings?.invoiceFooterNote || "This is a computer-generated invoice — no signature is required";
  const customNote = settings?.invoiceNote || "";

  const logoHtml = (settings?.invoiceShowLogo && settings?.logoImage)
    ? `<img src="${getImageUrl(settings.logoImage)}" alt="${brandName}" style="max-height: 48px; max-width: 180px; object-fit: contain;" />`
    : `<div class="brand-name">${brandName}</div>`;

  const deliveryCharges = order?.shippingPrice ?? (settings?.deliveryCharges ?? 250);

  return `
  <div class="page" style="width: 790px; margin: 0 auto; background: #ffffff; box-sizing: border-box;">
    <!-- HEADER -->
    <div class="inv-header">
      <div>
        ${logoHtml}
        <div class="brand-tagline">${brandTagline}</div>
      </div>
      <div class="inv-title-block">
        <div class="inv-title">Invoice</div>
        <div class="inv-number">#${invoiceNo}</div>
        <div class="inv-date">${orderDate}</div>
      </div>
    </div>

    <!-- STATUS BAR -->
    <div class="status-bar">
      <div class="status-pill">
        <span class="status-dot"></span>
        ${statusLabel}
      </div>
      <div class="payment-badge">Payment: ${order?.paymentMethod || "COD"}</div>
    </div>

    <!-- META INFO -->
    <div class="meta-section">
      <div class="meta-card">
        <div class="meta-card-label">Bill To</div>
        <div class="meta-card-name">${name}</div>
        ${phone ? `<div class="meta-card-line">📞 ${phone}</div>` : ""}
        ${email ? `<div class="meta-card-line">✉ ${email}</div>` : ""}
      </div>
      <div class="meta-card">
        <div class="meta-card-label">Ship To</div>
        ${addr ? `
          <div class="meta-card-name">${addr.fullName || name}</div>
          <div class="meta-card-line">${addr.address || "N/A"}</div>
          <div class="meta-card-line">${addr.city || "N/A"}${addr.province ? ", " + addr.province : ""}</div>
          ${addr.postalCode && addr.postalCode !== "00000" ? `<div class="meta-card-line">Postal: ${addr.postalCode}</div>` : ""}
        ` : "<div class=\"meta-card-line\">—</div>"}
      </div>
      <div class="meta-card">
        <div class="meta-card-label">Order Info</div>
        <div class="meta-card-line"><strong>Order ID:</strong> #${orderId}</div>
        <div class="meta-card-line"><strong>Date:</strong> ${orderDate}</div>
        <div class="meta-card-line"><strong>Items:</strong> ${(order?.orderItems || []).length}</div>
        ${order?.trackingNumber ? `<div class="meta-card-line"><strong>Tracking:</strong> ${order.trackingNumber}</div>` : ""}
        ${order?.courierPartner ? `<div class="meta-card-line"><strong>Courier:</strong> ${order.courierPartner}</div>` : ""}
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div class="items-section">
      <div class="section-title">Order Items</div>
      <table>
        <thead>
          <tr>
            <th style="width:40px; text-align:center;">#</th>
            <th>Product</th>
            <th style="text-align:center;width:60px;">Qty</th>
            <th style="text-align:right;width:110px;">Unit Price</th>
            <th style="text-align:right;width:110px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <div class="totals-section">
      <div class="totals-box">
        <div class="totals-row">
          <span class="label">Subtotal</span>
          <span class="val">Rs. ${(order?.itemsPrice || 0).toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span class="label">Delivery Charges</span>
          <span class="val">Rs. ${deliveryCharges.toLocaleString()}</span>
        </div>
        ${
          (order?.couponDiscount || 0) > 0
            ? `<div class="totals-row discount">
                 <span class="label">Discount (${order?.couponCode || "Coupon"})</span>
                 <span class="val">− Rs. ${(order?.couponDiscount || 0).toLocaleString()}</span>
               </div>`
            : ""
        }
        <div class="totals-grand">
          <span class="label">Grand Total</span>
          <span class="val">Rs. ${(order?.totalPrice || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>

    ${customNote ? `
    <div style="padding: 15px 40px 0;">
      <div style="font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#9e8a6a; margin-bottom:5px;">Note</div>
      <div style="background:#faf8f4; border:1px solid #e8e0d0; border-radius:6px; padding:10px 12px; font-size:11px; color:#5a4a30; line-height:1.4;">${customNote}</div>
    </div>
    ` : ""}

    <!-- FOOTER -->
    <div class="inv-footer">
      <div class="footer-msg">
        ${thankYouText}<br/>
        <span style="font-size:11px;">For any queries, contact us on WhatsApp.</span>
      </div>
      <div class="footer-print">
        ${footerNote}<br/>
        <span style="font-size:9px; color:#b8a898;">Printed on: ${printDate} | Urban Threads Pakistan</span>
      </div>
    </div>
  </div>`;
};

export const styleBlock = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background: #faf8f4; color: #1a1208; font-size: 13px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  .page { background: #ffffff; border-radius: 0; position: relative; }
  
  /* ── HEADER ── */
  .inv-header { background: linear-gradient(135deg, #1a1208 0%, #2d2010 60%, #3d2e14 100%); padding: 36px 40px; display: flex; justify-content: space-between; align-items: center; }
  .brand-name { font-size: 26px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: #c9a84c; line-height: 1; }
  .brand-tagline { font-size: 10px; color: rgba(201,168,76,0.6); letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }
  .inv-title-block { text-align: right; }
  .inv-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 3px; text-transform: uppercase; }
  .inv-number { font-size: 22px; font-weight: 800; color: #c9a84c; margin-top: 4px; }
  .inv-date { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 6px; }
  
  /* ── STATUS BAR ── */
  .status-bar { background: #f7f3ec; border-bottom: 2px solid #e8e0d0; padding: 12px 40px; display: flex; align-items: center; justify-content: space-between; }
  .status-pill { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,168,76,0.1); border: 1.5px solid rgba(201,168,76,0.3); color: #8a6f3a; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #c9a84c; }
  .payment-badge { background: #1a120808; border: 1px solid #c9a84c44; color: #8a6f3a; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  
  /* ── META INFO ── */
  .meta-section { padding: 28px 40px 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .meta-card { background: #faf8f4; border: 1px solid #e8e0d0; border-radius: 8px; padding: 16px 18px; }
  .meta-card-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9e8a6a; margin-bottom: 10px; border-bottom: 1px solid #e8e0d0; padding-bottom: 7px; }
  .meta-card-name { font-size: 14px; font-weight: 700; color: #1a1208; margin-bottom: 4px; }
  .meta-card-line { font-size: 12px; color: #6a5a3a; margin-bottom: 2px; line-height: 1.5; }
  
  /* ── TABLE ── */
  .items-section { padding: 24px 40px 0; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9e8a6a; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
  thead tr { background: #2d2010; }
  thead th { padding: 11px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c9a84c; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) { background: #fdf9f3; }
  
  /* ── TOTALS ── */
  .totals-section { padding: 20px 40px 0; display: flex; justify-content: flex-end; }
  .totals-box { width: 280px; border: 1px solid #e8e0d0; border-radius: 8px; overflow: hidden; }
  .totals-row { display: flex; justify-content: space-between; padding: 9px 16px; border-bottom: 1px solid #f0ebe0; font-size: 12px; }
  .totals-row .label { color: #6a5a3a; }
  .totals-row .val { color: #1a1208; font-weight: 500; }
  .totals-row.discount .val { color: #16a34a; }
  .totals-grand { display: flex; justify-content: space-between; padding: 13px 16px; background: #2d2010; }
  .totals-grand .label { color: #c9a84c; font-weight: 700; font-size: 13px; }
  .totals-grand .val { color: #c9a84c; font-weight: 800; font-size: 15px; }
  
  /* ── FOOTER ── */
  .inv-footer { padding: 24px 40px 30px; margin-top: 24px; border-top: 1px solid #e8e0d0; display: flex; justify-content: space-between; align-items: center; }
  .footer-msg { font-size: 12px; color: #9e8a6a; line-height: 1.5; }
  .footer-msg strong { color: #c9a84c; }
  .footer-print { font-size: 10px; color: #b8a898; text-align: right; line-height: 1.5; }
  
  @media print {
    body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100% !important; border: none !important; box-shadow: none !important; }
    @page { margin: 0; size: A4; }
  }
</style>
`;

export const downloadInvoicePDF = async (order, settings) => {
  const invoiceNo = (order?._id || "ORDER").slice(-10).toUpperCase();
  const pageContent = generateInvoiceHtml(order, settings);

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "790px";
  container.style.backgroundColor = "#ffffff";
  container.style.zIndex = "-9999";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.innerHTML = styleBlock + pageContent;
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 300)); // buffer for font/style layout rendering

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: 790,
      height: container.scrollHeight,
      windowWidth: 790,
      windowHeight: container.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const pdf = new jsPDF("p", "mm", "a4");
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add remaining pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Urban-Threads-Invoice-${invoiceNo}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};

export const printInvoiceHTML = (order, settings) => {
  const invoiceNo = (order?._id || "ORDER").slice(-10).toUpperCase();
  const pageContent = generateInvoiceHtml(order, settings);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice #${invoiceNo} - Urban Threads</title>
  ${styleBlock}
</head>
<body>
  ${pageContent}
</body>
</html>`;

  const prevTitle = document.title;
  document.title = `Urban-Threads-Invoice-${invoiceNo}`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  iframe.contentWindow.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.title = prevTitle;
        document.body.removeChild(iframe);
      }, 2000);
    }, 300);
  };
};

/* ═══════════════════════════════════════════════════
   SHIPPING LABEL  —  PDF & Print
   Same pipeline as invoice (html2canvas + jsPDF)
   ═══════════════════════════════════════════════════ */

export const generateShippingLabelHtml = (order, settings) => {
  const name    = getName(order);
  const phone   = getPhone(order);
  const addr    = order?.shippingAddress || {};
  const orderNo = (order?._id || "ORDER").slice(-10).toUpperCase();
  const orderId = (order?._id || "ORDER").slice(-8).toUpperCase();

  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "N/A";
  const printDate = new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  const brandName    = settings?.brandName    || "URBAN THREADS";
  const brandPhone   = settings?.contactPhone || "0300-0000000";
  const brandEmail   = settings?.contactEmail || "support@urbanthreads.pk";
  const brandAddress = settings?.address      || "Pakistan";
  const courier      = order?.courierPartner  || "TCS / Leopard";
  const tracking     = order?.trackingNumber  || "";
  const isCOD        = (order?.paymentMethod || "COD").toLowerCase().includes("cod");
  const totalAmt     = (order?.totalPrice || 0).toLocaleString();

  const itemLines = (order?.orderItems || []).slice(0, 5).map((item) => {
    const variant = [item?.size, item?.color].filter(Boolean).join(", ");
    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#1a1208;margin-bottom:3px;">
      <span style="font-weight:600;">${item?.name || "Item"}${variant ? ` <span style="font-weight:400;color:#9e8a6a;font-size:10px;">(${variant})</span>` : ""}</span>
      <span style="font-weight:700;color:#5a4a30;">×${item?.quantity || 1}</span>
    </div>`;
  }).join("");

  const moreItems = (order?.orderItems || []).length - 5;

  const logoHtml = (settings?.invoiceShowLogo && settings?.logoImage)
    ? `<img src="${getImageUrl(settings.logoImage)}" alt="${brandName}" style="max-height:30px;max-width:120px;object-fit:contain;" />`
    : `<div style="font-size:18px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">${brandName}</div>`;

  // CSS barcode bars
  const barWidths = [1,2,1,3,1,2,2,1,3,1,2,1,1,3,2,1,2,1,3,1,1,2,1,2,3,1,2,1,1,2,3,1,2,1,2,3,1,1,2,1,3,2];
  const bars = barWidths.map(w =>
    `<div style="width:${w}px;background:#1a1208;height:100%;display:inline-block;margin-right:2px;"></div>`
  ).join("");

  return `
  <div style="width:680px;background:#ffffff;border:2px solid #1a1208;font-family:'Inter',Arial,sans-serif;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 60%,#3d2e14 100%);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        ${logoHtml}
        <div style="font-size:9px;color:rgba(201,168,76,0.65);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Shipping Label</div>
      </div>
      <div style="text-align:right;">
        <div style="background:rgba(201,168,76,0.18);border:1.5px solid rgba(201,168,76,0.45);color:#c9a84c;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">${courier}</div>
        ${tracking ? `<div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;">TRK: ${tracking}</div>` : ""}
      </div>
    </div>

    <!-- FROM / TO -->
    <div style="display:flex;align-items:stretch;border-bottom:2px dashed #e0d8c8;">
      <div style="width:210px;padding:18px 20px;border-right:1.5px dashed #e0d8c8;background:#faf8f4;flex-shrink:0;">
        <div style="font-size:8px;font-weight:800;letter-spacing:2.5px;color:#9e8a6a;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #e0d8c8;padding-bottom:5px;">FROM</div>
        <div style="font-size:13px;font-weight:800;color:#1a1208;margin-bottom:4px;">${brandName}</div>
        <div style="font-size:10px;color:#6a5a3a;margin-bottom:2px;">${brandAddress}</div>
        <div style="font-size:10px;color:#6a5a3a;margin-bottom:2px;">📞 ${brandPhone}</div>
        <div style="font-size:10px;color:#6a5a3a;">✉ ${brandEmail}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;width:36px;font-size:20px;color:#c9a84c;flex-shrink:0;background:#fff8ec;">▶</div>
      <div style="flex:1;padding:18px 20px;">
        <div style="font-size:8px;font-weight:800;letter-spacing:2.5px;color:#2d2010;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #e0d8c8;padding-bottom:5px;">DELIVER TO</div>
        <div style="font-size:18px;font-weight:800;color:#1a1208;margin-bottom:4px;">${addr.fullName || name}</div>
        <div style="font-size:12px;color:#3a3020;margin-bottom:2px;">${addr.address || "—"}</div>
        <div style="font-size:12px;color:#3a3020;font-weight:600;margin-bottom:4px;">${addr.city || "—"}${addr.province ? ", " + addr.province : ""}, Pakistan</div>
        ${addr.postalCode && addr.postalCode !== "00000" ? `<div style="font-size:10px;color:#6a5a3a;margin-bottom:2px;">Postal: ${addr.postalCode}</div>` : ""}
        <div style="font-size:14px;color:#1a1208;margin-top:6px;">📞 <strong>${phone || "—"}</strong></div>
      </div>
    </div>

    <!-- INFO STRIP -->
    <div style="display:flex;background:#2d2010;border-bottom:2px dashed #e0d8c8;">
      ${[
        ["Order ID", `#${orderId}`],
        ["Date", orderDate],
        ["Items", (order?.orderItems || []).length],
        ["Payment", order?.paymentMethod || "COD"],
      ].map(([label, val]) => `
        <div style="flex:1;padding:10px 16px;border-right:1px solid rgba(201,168,76,0.15);">
          <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(201,168,76,0.55);margin-bottom:2px;">${label}</div>
          <div style="font-size:12px;font-weight:700;color:#fff;">${val}</div>
        </div>`).join("")}
      ${isCOD ? `
        <div style="flex:1;padding:10px 16px;background:rgba(201,168,76,0.1);border-left:2px solid rgba(201,168,76,0.4);">
          <div style="font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(201,168,76,0.55);margin-bottom:2px;">COD Amount</div>
          <div style="font-size:14px;font-weight:800;color:#c9a84c;">Rs. ${totalAmt}</div>
        </div>` : ""}
    </div>

    <!-- ITEMS SUMMARY -->
    <div style="padding:14px 24px;border-bottom:1.5px solid #e8e0d0;">
      <div style="font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9e8a6a;margin-bottom:8px;">Items Ordered</div>
      ${itemLines}
      ${moreItems > 0 ? `<div style="font-size:10px;color:#9e8a6a;font-style:italic;margin-top:2px;">+ ${moreItems} more item(s)</div>` : ""}
      <div style="display:flex;justify-content:space-between;padding-top:8px;margin-top:8px;border-top:1px solid #e8e0d0;font-size:12px;font-weight:700;color:#1a1208;">
        <span>Grand Total</span>
        <span style="color:#c9a84c;font-size:14px;">Rs. ${totalAmt}</span>
      </div>
    </div>

    <!-- BARCODE -->
    <div style="padding:14px 24px 10px;display:flex;flex-direction:column;align-items:center;background:#faf8f4;border-bottom:1.5px solid #e0d8c8;">
      <div style="display:flex;align-items:stretch;height:48px;">
        ${bars}
      </div>
      <div style="margin-top:5px;font-family:monospace;font-size:11px;letter-spacing:4px;color:#5a4a30;">${orderNo}</div>
    </div>

    <!-- FOOTER -->
    <div style="padding:8px 24px;display:flex;justify-content:space-between;font-size:9px;color:#b8a898;background:#1a1208;">
      <span>Handle with care · ${brandName} Pakistan</span>
      <span>Printed: ${printDate}</span>
    </div>

  </div>`;
};

export const shippingLabelStyleBlock = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Inter',Arial,sans-serif;background:#f5f5f5;-webkit-print-color-adjust:exact;print-color-adjust:exact; }
  @media print { body{background:#fff!important;} @page{margin:6mm;size:A5 landscape;} }
</style>`;

/** Download shipping label as PDF (A5 landscape) — same html2canvas+jsPDF as invoice */
export const downloadShippingLabelPDF = async (order, settings) => {
  const orderNo  = (order?._id || "ORDER").slice(-10).toUpperCase();
  const html     = generateShippingLabelHtml(order, settings);

  const container = document.createElement("div");
  container.style.cssText = "position:absolute;left:0;top:0;width:680px;background:#fff;z-index:-9999;opacity:0;pointer-events:none;";
  container.innerHTML = shippingLabelStyleBlock + html;
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: 680,
      height: container.scrollHeight,
      windowWidth: 680,
      windowHeight: container.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    // A5 landscape → 210 × 148 mm
    const pdf   = new jsPDF("l", "mm", "a5");
    const pdfW  = 210;
    const pdfH  = 148;
    const imgW  = pdfW;
    const imgH  = (canvas.height * pdfW) / canvas.width;

    let heightLeft = imgH;
    let position   = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
    heightLeft -= pdfH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pdfH;
    }
    pdf.save(`Urban-Threads-ShippingLabel-${orderNo}.pdf`);
  } catch (err) {
    console.error("Shipping label PDF error:", err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
};

/** Print shipping label via hidden iframe (same as printInvoiceHTML) */
export const printShippingLabelHTML = (order, settings) => {
  const orderNo  = (order?._id || "ORDER").slice(-10).toUpperCase();
  const content  = generateShippingLabelHtml(order, settings);
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Shipping Label #${orderNo} - Urban Threads</title>
  ${shippingLabelStyleBlock}
</head>
<body>${content}</body>
</html>`;

  const prevTitle = document.title;
  document.title  = `Urban-Threads-ShippingLabel-${orderNo}`;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(fullHtml);
  iframe.contentDocument.close();

  iframe.contentWindow.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.title = prevTitle;
        document.body.removeChild(iframe);
      }, 2000);
    }, 350);
  };
};
