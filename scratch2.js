import fs from 'fs';

let navbar = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');

// 1. Remove Shipping Policy from the fallback array
navbar = navbar.replace(/\s*\{\s*label:\s*"Shipping Policy",\s*to:\s*"\/page\/shipping-policy"\s*\},/g, '');

// 2. Fix all Tailwind CSS warnings manually and correctly
const replacements = [
  { from: /md:rounded-\[24px\]/g, to: 'md:rounded-3xl' },
  { from: /border-\[var\(--glass-border\)]/g, to: 'border-(--glass-border)' },
  { from: /border-\[var\(--border-light\)]/g, to: 'border-(--border-light)' },
  { from: /border-\[var\(--bg-card\)]/g, to: 'border-(--bg-card)' },
  { from: /border-\[var\(--border\)]/g, to: 'border-(--border)' },
  
  { from: /bg-\[var\(--bg-elevated\)]/g, to: 'bg-(--bg-elevated)' },
  { from: /bg-\[var\(--bg-card\)]/g, to: 'bg-(--bg-card)' },
  { from: /bg-\[var\(--bg-surface\)]/g, to: 'bg-(--bg-surface)' },
  { from: /bg-\[rgba\(201,168,76,0\.08\)]/g, to: 'bg-[rgba(201,168,76,0.08)]' }, // Not a var but just in case
  
  { from: /text-\[var\(--text-primary\)]/g, to: 'text-(--text-primary)' },
  { from: /text-\[var\(--text-secondary\)]/g, to: 'text-(--text-secondary)' },
  { from: /text-\[var\(--text-muted\)]/g, to: 'text-(--text-muted)' },
  { from: /text-\[var\(--gold\)]/g, to: 'text-(--gold)' },

  { from: /group-hover:text-\[var\(--gold\)]/g, to: 'group-hover:text-(--gold)' },
  { from: /group-hover:text-\[var\(--text-primary\)]/g, to: 'group-hover:text-(--text-primary)' },
  { from: /hover:bg-\[var\(--bg-elevated\)]/g, to: 'hover:bg-(--bg-elevated)' },
  { from: /hover:text-\[var\(--text-primary\)]/g, to: 'hover:text-(--text-primary)' },
  { from: /hover:text-\[var\(--gold\)]/g, to: 'hover:text-(--gold)' },
  { from: /hover:border-\[var\(--gold\)]/g, to: 'hover:border-(--gold)' },

  { from: /shadow-\[var\(--gold\)]\/20/g, to: 'shadow-(--gold)/20' },
  { from: /shadow-\[var\(--gold\)]\/30/g, to: 'shadow-(--gold)/30' },
  { from: /hover:shadow-\[var\(--gold\)]\/10/g, to: 'hover:shadow-(--gold)/10' },

  { from: /tracking-\[0\.1em\]/g, to: 'tracking-widest' },
  { from: /max-w-\[90px\]/g, to: 'max-w-22.5' },
  { from: /max-w-\[340px\]/g, to: 'max-w-85' },

  { from: /z-\[60\]/g, to: 'z-60' },
  { from: /z-\[70\]/g, to: 'z-70' },

  { from: /!py-2\.5/g, to: 'py-2.5!' },
  { from: /!px-5/g, to: 'px-5!' },
  { from: /!rounded-full/g, to: 'rounded-full!' },
  { from: /!text-\[0\.6rem\]/g, to: 'text-[0.6rem]!' },
  { from: /!px-2/g, to: 'px-2!' },
  { from: /!py-0\.5/g, to: 'py-0.5!' },
  { from: /!py-3\.5/g, to: 'py-3.5!' },
  { from: /!rounded-xl/g, to: 'rounded-xl!' },
  { from: /!text-sm/g, to: 'text-sm!' },

  { from: /flex-shrink-0/g, to: 'shrink-0' }
];

replacements.forEach(r => {
  navbar = navbar.replace(r.from, r.to);
});

fs.writeFileSync('frontend/src/components/Navbar.jsx', navbar);
console.log('Done replacing tailwind classes and removed shipping policy');
