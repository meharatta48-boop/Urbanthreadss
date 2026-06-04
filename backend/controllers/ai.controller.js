import https from "https";

const callGemini = (prompt, apiKey) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.error?.message || `Gemini API returned status ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

export const generateContent = async (req, res) => {
  try {
    const { type, inputs, customPrompt } = req.body;
    
    // Retrieve Gemini API Key
    const apiKey = req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: "Gemini API Key is missing. Please save it in API Config settings or configure GEMINI_API_KEY in the server .env."
      });
    }

    if (!type || !inputs) {
      return res.status(400).json({
        success: false,
        message: "Type and inputs are required for content generation."
      });
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

      default: {
        return res.status(400).json({
          success: false,
          message: `Invalid type "${type}" specified.`
        });
      }
    }

    const response = await callGemini(prompt, apiKey);
    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({
        success: false,
        message: "Gemini API did not return any content parts. Please check your prompt or API status."
      });
    }

    return res.status(200).json({
      success: true,
      data: generatedText.trim()
    });

  } catch (err) {
    console.error("AI controller generation error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate content via Gemini API."
    });
  }
};
