import nodemailer from "nodemailer";

// Retrieve configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number.parseInt(process.env.SMTP_PORT || "465", 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_USER || "info@urbanthread.pk";

// Global constant styling for premium gold-dark luxury theme
const BRAND_COLOR = "#c9a84c"; // Gold
const BG_DARK = "#111827";     // Off-black Surface
const BG_LIGHT = "#fafafa";    // Warm off-white
const BORDER_COLOR = "#e5e7eb"; // Light border
const TEXT_DARK = "#111827";   // Deep charcoal
const TEXT_MUTED = "#6b7280";  // Muted gray

/**
 * Creates the Nodemailer transporter dynamically.
 * Returns null if SMTP credentials are missing to enforce safe logging fallbacks.
 */
const getTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      `[EMAIL SERVICE] ⚠️ SMTP credentials (EMAIL_USER & EMAIL_PASS) are missing. Emails will be printed to server logs instead.`
    );
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // Use SSL/TLS for 465, STARTTLS for 587/other
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

/**
 * Core send helper wrapped in strict try/catch to prevent API crashes.
 */
export const sendMail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`\n================= [CONSOLE LOG EMAIL FALLBACK] =================`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`TEXT: ${text || "See HTML representation"}`);
      console.log(`================================================================\n`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"Urban Thread Notifications" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL SERVICE] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE] ❌ Failed to dispatch email notification:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generates the master layout wrap for all email templates to match the brand identity.
 */
const getBrandLayout = (title, contentHTML) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${BG_LIGHT};
            color: ${TEXT_DARK};
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: ${BG_LIGHT};
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid ${BORDER_COLOR};
          }
          .header {
            background-color: ${BG_DARK};
            padding: 30px 40px;
            text-align: center;
            border-bottom: 3px solid ${BRAND_COLOR};
          }
          .logo {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.15em;
            color: #ffffff;
            text-transform: uppercase;
            margin: 0;
          }
          .logo-gold {
            color: ${BRAND_COLOR};
          }
          .body {
            padding: 40px;
          }
          .footer {
            background-color: ${BG_LIGHT};
            padding: 24px 40px;
            text-align: center;
            font-size: 12px;
            color: ${TEXT_MUTED};
            border-top: 1px solid ${BORDER_COLOR};
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            color: ${BG_DARK};
            margin-top: 0;
            margin-bottom: 20px;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: ${TEXT_DARK};
            margin-top: 0;
            margin-bottom: 16px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, ${BRAND_COLOR}, #aa7c11);
            color: #000000 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 10px rgba(201, 168, 76, 0.2);
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th {
            background-color: ${BG_LIGHT};
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: ${TEXT_MUTED};
            font-weight: 600;
            border-bottom: 2px solid ${BORDER_COLOR};
          }
          .table td {
            padding: 16px;
            font-size: 14px;
            border-bottom: 1px solid ${BORDER_COLOR};
            vertical-align: middle;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-gold {
            background-color: rgba(201, 168, 76, 0.15);
            color: ${BRAND_COLOR};
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">Urban <span class="logo-gold">Thread</span></div>
            </div>
            <div class="body">
              ${contentHTML}
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 12px; color: ${TEXT_MUTED};">© 2026 Urban Thread. Premium Streetwear. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: ${TEXT_MUTED};">Lahore, Pakistan • info@urbanthread.pk</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/* ==========================================================
   TRIGGERS FOR SPECIFIC BUSINESS EVENTS
   ========================================================== */

/**
 * 1. User Registration Signup Notifications
 */
export const sendNewRegistrationEmail = async (user) => {
  const adminSubject = `⚡ New User Registered: ${user.name}`;
  const adminHtml = getBrandLayout(
    adminSubject,
    `
    <h1>New Customer Account Created</h1>
    <p>We are excited to notify you that a new customer has joined the Urban Thread family!</p>
    <table class="table">
      <tr>
        <td style="font-weight: 600; width: 120px;">Name</td>
        <td>${user.name}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Email</td>
        <td><a href="mailto:${user.email}" style="color: ${BRAND_COLOR}; text-decoration: none;">${user.email}</a></td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Joined Date</td>
        <td>${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} PKT</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Account Status</td>
        <td><span class="badge badge-gold">Active</span></td>
      </tr>
    </table>
    <p style="margin-top: 30px;">Keep scaling! You can view and manage this customer in the admin dashboard.</p>
    `
  );

  const customerSubject = `Welcome to the Thread, ${user.name}! ✨`;
  const customerHtml = getBrandLayout(
    customerSubject,
    `
    <h1>Welcome to Urban Thread</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for creating an account with Urban Thread! You've joined Pakistan's premium streetwear brand, where global trends meet local culture.</p>
    <p>We're dedicated to delivering elite streetwear featuring uncompromising quality cottons, custom cuts, and bold styling.</p>
    <div style="text-align: center;">
      <a href="https://urbanthreadss.store/shop" class="btn">Explore the Collection</a>
    </div>
    <p style="margin-top: 20px;">If you have any questions or feedback, simply hit reply to this email. Our support crew is available 24/7 to guide your style journey.</p>
    <p>Stay bold,<br><b>The Urban Thread Crew</b></p>
    `
  );

  // Send admin notification
  await sendMail({
    to: ADMIN_EMAIL,
    subject: adminSubject,
    html: adminHtml,
    text: `New user registration. Name: ${user.name}, Email: ${user.email}`,
  });

  // Send welcoming email to customer
  await sendMail({
    to: user.email,
    subject: customerSubject,
    html: customerHtml,
    text: `Hi ${user.name}, Welcome to Urban Thread! Pakistani premium streetwear is now yours. Explore collections at https://urbanthreadss.store/shop`,
  });
};

/**
 * 2. Cart Addition Notifications
 */
export const sendCartAddEmail = async ({ product, user }) => {
  const customerName = user ? user.name : "Guest User";
  const customerEmail = user ? user.email : "Not Logged In";

  const adminSubject = `🛒 Cart Addition: ${product.name} by ${customerName}`;
  const adminHtml = getBrandLayout(
    adminSubject,
    `
    <h1>Product Added to Cart Alert</h1>
    <p>A customer has just placed an item into their cart. This indicates active buying intent!</p>
    
    <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Customer Profile</h2>
    <table class="table" style="margin-top: 5px;">
      <tr>
        <td style="font-weight: 600; width: 120px;">User Type</td>
        <td>${user ? `<span class="badge badge-gold">Registered Customer</span>` : `<span class="badge" style="background-color: #f3f4f6; color: #4b5563;">Guest</span>`}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Name</td>
        <td>${customerName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Email</td>
        <td>${user ? `<a href="mailto:${customerEmail}" style="color: ${BRAND_COLOR}; text-decoration: none;">${customerEmail}</a>` : "N/A"}</td>
      </tr>
    </table>

    <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Cart Item Details</h2>
    <table class="table" style="margin-top: 5px;">
      <tr>
        <td style="font-weight: 600; width: 120px;">Product Name</td>
        <td style="font-weight: 700; color: ${BRAND_COLOR};">${product.name}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Price</td>
        <td>Rs. ${product.price.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Quantity Added</td>
        <td><b>${product.quantity}</b> unit(s)</td>
      </tr>
      ${product.size ? `<tr><td style="font-weight: 600;">Size</td><td><span class="badge badge-gold">${product.size}</span></td></tr>` : ""}
      ${product.color ? `<tr><td style="font-weight: 600;">Color</td><td>${product.color}</td></tr>` : ""}
      <tr>
        <td style="font-weight: 600;">Total Value</td>
        <td style="font-weight: 700;">Rs. ${(product.price * product.quantity).toLocaleString()}</td>
      </tr>
    </table>
    <p style="margin-top: 30px; font-size: 13px; color: ${TEXT_MUTED}; text-align: center;">
      This event was captured in real-time on your store's storefront.
    </p>
    `
  );

  await sendMail({
    to: ADMIN_EMAIL,
    subject: adminSubject,
    html: adminHtml,
    text: `Cart addition alert. User: ${customerName} (${customerEmail}) added ${product.quantity}x ${product.name} to cart. Total: Rs. ${product.price * product.quantity}`,
  });
};

/**
 * 3. Order Placement Notifications (Admin breakdown + Customer Receipt)
 */
export const sendNewOrderEmail = async (order) => {
  const isGuest = !order.user;
  const buyerName = isGuest ? order.guestInfo?.name : order.user?.name || "Customer";
  const buyerEmail = isGuest ? order.guestInfo?.email : order.user?.email || "";
  const buyerPhone = isGuest ? order.guestInfo?.phone : order.shippingAddress?.phone || "";

  const itemsListHTML = order.orderItems
    .map(
      (item) => `
    <tr>
      <td style="font-weight: 600;">
        ${item.name}
        <div style="font-size: 11px; color: ${TEXT_MUTED}; font-weight: normal; margin-top: 3px;">
          ${item.size ? `Size: ${item.size}` : ""} ${item.color ? ` | Color: ${item.color}` : ""}
        </div>
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right; font-weight: 600;">Rs. ${item.price.toLocaleString()}</td>
      <td style="text-align: right; font-weight: 700;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const adminSubject = `🚨 New Order Placed: #${order._id.toString().slice(-6).toUpperCase()} — Rs. ${order.totalPrice.toLocaleString()}`;
  const adminHtml = getBrandLayout(
    adminSubject,
    `
    <h1 style="color: #10b981;">Order Confirmed Successfully</h1>
    <p>Excellent news! An order has been placed successfully by a buyer. Here is the operational and financial breakdown:</p>
    
    <table class="table">
      <tr>
        <td style="font-weight: 600; width: 150px;">Order Reference ID</td>
        <td style="font-family: monospace; font-weight: bold; color: ${BRAND_COLOR};">${order._id}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Payment Method</td>
        <td><span class="badge badge-gold">${order.paymentMethod || "COD"}</span></td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Time Placed</td>
        <td>${new Date(order.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} PKT</td>
      </tr>
    </table>

    <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Customer & Delivery Details</h2>
    <table class="table">
      <tr>
        <td style="font-weight: 600; width: 150px;">Buyer Type</td>
        <td>${isGuest ? "Guest Buyer" : "Registered User"}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Name</td>
        <td>${buyerName}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Phone Number</td>
        <td><a href="tel:${buyerPhone}" style="color: ${TEXT_DARK}; text-decoration: none;">${buyerPhone}</a></td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Email</td>
        <td>${buyerEmail ? `<a href="mailto:${buyerEmail}" style="color: ${BRAND_COLOR}; text-decoration: none;">${buyerEmail}</a>` : "Not Provided"}</td>
      </tr>
      <tr>
        <td style="font-weight: 600;">Shipping Address</td>
        <td style="line-height: 1.5;">
          <b>${order.shippingAddress?.fullName}</b><br>
          ${order.shippingAddress?.address}<br>
          ${order.shippingAddress?.city}, Pakistan
        </td>
      </tr>
    </table>

    <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Items Ordered</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsListHTML}
      </tbody>
    </table>

    <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Financials Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: ${TEXT_MUTED};">Items Subtotal</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600;">Rs. ${order.itemsPrice.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${TEXT_MUTED};">Shipping Charges</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600;">Rs. ${order.shippingPrice.toLocaleString()}</td>
      </tr>
      ${
        order.couponCode
          ? `
      <tr>
        <td style="padding: 8px 0; color: #10b981;">Coupon Discount (${order.couponCode})</td>
        <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 600;">- Rs. ${order.couponDiscount.toLocaleString()}</td>
      </tr>
      `
          : ""
      }
      <tr style="border-top: 1px solid ${BORDER_COLOR}; font-size: 16px; font-weight: bold;">
        <td style="padding: 12px 0; color: ${BG_DARK};">Gross Total Price (Customer Pay)</td>
        <td style="padding: 12px 0; text-align: right; color: ${BRAND_COLOR};">Rs. ${order.totalPrice.toLocaleString()}</td>
      </tr>
      <tr style="border-top: 1px dashed ${BORDER_COLOR}; font-size: 13px; color: ${TEXT_MUTED};">
        <td style="padding: 8px 0;">Calculated Production Cost</td>
        <td style="padding: 8px 0; text-align: right;">Rs. ${(order.totalCost || 0).toLocaleString()}</td>
      </tr>
      <tr style="font-size: 14px; font-weight: bold; color: #10b981;">
        <td style="padding: 8px 0;">Estimated Net Profit</td>
        <td style="padding: 8px 0; text-align: right;">Rs. ${(order.netProfit || 0).toLocaleString()}</td>
      </tr>
    </table>
    <p style="margin-top: 30px;">View this order on the <a href="https://urbanthreadss.store/admin/orders" style="color: ${BRAND_COLOR}; font-weight: 600; text-decoration: none;">Admin Panel</a> to dispatch the package.</p>
    `
  );

  // Send admin operational notification
  await sendMail({
    to: ADMIN_EMAIL,
    subject: adminSubject,
    html: adminHtml,
    text: `New order placed by ${buyerName} (Rs. ${order.totalPrice.toLocaleString()}). Payment Method: ${order.paymentMethod}. View details on the admin dashboard.`,
  });

  // If customer email is available, dispatch welcome receipt/invoice
  if (buyerEmail && buyerEmail.trim()) {
    const customerSubject = `Order Confirmed: #${order._id.toString().slice(-6).toUpperCase()} — Thank you for shopping with us!`;
    const customerHtml = getBrandLayout(
      customerSubject,
      `
      <h1>Your Order is Confirmed! 🎉</h1>
      <p>Hi ${buyerName},</p>
      <p>Thank you for shopping at Urban Thread! We have received your order and are preparing to craft your streetwear selection.</p>
      <p>Here is your official receipt. Please verify your delivery details below.</p>
      
      <div style="background-color: ${BG_LIGHT}; border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><b>Order Reference:</b> #${order._id.toString().slice(-6).toUpperCase()}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><b>Payment Status:</b> Pending Cash on Delivery (COD)</p>
        <p style="margin: 0; font-size: 14px;"><b>Shipping Address:</b><br>${order.shippingAddress?.fullName}, ${order.shippingAddress?.address}, ${order.shippingAddress?.city}, Pakistan</p>
      </div>

      <h2 style="font-size: 16px; margin: 25px 0 10px 0; color: ${BG_DARK}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">Order Summary</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHTML}
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: ${TEXT_MUTED};">Items Subtotal</td>
          <td style="padding: 8px 0; text-align: right;">Rs. ${order.itemsPrice.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${TEXT_MUTED};">Shipping & Handling</td>
          <td style="padding: 8px 0; text-align: right;">Rs. ${order.shippingPrice.toLocaleString()}</td>
        </tr>
        ${
          order.couponCode
            ? `
        <tr>
          <td style="padding: 8px 0; color: #10b981;">Coupon Discount (${order.couponCode})</td>
          <td style="padding: 8px 0; text-align: right; color: #10b981;">- Rs. ${order.couponDiscount.toLocaleString()}</td>
        </tr>
        `
            : ""
        }
        <tr style="border-top: 1px solid ${BORDER_COLOR}; font-size: 16px; font-weight: bold;">
          <td style="padding: 12px 0; color: ${BG_DARK};">Total Price (Cash to Pay on Delivery)</td>
          <td style="padding: 12px 0; text-align: right; color: ${BRAND_COLOR};">Rs. ${order.totalPrice.toLocaleString()}</td>
        </tr>
      </table>

      <div style="background-color: rgba(201, 168, 76, 0.05); border: 1px dashed ${BRAND_COLOR}; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: ${BRAND_COLOR};">⚡ FAST COD SHIPPING</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: ${TEXT_DARK};">Your package will be delivered within 2-4 working days. Please have exact cash ready upon delivery.</p>
      </div>

      <p style="margin-top: 30px;">If you need to make any changes to your shipping info or cancel this order, contact our WhatsApp crew immediately at <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || "923003765389"}" style="color: ${BRAND_COLOR}; font-weight: bold; text-decoration: none;">+92 300 3765389</a>.</p>
      
      <p style="margin-top: 20px;">Thank you for representing Pakistani streetwear with Urban Thread.</p>
      <p>Stay bold,<br><b>The Urban Thread Crew</b></p>
      `
    );

    // Send customer welcome invoice
    await sendMail({
      to: buyerEmail,
      subject: customerSubject,
      html: customerHtml,
      text: `Hi ${buyerName}, Thank you for your order! Your order reference is #${order._id.toString().slice(-6).toUpperCase()}. Total amount: Rs. ${order.totalPrice.toLocaleString()}. We will deliver it within 2-4 days.`,
    });
  }
};
