import mongoose from "mongoose";
import dotenv from "dotenv";
import CustomPage from "./models/customPage.model.js";

dotenv.config();

const aboutContent = `
<div class="space-y-10 font-sans">
  <div class="text-center space-y-4">
    <p class="text-base font-semibold tracking-widest uppercase" style="color: var(--gold)">Our Brand Story</p>
    <h2 class="text-3xl md:text-5xl font-bold" style="color: var(--text-primary)">Redefining Modern Streetwear.</h2>
    <p class="max-w-2xl mx-auto text-[15px] leading-relaxed" style="color: var(--text-secondary)">URBAN THREADS was born out of a desire to blend luxury aesthetics with everyday streetwear. We believe that fashion is more than just clothing; it's a statement of identity, an expression of art, and a reflection of modern culture.</p>
  </div>

  <div class="grid md:grid-cols-2 gap-8 items-center mt-12">
    <div class="rounded-3xl overflow-hidden shadow-2xl relative group">
       <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80" alt="Brand Story" class="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-700" />
       <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
    </div>
    <div class="space-y-6">
       <h3 class="text-2xl font-bold" style="color: var(--text-primary)">The Journey</h3>
       <p class="text-[14.5px] leading-relaxed" style="color: var(--text-secondary)">What started as a small capsule collection has evolved into a full-fledged lifestyle brand. Our founders, deeply rooted in the hip-hop and underground fashion scenes, saw a gap in the market for high-quality, accessible luxury streetwear in Pakistan.</p>
       <blockquote class="border-l-4 pl-4 italic p-4 rounded-r-xl shadow-sm" style="border-color: var(--gold); background: var(--bg-elevated); color: var(--text-primary)">
         "We don't just design clothes; we engineer confidence. Every thread, every seam, and every silhouette is crafted with precision."
       </blockquote>
       <p class="text-[14.5px] leading-relaxed" style="color: var(--text-secondary)">Today, URBAN THREADS stands as a symbol of rebellion, creativity, and uncompromising quality. Our materials are sourced globally, ensuring that every piece feels as premium as it looks.</p>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-16" style="border-top: 1px solid var(--border-light)">
     <div class="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style="background: var(--bg-elevated); border-color: var(--border-light)">
        <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-black font-bold text-xl" style="background: linear-gradient(135deg, #c9a84c, #e8c96a)">1</div>
        <h4 class="font-bold text-lg" style="color: var(--text-primary)">Premium Quality</h4>
        <p class="text-xs" style="color: var(--text-muted)">We use only the finest fabrics that stand the test of time and trends.</p>
     </div>
     <div class="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style="background: var(--bg-elevated); border-color: var(--border-light)">
        <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-black font-bold text-xl" style="background: linear-gradient(135deg, #c9a84c, #e8c96a)">2</div>
        <h4 class="font-bold text-lg" style="color: var(--text-primary)">Exclusive Drops</h4>
        <p class="text-xs" style="color: var(--text-muted)">Limited quantity releases to ensure your style remains unique and exclusive.</p>
     </div>
     <div class="p-6 rounded-3xl text-center space-y-3 hover:-translate-y-2 transition-transform duration-300 shadow-sm border" style="background: var(--bg-elevated); border-color: var(--border-light)">
        <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-black font-bold text-xl" style="background: linear-gradient(135deg, #c9a84c, #e8c96a)">3</div>
        <h4 class="font-bold text-lg" style="color: var(--text-primary)">Ethical Craft</h4>
        <p class="text-xs" style="color: var(--text-muted)">Proudly crafted under fair conditions with a focus on sustainable practices.</p>
     </div>
  </div>
</div>
`;

const returnContent = `
<div class="space-y-8 font-sans">
  <div class="text-center max-w-2xl mx-auto space-y-4">
     <h2 class="text-3xl md:text-4xl font-bold" style="color: var(--text-primary)">Return & Exchange Policy</h2>
     <p class="text-[15px]" style="color: var(--text-secondary)">We want you to be completely satisfied with your purchase. If you are not entirely satisfied with your order, we are here to help.</p>
  </div>

  <div class="grid md:grid-cols-2 gap-6 mt-8">
    <div class="p-8 rounded-3xl border transition-colors shadow-sm" style="background: var(--bg-elevated); border-color: var(--border-light)" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border-light)'">
       <h3 class="text-xl font-bold mb-4" style="color: var(--gold)">1. Eligibility for Returns</h3>
       <ul class="space-y-3 text-[14px] list-disc pl-5" style="color: var(--text-secondary)">
         <li>You have <b style="color: var(--text-primary)">7 calendar days</b> to return an item from the date you received it.</li>
         <li>Your item must be <b style="color: var(--text-primary)">unused</b> and in the same condition that you received it.</li>
         <li>Your item must be in the original packaging with all tags attached.</li>
         <li>Items marked as "Final Sale" cannot be returned.</li>
       </ul>
    </div>
    
    <div class="p-8 rounded-3xl border transition-colors shadow-sm" style="background: var(--bg-elevated); border-color: var(--border-light)" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border-light)'">
       <h3 class="text-xl font-bold mb-4" style="color: var(--gold)">2. Exchange Process</h3>
       <p class="text-[14px] mb-4" style="color: var(--text-secondary)">We only replace items if they are defective, damaged, or if you received the wrong size. To initiate an exchange:</p>
       <ol class="space-y-3 text-[14px] list-decimal pl-5" style="color: var(--text-secondary)">
         <li>Contact our support team via WhatsApp or Email within 48 hours of delivery.</li>
         <li>Provide your Order ID and photographic evidence of the issue.</li>
         <li>Once approved, ship the item back to our warehouse.</li>
         <li>We will dispatch the replacement item within 2-3 business days.</li>
       </ol>
    </div>
  </div>

  <div class="p-8 rounded-3xl border mt-10 shadow-sm" style="background: var(--bg-card); border-color: var(--border)">
     <h3 class="text-xl font-bold mb-3" style="color: var(--text-primary)">3. Refunds</h3>
     <p class="text-[14.5px] leading-relaxed mb-3" style="color: var(--text-secondary)">
       Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
     </p>
     <p class="text-[14.5px] leading-relaxed" style="color: var(--text-secondary)">
       If your return is approved, we will initiate a refund to your original method of payment (or via Bank Transfer/JazzCash for COD orders). You will receive the credit within 5-7 business days, depending on your card issuer's policies.
     </p>
  </div>

  <div class="border p-6 rounded-2xl" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2)">
     <h4 class="text-red-500 font-bold mb-2 flex items-center gap-2">⚠️ Important Note on Shipping Costs</h4>
     <p class="text-[13.5px]" style="color: var(--text-secondary)">You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
  </div>
</div>
`;

const update = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await CustomPage.findOneAndUpdate(
      { slug: "about-us" },
      { content: aboutContent, title: "About Us" },
      { upsert: true }
    );
    console.log("Updated About Us");

    await CustomPage.findOneAndUpdate(
      { slug: "return-exchange-policy" },
      { content: returnContent, title: "Return & Exchange Policy" },
      { upsert: true }
    );
    console.log("Updated Return Policy");

    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

update();
