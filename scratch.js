import fs from 'fs';

// Fix Navbar.jsx
let navbar = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');

navbar = navbar.replace(/\[var\((--[\w-]+)\)\]/g, '($1)');
navbar = navbar.replace(/flex-shrink-0/g, 'shrink-0');
navbar = navbar.replace(/md:rounded-\[24px\]/g, 'md:rounded-3xl');
navbar = navbar.replace(/tracking-\[0\.1em\]/g, 'tracking-widest');
navbar = navbar.replace(/!py-2\.5/g, 'py-2.5!');
navbar = navbar.replace(/!px-5/g, 'px-5!');
navbar = navbar.replace(/!rounded-full/g, 'rounded-full!');
navbar = navbar.replace(/max-w-\[90px\]/g, 'max-w-22.5');
navbar = navbar.replace(/!text-\[0\.6rem\]/g, 'text-[0.6rem]!');
navbar = navbar.replace(/!px-2/g, 'px-2!');
navbar = navbar.replace(/!py-0\.5/g, 'py-0.5!');
navbar = navbar.replace(/z-\[60\]/g, 'z-60');
navbar = navbar.replace(/max-w-\[340px\]/g, 'max-w-85');
navbar = navbar.replace(/z-\[70\]/g, 'z-70');
navbar = navbar.replace(/!py-3\.5/g, 'py-3.5!');
navbar = navbar.replace(/!rounded-xl/g, 'rounded-xl!');
navbar = navbar.replace(/!text-sm/g, 'text-sm!');

// Make navbar text smaller
navbar = navbar.replace(/text-\[0\.85rem\]/g, 'text-xs');

fs.writeFileSync('frontend/src/components/Navbar.jsx', navbar);

// Fix CustomPage.jsx
let customPage = fs.readFileSync('frontend/src/pages/CustomPage.jsx', 'utf8');
customPage = customPage.replace(/fontSize: "15px"/g, 'fontSize: "13.5px"'); // Shrink text
fs.writeFileSync('frontend/src/pages/CustomPage.jsx', customPage);

console.log('Fixed files');
