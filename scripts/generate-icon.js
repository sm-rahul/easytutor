const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;
const HALF = SIZE / 2;

// Build the SVG icon: graduation cap + brain on dark purple gradient
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <!-- Background gradient (deep purple to dark blue, matching app theme) -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1040"/>
      <stop offset="50%" stop-color="#0D0F1A"/>
      <stop offset="100%" stop-color="#0a0a20"/>
    </linearGradient>

    <!-- Accent gradient (purple accent matching app) -->
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>

    <!-- Glow gradient for the brain -->
    <linearGradient id="brainGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="50%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>

    <!-- Cyan accent for highlights -->
    <linearGradient id="cyan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>

    <!-- Outer glow filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Subtle inner shadow for depth -->
    <radialGradient id="innerLight" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="rgba(168, 85, 247, 0.15)"/>
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
    </radialGradient>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="${SIZE}" height="${SIZE}" rx="220" ry="220" fill="url(#bg)"/>

  <!-- Subtle radial light in upper area -->
  <rect width="${SIZE}" height="${SIZE}" rx="220" ry="220" fill="url(#innerLight)"/>

  <!-- Subtle decorative circle -->
  <circle cx="${HALF}" cy="${HALF - 20}" r="280" fill="none" stroke="rgba(168, 85, 247, 0.08)" stroke-width="2"/>
  <circle cx="${HALF}" cy="${HALF - 20}" r="320" fill="none" stroke="rgba(168, 85, 247, 0.04)" stroke-width="1.5"/>

  <!-- BRAIN ICON (centered, slightly above middle) -->
  <g transform="translate(${HALF}, ${HALF - 40}) scale(5.5)" filter="url(#softGlow)">
    <!-- Brain - left hemisphere -->
    <path d="M-2,0 C-2,-8 -8,-16 -16,-18 C-24,-20 -30,-14 -32,-8 C-34,-2 -32,4 -28,8
             C-34,6 -38,10 -38,16 C-38,22 -34,26 -28,26
             C-30,30 -26,34 -20,34 C-16,34 -12,32 -10,28
             C-8,32 -4,34 0,34"
          fill="none" stroke="url(#brainGlow)" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Brain - right hemisphere -->
    <path d="M2,0 C2,-8 8,-16 16,-18 C24,-20 30,-14 32,-8 C34,-2 32,4 28,8
             C34,6 38,10 38,16 C38,22 34,26 28,26
             C30,30 26,34 20,34 C16,34 12,32 10,28
             C8,32 4,34 0,34"
          fill="none" stroke="url(#brainGlow)" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Brain center line -->
    <path d="M0,-18 L0,34" fill="none" stroke="url(#brainGlow)" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,6"/>

    <!-- Brain folds - left -->
    <path d="M-8,-10 C-14,-8 -20,-4 -22,2" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-6,6 C-12,8 -22,10 -26,16" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-6,18 C-10,20 -18,22 -22,28" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Brain folds - right -->
    <path d="M8,-10 C14,-8 20,-4 22,2" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M6,6 C12,8 22,10 26,16" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M6,18 C10,20 18,22 22,28" fill="none" stroke="rgba(192, 132, 252, 0.6)" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- GRADUATION CAP (on top of brain) -->
  <g transform="translate(${HALF}, ${HALF - 200})" filter="url(#glow)">
    <!-- Cap top (diamond/rhombus shape) -->
    <polygon points="0,-55 160,0 0,35 -160,0" fill="url(#accent)" stroke="rgba(196, 132, 252, 0.4)" stroke-width="2"/>

    <!-- Cap top highlight -->
    <polygon points="0,-55 160,0 0,-10 -160,0" fill="rgba(255,255,255,0.08)"/>

    <!-- Center button -->
    <circle cx="0" cy="0" r="12" fill="url(#cyan)"/>
    <circle cx="0" cy="0" r="6" fill="rgba(255,255,255,0.4)"/>

    <!-- Tassel string -->
    <path d="M0,0 L0,20 Q2,40 -40,70 Q-55,80 -60,110" fill="none" stroke="url(#cyan)" stroke-width="4" stroke-linecap="round"/>

    <!-- Tassel end -->
    <path d="M-60,108 L-65,140 M-60,108 L-60,142 M-60,108 L-55,140 M-60,108 L-70,138 M-60,108 L-50,138"
          stroke="#22D3EE" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Small sparkle dots for AI feel -->
  <circle cx="180" cy="280" r="4" fill="#A855F7" opacity="0.6"/>
  <circle cx="844" cy="320" r="3" fill="#22D3EE" opacity="0.5"/>
  <circle cx="220" cy="720" r="3.5" fill="#C084FC" opacity="0.4"/>
  <circle cx="800" cy="700" r="4" fill="#A855F7" opacity="0.5"/>
  <circle cx="160" cy="500" r="2.5" fill="#22D3EE" opacity="0.3"/>
  <circle cx="860" cy="520" r="3" fill="#C084FC" opacity="0.3"/>

  <!-- "ET" subtle text mark at bottom -->
  <text x="${HALF}" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="800" letter-spacing="8" fill="rgba(168, 85, 247, 0.25)">
    EASYTUTOR
  </text>
</svg>`;

async function generate() {
  const outputPath = path.join(__dirname, '..', 'src', 'img', 'favicon.png');

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(outputPath);

  console.log('Icon generated at:', outputPath);
}

generate().catch(console.error);
