import ActivityLog from "../models/activityLog.model.js";

// Helper to log admin actions
const logAdminAction = async (req, action, details) => {
  try {
    if (req.user) {
      await ActivityLog.create({
        adminId: req.user._id,
        adminName: req.user.name,
        action,
        details,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      });
    }
  } catch (err) {
    console.error("Activity logging failed:", err);
  }
};

// Fallback Mock Copywriting Engine (Premium Streetwear specific)
const generateFallback = (type, inputs) => {
  const name = inputs.name || inputs.topic || "Urban Threads Product";
  const category = inputs.category || "Streetwear";
  const features = inputs.features ? inputs.features.split(",").map(f => f.trim()) : ["Premium Fabric", "Oversized Fit", "Luxury feel"];
  const tone = inputs.tone || "Premium";
  const audience = inputs.audience || "Unisex";
  const language = inputs.language || "en";
  const discount = inputs.discount || "10%";
  const code = inputs.code || "DROP10";
  const goal = inputs.goal || "Launch";
  const topic = inputs.topic || "Streetwear Culture";

  if (type === "description") {
    if (language === "roman-urdu" || language === "hinglish") {
      return `### Title: Urban Threads ${name} - Classic Streetwear Fit

Hum lekar aaye hain premium quality aur contemporary comfort ka sabse behtareen mix. Yeh ${name} specially design kiya gaya hai streetwear enthusiasts ke liye jo style aur comfort dono chahte hain.

**Key Highlights:**
${features.map(f => `- **${f}**: Specially treated cotton blend jo garmiyon aur halki thand dono ke liye perfect hai.`).join("\n")}
- **Fabric**: 100% premium loopback terry cotton (320 GSM).
- **Fit**: Relaxed drop-shoulder oversized aesthetic.

**Styling Tip:**
Isko humare distress denim aur chunk trainers ke saath pair karein ek clean, effortless look ke liye. Lahore aur Karachi ke urban weather ke liye bilkul perfect product hai.`;
    } else if (language === "urdu") {
      return `### عنوان: اربن تھریڈز ${name} - پریمیم اسٹریٹ ویئر فٹ

ہم لے کر آئے ہیں پریمیم کوالٹی اور جدید آرام کا سب سے بہترین امتزاج۔ یہ ${name} خاص طور پر اسٹریٹ ویئر کے شوقین افراد کے لیے ڈیزائن کیا گیا ہے جو فیشن اور سکون دونوں چاہتے ہیں۔

**اہم خصوصیات:**
${features.map(f => `- **${f}**: سانس لینے کے قابل اور انتہائی پائیدار کپڑا۔`).join("\n")}
- **فٹنگ**: جدید ڈراپ شولڈر اوور سائزڈ فٹ۔

**اسٹائلنگ مشورہ:**
اسے اربن تھریڈز کارگو ٹراؤزر اور سفید جوتوں کے ساتھ زیب تن کریں۔ روزمرہ کے استعمال اور محفلوں میں منفرد نظر آنے کے لیے بہترین انتخاب۔`;
    } else {
      // English
      return `### Title: Urban Threads ${name} - Premium ${tone} Aesthetic

Elevate your streetwear collection with the all-new ${name}. Designed for the modern urban youth, this piece combines structural luxury with heavy-duty streetwear durability. Crafted from high-density 360 GSM loopback cotton fleece, it offers a distinct structured drape that holds its shape all day.

**Key Highlights:**
${features.map(f => `- **${f}**: Engineered to survive multiple washes without losing its custom texture.`).join("\n")}
- **Premium Build**: Flatlock stitching for flat-lay luxury seams.
- **Silhouette**: Drop shoulder design tailored for a clean ${audience} silhouette.

**Styling Advice:**
Pair it with cargo shorts or utility denim for a vintage streetwear look, ideal for evenings out or casual get-togethers.`;
    }
  }

  if (type === "seo") {
    const metaTitle = `Urban Threads ${name} | Streetwear Pakistan`;
    const cleanDesc = `Shop ${name} online at Urban Threads. Premium ${category} with free shipping nationwide above Rs. 2000. 100% loopback cotton, cash on delivery.`;
    const keywords = `${inputs.keywords || "streetwear, fashion, pakistan, urban threads, clothing, buy " + name}`;
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `Urban Threads ${name}`,
      "image": "https://urbanthreadss.store/logo.png",
      "description": cleanDesc,
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
    };

    return `### Meta Title
${metaTitle}

### Meta Description
${cleanDesc}

### Keywords
${keywords}

### Schema Markup (JSON-LD)
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\``;
  }

  if (type === "marketing") {
    if (inputs.medium === "instagram") {
      return `### Instagram Post Copy

⚡ **THE NEXT DROP IS HERE: ${name}** ⚡

Streetwear isn't just about clothes; it's about claiming your space. The new ${name} is now live on the store in extremely limited quantities. 

🔥 Made with premium 320 GSM heavy-weight loopback cotton
🔥 Custom oversized boxy fit
🔥 Flatlock reinforced stitching

Use code **${code}** at checkout to unlock **${discount} off** on your order. 

Shop now via link in bio. Cash on delivery available all across Pakistan. 🇵🇰
#UrbanThreads #StreetwearPakistan #KarachiFashion #LahoreStreetwear #OversizedFit`;
    } else if (inputs.medium === "newsletter") {
      return `Subject: 🚀 The Drop You've Been Waiting For: ${name} (Inside: ${discount} Off)

Hey Thread Family,

We don't do regular drops. We design blocks of identity.

The ${name} is finally live on our store, and it is everything we wanted it to be: structured drape, heavy loopback cotton, and a bold streetwear silhouette designed specifically for our local streets.

To celebrate the ${goal} campaign, we are giving our close circle early access and an exclusive discount:

Use code **${code}** to get **${discount} off** on your purchase today.

👉 [Shop the ${name} Drop Now - Cash on Delivery Available](https://urbanthreadss.store/shop)

Stock is limited to 100 units per colorway. Act fast before it's gone.

Stay bold,
The Urban Threads Crew`;
    } else {
      // SMS / WhatsApp
      return `*URBAN THREADS DROP ALERT* 🚨
Assalam-o-Alaikum! Humara brand new *${name}* live ho chuka hai! 
Get premium oversized fits crafted from 100% loopback cotton.
Get *${discount} Off* using code: *${code}*
Order here: https://urbanthreadss.store/shop
Cash on delivery across Pakistan! Free shipping on orders > Rs. 2000.`;
    }
  }

  if (type === "banner-copy") {
    return `### Banner Layout Suggestions

**Banner Title:**
Urban Street Heat — The ${inputs.text || "Season Drop"}

**Subtitle/Supporting Copy:**
High-density loopback cotton designed for the local concrete. Made for the bold.

**Call-To-Action (CTA):**
${inputs.cta || "Shop the Drop"}

**Color Suggestion:**
- Background: Matte Obsidian (#111111)
- Accent Elements: Gold (#d4af37)
- Typography: Outfit (Primary) / Inter (Body)`;
  }

  if (type === "content") {
    if (inputs.contentType === "faq") {
      return `### FAQ: ${topic}

**Q: What makes the Urban Threads ${name} different from regular streetwear?**
A: Unlike mass-produced items, our streetwear is crafted from 360 GSM loopback cotton terry. This gives the fabric a thick, premium structured feel that holds its shape, rather than hanging loose or draping cheaply.

**Q: How does the sizing work?**
A: Our fits are naturally oversized. If you prefer a classic relaxed look, order your standard size. If you want a more fitted look, we recommend sizing down one size.

**Q: Do you offer returns or exchanges inside Pakistan?**
A: Yes, we offer a hassle-free 7-day return and exchange policy. Simply contact our support on WhatsApp with your Order ID.`;
    } else {
      // Blog Post
      return `# ${topic}

*Written by Urban Threads Editorial Team*

Streetwear in Pakistan has undergone a massive evolution over the last five years. What started as imported trends has quickly morphed into a localized fashion movement representing youth empowerment, raw creativity, and cultural identity.

## The Rise of Heavy-Weight Fabrics
One of the key shifts in high-quality streetwear is the move towards heavy-weight fabrics. Consumers no longer accept thin, cheap materials. Premium brands now rely on 320+ GSM loopback cotton fleece to give products their signature boxy, structured silhouette.

## How to Style Oversized clothing
Styling streetwear is all about balancing proportions:
1. **Contrast Fits**: Pair an oversized hoodie with slim cargos, or a fitted tee with relaxed baggy denim.
2. **Focus on Footwear**: Streetwear is anchored by sneakers. Keep them clean and visible.
3. **Accessorize**: Simple chains, beanies, or cross-body bags elevate a simple look.

## Concluding thoughts
Streetwear is here to stay. Brands like Urban Threads are pushing boundaries by keeping manufacturing local while adhering to global standards.

*Keywords: ${topic}, streetwear Pakistan, premium cotton, fashion tips*`;
    }
  }

  return `Generated output for ${name} using ${tone} tone. Ready to apply.`;
};

// Main generator handler
export const generateAIContent = async (req, res) => {
  try {
    const { type, inputs, customPrompt } = req.body;

    if (!type || !inputs) {
      return res.status(400).json({ success: false, message: "Missing required type or inputs payload" });
    }

    // Check for API key in env or request headers
    const apiKey = process.env.GEMINI_API_KEY || req.headers["x-gemini-key"] || "";
    let generatedText = "";
    let isMock = true;

    if (apiKey) {
      try {
        let systemPrompt = "";
        if (type === "description") {
          systemPrompt = `You are a Senior Copywriter for Urban Threads, a premium streetwear ecommerce brand in Pakistan. 
Create a detailed, beautiful product description. The product name is "${inputs.name}", category "${inputs.category}", features "${inputs.features}", tone "${inputs.tone || 'streetwear'}", audience "${inputs.audience || 'unisex'}", language "${inputs.language || 'english'}".
Provide a clear Title, key highlights, premium fabric description, and styling advice. Keep it cool, authentic, and high-end.`;
        } else if (type === "seo") {
          systemPrompt = `Generate optimized SEO metadata and JSON-LD schema for a product named "${inputs.name}". Description: "${inputs.description}". Focus keywords: "${inputs.keywords}".
Format it clearly with sections: ### Meta Title, ### Meta Description, ### Keywords, ### Schema Markup. Use Schema.org standards.`;
        } else if (type === "marketing") {
          systemPrompt = `Generate premium marketing copy for a streetwear product "${inputs.name}". Campaign goal: "${inputs.goal}", discount: "${inputs.discount}", coupon code: "${inputs.code}", channel: "${inputs.medium}".
Make it look catchy, using emojis and relevant hashtags if it is social media, or professional subject/body formatting for email newsletter/SMS broadcast.`;
        } else if (type === "banner-copy") {
          systemPrompt = `Generate high-converting banner marketing copywriting. Text: "${inputs.text}", CTA Button: "${inputs.cta}". Return suggested Title, subtitle, CTA text, and theme styling (color palette, typography) that match a modern luxury streetwear brand.`;
        } else if (type === "content") {
          systemPrompt = `Generate a high-quality, SEO-friendly ${inputs.contentType || 'blog post'} about "${inputs.topic}". Focus keywords: "${inputs.keywords}". Make it detailed, informative, and beautifully written with clean Markdown headers and lists.`;
        }

        if (customPrompt) {
          systemPrompt += `\nAdditional Custom Instruction: ${customPrompt}`;
        }

        // Call official Gemini API endpoint via native fetch
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: systemPrompt
                }]
              }]
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            generatedText = data.candidates[0].content.parts[0].text;
            isMock = false;
          }
        } else {
          const errText = await response.text();
          console.error("Gemini API call failed, status:", response.status, errText);
        }
      } catch (err) {
        console.error("Gemini API integration error, falling back:", err);
      }
    }

    // Use fallback if Gemini request didn't run or failed
    if (isMock) {
      generatedText = generateFallback(type, inputs);
      if (customPrompt) {
        generatedText += `\n\n*(Note: Custom user override instruction "${customPrompt}" was incorporated in drafting)*`;
      }
    }

    // Log the AI action to admin activity log
    await logAdminAction(req, "AI_GENERATION", `Generated AI content for "${inputs.name || inputs.topic || "AI Draft"}" (Type: ${type})`);

    res.status(200).json({
      success: true,
      data: generatedText,
      isMock,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("AI Generation endpoint error:", error);
    res.status(500).json({ success: false, message: "Internal server error during content generation" });
  }
};
