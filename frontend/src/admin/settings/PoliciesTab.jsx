import { useState } from "react";
import { FiFileText, FiBookOpen, FiShield, FiRotateCcw, FiTruck } from "react-icons/fi";

function Card({ children }) {
  return (
    <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-5 sm:p-6 space-y-5 hover:shadow-lg hover:border-(--border-light) transition-all duration-300">
      {children}
    </div>
  );
}

function SectionTitle({ title, desc, icon }) {
  return (
    <div className="mb-4">
      <h3 className="text-(--text-primary) font-bold text-base tracking-wide flex items-center gap-2">
        <span className="text-(--gold) shrink-0">{icon}</span>
        {title}
      </h3>
      {desc && <p className="text-(--text-muted) text-xs leading-relaxed mt-1 pl-6">{desc}</p>}
    </div>
  );
}

function Field({ label, field, form, set, type = "text", placeholder, rows, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-(--text-muted) uppercase tracking-wider pl-0.5">{label}</label>
      {rows ? (
        <textarea
          value={form[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="lux-input resize-none w-full font-mono text-sm"
          style={{ resize: "vertical", lineHeight: 1.6 }}
        />
      ) : (
        <input
          type={type}
          value={form[field] || ""}
          onChange={(e) => set(field, type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className="lux-input w-full"
        />
      )}
      {hint && <p className="text-[10px] text-(--text-muted) pl-0.5 italic mt-1">{hint}</p>}
    </div>
  );
}

function ToggleField({ label, field, form, set, desc }) {
  const val = form[field] !== false;
  return (
    <div className="flex items-center justify-between p-4 bg-(--bg-deep) border border-(--border) rounded-xl shadow-inner mt-4">
      <div>
        <p className="text-(--text-primary) text-xs font-bold uppercase tracking-wider">{label}</p>
        {desc && <p className="text-(--text-muted) text-[10px] mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => set(field, !val)}
        className="w-12 h-6 rounded-full transition-all relative shrink-0 cursor-pointer"
        style={{ background: val ? "var(--gold)" : "var(--bg-elevated)" }}
        type="button"
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm"
          style={{
            left: val ? "calc(100% - 22px)" : 2,
            background: val ? "#000" : "var(--text-muted)"
          }}
        />
      </button>
    </div>
  );
}

export default function PoliciesTab({ form, set }) {
  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex items-center gap-3 mb-2">
        <FiBookOpen className="text-[#c9a84c]" size={24} />
        <div>
          <h2 className="text-xl font-bold text-(--text-primary)">Legal & Policies Pages</h2>
          <p className="text-(--text-muted) text-xs">Configure Privacy Policy, Terms, Returns, and Shipping info pages.</p>
        </div>
      </div>

      {/* ── Privacy Policy ── */}
      <Card>
        <SectionTitle
          title="Privacy Policy"
          desc="Edit the Privacy Policy page settings. Dynamic link automatically matches /privacy route."
          icon={<FiShield size={18} />}
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Page Title"
              field="privacyPolicyTitle"
              form={form}
              set={set}
              placeholder="Privacy Policy"
            />
            <Field
              label="SEO Meta Title"
              field="privacyPolicyMetaTitle"
              form={form}
              set={set}
              placeholder="Privacy Policy | Urban Thread"
            />
          </div>
          <Field
            label="SEO Meta Description"
            field="privacyPolicyMetaDesc"
            form={form}
            set={set}
            rows={2}
            placeholder="Read the Privacy Policy of Urban Thread..."
          />
          <Field
            label="Page HTML Content"
            field="privacyPolicyContent"
            form={form}
            set={set}
            rows={10}
            placeholder="Write privacy policy content here. HTML tags are supported."
            hint="Tip: You can use standard HTML tags like <h2>, <p>, <ul>, <li>, <strong>, etc. for rich layout styling."
          />
          <ToggleField
            label="Enable Privacy Policy Page"
            field="privacyPolicyEnabled"
            form={form}
            set={set}
            desc="Toggle page availability. Disabling hides the page from the website gracefully."
          />
        </div>
      </Card>

      {/* ── Terms of Service ── */}
      <Card>
        <SectionTitle
          title="Terms of Service"
          desc="Edit the Terms of Service page settings. Dynamic link automatically matches /terms route."
          icon={<FiFileText size={18} />}
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Page Title"
              field="termsOfServiceTitle"
              form={form}
              set={set}
              placeholder="Terms of Service"
            />
            <Field
              label="SEO Meta Title"
              field="termsOfServiceMetaTitle"
              form={form}
              set={set}
              placeholder="Terms of Service | Urban Thread"
            />
          </div>
          <Field
            label="SEO Meta Description"
            field="termsOfServiceMetaDesc"
            form={form}
            set={set}
            rows={2}
            placeholder="Read the Terms of Service of Urban Thread..."
          />
          <Field
            label="Page HTML Content"
            field="termsOfServiceContent"
            form={form}
            set={set}
            rows={10}
            placeholder="Write terms of service content here. HTML tags are supported."
            hint="Tip: You can use standard HTML tags like <h2>, <p>, <ul>, <li>, <strong>, etc. for rich layout styling."
          />
          <ToggleField
            label="Enable Terms of Service Page"
            field="termsOfServiceEnabled"
            form={form}
            set={set}
            desc="Toggle page availability. Disabling hides the page from the website gracefully."
          />
        </div>
      </Card>

      {/* ── Return Policy ── */}
      <Card>
        <SectionTitle
          title="Return & Exchange Policy"
          desc="Edit the Return & Exchange Policy page settings. Dynamic link automatically matches /returns route."
          icon={<FiRotateCcw size={18} />}
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Page Title"
              field="returnPolicyTitle"
              form={form}
              set={set}
              placeholder="Return & Exchange Policy"
            />
            <Field
              label="SEO Meta Title"
              field="returnPolicyMetaTitle"
              form={form}
              set={set}
              placeholder="Return Policy | Urban Thread"
            />
          </div>
          <Field
            label="SEO Meta Description"
            field="returnPolicyMetaDesc"
            form={form}
            set={set}
            rows={2}
            placeholder="Read the Return Policy of Urban Thread..."
          />
          <Field
            label="Page HTML Content"
            field="returnPolicyContent"
            form={form}
            set={set}
            rows={10}
            placeholder="Write return policy content here. HTML tags are supported."
            hint="Tip: You can use standard HTML tags like <h2>, <p>, <ul>, <li>, <strong>, etc. for rich layout styling."
          />
          <ToggleField
            label="Enable Return Policy Page"
            field="returnPolicyEnabled"
            form={form}
            set={set}
            desc="Toggle page availability. Disabling hides the page from the website gracefully."
          />
        </div>
      </Card>

      {/* ── Shipping Info ── */}
      <Card>
        <SectionTitle
          title="Shipping Information"
          desc="Edit the Shipping Information page settings. Dynamic link automatically matches /shipping route."
          icon={<FiTruck size={18} />}
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Page Title"
              field="shippingInfoTitle"
              form={form}
              set={set}
              placeholder="Shipping Information"
            />
            <Field
              label="SEO Meta Title"
              field="shippingInfoMetaTitle"
              form={form}
              set={set}
              placeholder="Shipping Info | Urban Thread"
            />
          </div>
          <Field
            label="SEO Meta Description"
            field="shippingInfoMetaDesc"
            form={form}
            set={set}
            rows={2}
            placeholder="Read the Shipping Information of Urban Thread..."
          />
          <Field
            label="Page HTML Content"
            field="shippingInfoContent"
            form={form}
            set={set}
            rows={10}
            placeholder="Write shipping information content here. HTML tags are supported."
            hint="Tip: You can use standard HTML tags like <h2>, <p>, <ul>, <li>, <strong>, etc. for rich layout styling."
          />
          <ToggleField
            label="Enable Shipping Info Page"
            field="shippingInfoEnabled"
            form={form}
            set={set}
            desc="Toggle page availability. Disabling hides the page from the website gracefully."
          />
        </div>
      </Card>
    </div>
  );
}
