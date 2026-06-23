import { callGeminiWithSDK } from "../services/gemini.service.js";

/* ─── GET API KEY ─── */
const getApiKey = (req) => req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY;

/* ─── QUOTA / RATE-LIMIT DETECTOR ─── */
const isQuotaError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  return (
    err?.status === 429 ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("rate limit")
  );
};

/* ══════════════════════════════════════════════
   1. CONTENT GENERATION (Admin AI Tools Hub)
══════════════════════════════════════════════ */
export const generateContent = async (req, res) => {
  try {
    const { type, inputs, customPrompt } = req.body;
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "Gemini API Key is missing. Please configure GEMINI_API_KEY in server .env."
      });
    }

    if (!type || !inputs) {
      return res.status(400).json({ success: false, message: "Type and inputs are required." });
    }

    let prompt = "";

    switch (type) {
      case "description": {
        const { name, category, features, tone, audience, language } = inputs;
        let langLabel = "English";
        if (language === "roman-urdu") langLabel = "Roman Urdu (Hinglish - Urdu words written in English alphabet)";
        if (language === "urdu") langLabel = "Urdu script (اردو)";

        prompt = `You are an expert streetwear copywriter for URBAN THREADS, a premium high-end streetwear clothing brand.
Write a high-converting, engaging product description for:
Product Name: ${name || "Unnamed Product"}
Category: ${category || "General"}
Key Features: ${features || "Premium cotton fabric"}
Tone of Voice: ${tone || "bold"} (bold = confident and direct, premium = luxurious and elegant, vintage = retro 90s style, casual = minimalist and relaxed)
Target Audience: ${audience || "unisex"}
Language: ${langLabel}

Instructions:
- Write a catchy, trendy, streetwear-focused product description.
- Include a bold hook line, a short main description paragraph, a bulleted list highlighting key features with stylish descriptions, and a quick "Styling Tip".
- Additional user instruction: ${customPrompt || "none"}.
- Do NOT include any meta commentary, explanations, or wrapper markdown blocks. Output only the copy.`;
        break;
      }

      case "seo": {
        const { name, keywords, description } = inputs;
        prompt = `You are a professional SEO Specialist for URBAN THREADS storefront.
Generate optimized SEO metadata and JSON-LD schema markup for this product:
Product Name: ${name || "Unnamed Product"}
Focus Keywords: ${keywords || "streetwear clothing"}
Product Summary: ${description || "Premium urban wear."}

Instructions:
Generate exactly the following sections. Do NOT include markdown code blocks or meta notes.
META TITLE: [optimized high-CTR title under 60 chars with keywords]
META DESCRIPTION: [high-converting summary under 160 chars]
META KEYWORDS: [comma-separated list of 10 highly relevant search terms]
JSON-LD SCHEMA:
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "${name || "Product"}",
  "description": "${description || "Streetwear"}",
  "brand": {
    "@type": "Brand",
    "name": "Urban Threads"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "PKR",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock"
  }
}

Additional user instruction: ${customPrompt || "none"}.`;
        break;
      }

      case "marketing": {
        const { name, goal, medium, discount, code } = inputs;
        prompt = `You are a Growth Marketing copywriter for URBAN THREADS.
Generate high-converting marketing copy for:
Campaign/Product: ${name || "New Arrivals"}
Campaign Goal: ${goal || "launch"} (launch, sale, or clearance)
Medium/Platform: ${medium || "instagram"} (instagram, newsletter, or broadcast)
Offer Details: ${discount ? `${discount} off` : "exclusive discount"} using code ${code || "N/A"}

Instructions:
- For Instagram: Write an engaging caption with line breaks, emojis, and streetwear hashtags.
- For Newsletter: Include a Subject Line, a Preview text, and the email body.
- For Broadcast (SMS/WhatsApp): Write a punchy, urgent message under 200 characters.
- Additional user instruction: ${customPrompt || "none"}.
- Return only the generated copy. No explanation or meta text.`;
        break;
      }

      case "banner-copy": {
        const { text, cta, bgTheme } = inputs;
        prompt = `You are a Creative Director for URBAN THREADS.
Based on the following banner parameters:
Main Text Hook: ${text || "STREETWEAR DROP"}
CTA text: ${cta || "SHOP NOW"}
Visual Theme: ${bgTheme || "obsidian"}

Generate:
1. 3 alternative bold and catchy streetwear headlines.
2. 3 premium CTA button variations.
Additional instruction: ${customPrompt || "none"}.
Format the output cleanly.`;
        break;
      }

      case "content": {
        const { contentType, topic, keywords } = inputs;
        prompt = `You are a professional blog and content writer for URBAN THREADS.
Generate high-quality content for:
Content Type: ${contentType || "blog"} (blog or faq)
Topic: ${topic || "Streetwear Trends"}
Keywords to Target: ${keywords || "streetwear, fashion"}

Instructions:
- If Blog: Write a full, well-structured article (approx. 350-500 words) with an engaging title, introductory hook, subheadings, and a conclusion.
- If FAQ: Provide a list of 5 highly relevant FAQs and clear, expert answers.
- Additional instruction: ${customPrompt || "none"}.
- Return only the generated content.`;
        break;
      }

      default:
        return res.status(400).json({ success: false, message: `Invalid type "${type}" specified.` });
    }

    const generatedText = await callGeminiWithSDK(prompt, apiKey);

    return res.status(200).json({ success: true, data: generatedText.trim() });

  } catch (err) {
    console.error("AI generate error:", err);
    if (isQuotaError(err)) {
      return res.status(429).json({ success: false, message: "AI quota exceeded. Please wait a minute and try again." });
    }
    return res.status(500).json({ success: false, message: err.message || "Failed to generate content." });
  }
};

/* ══════════════════════════════════════════════
   2. CUSTOMER SUPPORT CHAT (Public)
══════════════════════════════════════════════ */
export const supportChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return res.status(400).json({ success: false, message: "AI not configured." });
    }

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const systemInstruction = `You are "Urban Assistant", the friendly AI customer support agent for URBAN THREADS — a premium Pakistani streetwear brand based in Lahore.

Your personality: Warm, helpful, and knowledgeable. Mix Urdu/Roman Urdu with English naturally (like real Pakistani e-commerce support). Use emojis occasionally.

You know the following about Urban Threads:
- Brand: URBAN THREADS — premium streetwear (hoodies, tees, cargos, joggers)
- Products: 100% cotton, 300-360 GSM quality, heavyweight streetwear
- Delivery: Lahore 1-2 days, rest of Pakistan 3-5 working days  
- Payment: Cash on Delivery (COD), JazzCash, EasyPaisa, Bank Transfer
- Returns: 7-day return policy for unopened items
- Price range: Rs. 1,500 - Rs. 5,000
- WhatsApp: Available for urgent queries
- Website: urbanthreadss.store
- Sizing: XS to 3XL available, size guide on each product page

Rules:
- Keep responses concise (2-5 lines max)
- For order tracking, ask for Order ID
- For sizing, direct to product page size chart
- Be encouraging about purchases
- If asked something outside scope, politely redirect
- Do NOT make up specific prices or product names unless you know them
- End responses with a helpful follow-up question when appropriate`;

    // Build conversation history for context
    let conversationPrompt = "";
    
    if (history.length > 0) {
      const recentHistory = history.slice(-6); // Last 3 exchanges
      conversationPrompt = recentHistory.map(msg => 
        `${msg.from === "user" ? "Customer" : "Assistant"}: ${msg.text}`
      ).join("\n") + "\n\n";
    }

    conversationPrompt += `Customer: ${message}\nAssistant:`;

    const reply = await callGeminiWithSDK(conversationPrompt, apiKey, systemInstruction);

    return res.status(200).json({
      success: true,
      reply: reply.trim()
    });

  } catch (err) {
    console.error("Support chat AI error:", err);
    if (isQuotaError(err)) {
      return res.status(429).json({ success: false, message: "AI quota exceeded. Please wait a minute and try again.", fallback: true });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "AI chat failed.",
      fallback: true
    });
  }
};

/* ══════════════════════════════════════════════
   3. ANALYTICS AI INSIGHTS (Admin)
══════════════════════════════════════════════ */
export const analyticsInsights = async (req, res) => {
  try {
    const { statsData } = req.body;
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return res.status(400).json({ success: false, message: "Gemini API Key missing." });
    }

    if (!statsData) {
      return res.status(400).json({ success: false, message: "Stats data is required." });
    }

    const prompt = `You are an expert e-commerce business analyst for URBAN THREADS, a Pakistani streetwear brand.

Analyze the following business performance data and provide actionable insights:

${JSON.stringify(statsData, null, 2)}

Provide your analysis in EXACTLY this format (keep each section brief):

🔥 KEY PERFORMANCE SUMMARY
[2-3 sentences about overall performance trend]

✅ WINS THIS PERIOD
• [Best performing area]
• [Second best area]
• [Third win if applicable]

⚠️ AREAS NEEDING ATTENTION
• [Main concern with specific metric]
• [Second concern]

💡 TOP 3 ACTION RECOMMENDATIONS
1. [Specific, actionable step with expected impact]
2. [Specific, actionable step]
3. [Specific, actionable step]

📈 30-DAY REVENUE FORECAST
[One line prediction based on trends]

Keep all points concise and Pakistan-market specific. Use Pakistani Rupee (Rs.) for amounts.`;

    const insights = await callGeminiWithSDK(prompt, apiKey);

    return res.status(200).json({ success: true, insights: insights.trim() });

  } catch (err) {
    console.error("Analytics AI error:", err);
    if (isQuotaError(err)) {
      return res.status(429).json({ success: false, message: "AI quota exceeded. Please wait a minute and try again." });
    }
    return res.status(500).json({ success: false, message: err.message || "Failed to generate insights." });
  }
};

/* ══════════════════════════════════════════════
   4. ORDER AI ANALYSIS (Admin)
══════════════════════════════════════════════ */
export const orderAnalysis = async (req, res) => {
  try {
    const { orders } = req.body;
    const apiKey = getApiKey(req);

    if (!apiKey) {
      return res.status(400).json({ success: false, message: "Gemini API Key missing." });
    }

    if (!orders?.length) {
      return res.status(400).json({ success: false, message: "Orders data is required." });
    }

    // Summarize order data to avoid token limits
    const summary = {
      totalOrders: orders.length,
      statusBreakdown: orders.reduce((acc, o) => {
        acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
        return acc;
      }, {}),
      totalRevenue: orders.filter(o => o.orderStatus === "delivered").reduce((s, o) => s + (o.totalPrice || 0), 0),
      avgOrderValue: Math.round(orders.reduce((s, o) => s + (o.totalPrice || 0), 0) / orders.length),
      topCities: (() => {
        const cities = {};
        orders.forEach(o => {
          const city = o.shippingAddress?.city;
          if (city) cities[city] = (cities[city] || 0) + 1;
        });
        return Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city, count]) => ({ city, count }));
      })(),
      paymentMethods: orders.reduce((acc, o) => {
        const pm = o.paymentMethod || "COD";
        acc[pm] = (acc[pm] || 0) + 1;
        return acc;
      }, {}),
      cancelRate: Math.round(((orders.filter(o => o.orderStatus === "cancelled").length) / orders.length) * 100),
      guestVsRegistered: {
        guest: orders.filter(o => !o.user).length,
        registered: orders.filter(o => o.user).length
      }
    };

    const prompt = `As an e-commerce analyst for URBAN THREADS (Pakistani streetwear brand), analyze this order data and give concise actionable insights:

${JSON.stringify(summary, null, 2)}

Give insights in this format:

📦 ORDER HEALTH SCORE: [X/10 with brief reason]

🏙️ GEOGRAPHIC INSIGHTS
[2 lines about city performance and expansion opportunities]

💳 PAYMENT PATTERN INSIGHT
[1-2 lines about payment method trends]

🚨 CANCELLATION ANALYSIS
[Why cancel rate is ${summary.cancelRate}% and how to reduce it]

💡 QUICK WINS
• [Immediate action 1]
• [Immediate action 2]
• [Immediate action 3]

Keep it brief, data-driven, and Pakistan e-commerce specific.`;

    const analysis = await callGeminiWithSDK(prompt, apiKey);

    return res.status(200).json({ success: true, analysis: analysis.trim() });

  } catch (err) {
    console.error("Order AI error:", err);
    if (isQuotaError(err)) {
      return res.status(429).json({ success: false, message: "AI quota exceeded. Please wait a minute and try again." });
    }
    return res.status(500).json({ success: false, message: err.message || "Failed to analyze orders." });
  }
};
