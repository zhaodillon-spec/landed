# Landed Web App - Complete Design Specification

## Overview
A landing page for "Landed" - an import-cost intelligence tool for independent fashion brands. The site showcases a calculator concept for estimating landed costs including tariffs, duties, shipping, and taxes.

---

## 1. NAVIGATION & HEADER

### Desktop Navigation Bar
- **Logo**: "Landed." with icon (black droplet/package character with face)
- **Nav Links**: 
  - "Why it matters" → navigates to `/#problem`
  - "What we're building" → navigates to `/#features`
- **CTA Button**: "Join the waitlist" (blue button, navigates to `/waitlist`)

### Mobile Navigation
- Hamburger menu replaces text nav links
- Logo remains left-aligned
- "Join the waitlist" button in header

---

## 2. HERO SECTION

### Layout
- **Desktop**: Two-column layout
  - Left: Headline + body copy + CTAs
  - Right: Sample landed cost estimate card
- **Mobile**: Single column, stacked vertically

### Content

**Tagline** (uppercase, small, blue):
```
● BUILT FOR INDEPENDENT FASHION BRANDS.
```

**Headline** (large serif):
```
Know the real cost of bringing your designs to life.
```
- "to life." is styled in blue italic serif

**Body Copy**:
```
Tariffs, shipping, duties, and supplier comparisons — all in one place. Make smarter sourcing decisions before your next order.
```

**CTAs**:
1. Primary button: "Join the waitlist →" (blue, rounded)
2. Secondary link: "See what we're building" (text link, no border)

### Sample Landed Cost Card (Right Side)

**Header**:
```
PORTUGAL → CANADA
LANDED COST ESTIMATE
200 linen shirts
```

**Visual**: Horizontal stacked bar chart showing cost breakdown:
- Black segment: Product cost
- Light gray: Freight & insurance  
- Blue: Duties & tariffs
- Lighter blue: Import taxes

**Breakdown List**:
```
● Product cost          $4,200
● Freight & insurance     $610
● Duties & tariffs        $722
● Import taxes            $318
```

**Total Display**:
```
LANDED COST
$5,850
ILLUSTRATIVE
```

**Badge**: "$29.25 / unit" (blue pill button)

**Mascot**: Black character icon appears in top-right corner of card

---

## 3. PROBLEM SECTION

### Layout
- **Desktop**: Two-column
  - Left: Problem statement headline
  - Right: Three problem cards
- **Mobile**: Stacked vertically

### Content

**Section Label** (uppercase, small):
```
THE PROBLEM
```

**Headline**:
```
Importing shouldn't come with financial surprises.
```
- "financial surprises" in blue italic serif

**Problem Cards** (3 numbered cards):

**01 - Hidden costs**
```
● TARIFFS
  + DUTIES
  + TAXES
```
Body: "Unexpected tariffs, duties, and taxes can destroy your margins."

**02 - Sourcing confusion**
```
PT  VN  TR  IN  [globe icon]
```
Body: "Comparing suppliers and countries is time-consuming."

**03 - Supplier uncertainty**
```
CHEAPEST  ?  BEST
```
Body: "The cheapest quote doesn't always mean the best supplier."

---

## 4. FEATURES SECTION

### Section Header
```
WHAT WE'RE BUILDING
Everything you need to source smarter.
```
- "source smarter" in blue italic serif

### Feature 01: True Import Cost Calculator

**Layout**: Card with preview of calculator interface

**Label**: `FEATURE 01` (blue, uppercase, small)

**Headline**: "True Import Cost Calculator"

**Body**: "Estimate the landed cost of an order, including shipping, duties, tariffs, and taxes."

**Preview Interface**:
```
UNIT COST  $21.00    QUANTITY  200    FROM  Portugal
TO  Canada

[Stacked bar chart]
● PRODUCT  ● FREIGHT  ● DUTIES  ● TAXES

EST. LANDED COST
$29.25 / unit

CONCEPT PREVIEW • ILLUSTRATIVE NUMBERS
```

### Feature 02: Supplier Comparison

**Label**: `FEATURE 02`

**Headline**: "Supplier Comparison"

**Body**: "Compare sourcing options based on estimated costs and other relevant factors."

**Preview**:
```
OPTION A
Portugal          $29.25 / unit
[Black bar]
Shorter lead time    Higher unit price

OPTION B
Vietnam           $26.88 / unit
[Blue bar - longer]
Lower unit price     Longer transit

CONCEPT PREVIEW • ILLUSTRATIVE NUMBERS
```

### Feature 03: Supplier Reliability Insights

**Label**: `FEATURE 03`

**Headline**: "Supplier Reliability Insights"

**Body**: "Make more informed sourcing decisions by considering supplier reliability, not just price."

**Preview**:
```
Quote A          LOWEST PRICE
[Short bar segments]
Fewer reliability signals

Quote B          SLIGHTLY HIGHER PRICE
[Longer bar with more segments]
Stronger reliability signals

CONCEPT PREVIEW • ILLUSTRATIVE NUMBERS
```

---

## 5. ASSISTANT SECTION

### Layout
- **Desktop**: Two-column
  - Left: Intro copy
  - Right: Chat interface mockup
- **Mobile**: Stacked

### Content

**Section Label**: `MEET TANGO`

**Headline**:
```
Still have questions? Ask Tango.
```
- "Ask Tango" in blue italic serif

**Body**:
```
Tango is Landed's AI agent. Once you've calculated everything, ask him anything you're still unsure about and he'll help you make sense of the numbers.
```

### Chat Interface Preview

**Response Bubble**:
```
Duties & tariffs are $722 of your $5,850 estimate, about 12%. Want me to walk through where that comes from?
```

**Suggestion Chips**:
- "Why are my duties this high?"
- "Which option costs less to land?"
- "What's included in import taxes?"

**Input Field**:
```
Ask Tango about your estimate...  [→]
```

**Note**: `CONCEPT PREVIEW • ILLUSTRATIVE NUMBERS`

---

## 6. FOOTER / CTA SECTION

### Content

**Headline**:
```
Be among the first to source smarter.
```
- "source smarter" in blue italic serif

**Body**:
```
We're building this for independent fashion brands. Join the early-access list and help shape what comes next.
```

**Form Fields**:
1. Email input: "you@yourbrand.com"
2. Brand name (optional): "Your label"
3. Submit button: "Get early access" (blue, full-width)

### Footer Info
```
[Logo] Landed.
Import-cost intelligence for independent fashion

hello@example.com
```

---

## 7. WAITLIST PAGE (/waitlist)

**Headline**:
```
Be among the first to source smarter.
```

**Body**:
```
We're building this for independent fashion brands. Join the early-access list and help shape what comes next.
```

**Form** (same as footer form)

---

## 8. COLOR PALETTE

### Primary Colors
- **Primary Blue**: `rgb(67, 97, 238)` / `#4361EE` (buttons, links, accents)
- **Blue Accent (light)**: `rgb(118, 139, 253)` / `#768BFD` (chart segments, highlights)

### Neutrals
- **Background**: Very light lavender/gray `rgb(243, 244, 250)` / `#F3F4FA`
- **Card Background**: White `#FFFFFF`
- **Text Primary**: Near-black `rgb(20, 20, 30)` / `#14141E`
- **Text Secondary/Muted**: Gray `rgb(120, 120, 140)` / `#78788C`

### Chart Colors
- **Black**: Product cost segments
- **Dark Gray**: `rgb(200, 200, 210)` for freight
- **Blue**: `rgb(67, 97, 238)` for duties
- **Light Blue**: `rgb(160, 180, 255)` for taxes

---

## 9. TYPOGRAPHY

### Fonts

**Headings**: `"Instrument Serif", Georgia, serif`
- Large headlines: ~60-72px
- Section headlines: ~40-48px
- Feature headlines: ~28-32px
- Weight: Regular/Normal (400)

**Body Text**: Sans-serif (likely `"Inter"` or system sans)
- Body: ~16-18px
- Small labels: ~12-14px uppercase with letter-spacing
- Weight: Regular (400) for body, Medium (500) for buttons/labels

### Type Styles

**Uppercase Labels**:
- Section labels: Small, uppercase, blue or gray, wide letter-spacing
- Example: `FEATURE 01`, `THE PROBLEM`, `LANDED COST`

**Italic Blue Serif**: Used for emphasis in headlines
- "to life.", "financial surprises", "source smarter", "Ask Tango"

**Numbers**: Large display numbers in sans-serif
- Example: "$5,850" (large), "$29.25 / unit" (medium)

---

## 10. SPACING & LAYOUT

### Container
- Max width: ~1200-1280px
- Padding: ~60-80px horizontal on desktop
- Mobile: ~20-24px horizontal padding

### Sections
- Vertical spacing between sections: ~120-160px
- Mobile: ~80-100px

### Cards
- Padding: ~32-40px
- Border radius: ~16-20px
- Box shadow: Subtle, soft shadow
- Background: White on light gray/lavender page background

### Buttons
- Padding: ~14px 28px
- Border radius: ~24px (pill shape)
- Font weight: Medium (500)

---

## 11. INTERACTIVE ELEMENTS

### Tested Elements & Behavior

**Navigation Links**:
- "Why it matters" → Scrolls/navigates to `/#problem`
- "What we're building" → Scrolls/navigates to `/#features`

**CTA Buttons**:
- "Join the waitlist" → Navigates to `/waitlist` page
- "Get early access" → Form submission (not yet functional)

**Assistant Chips**:
- Appear to be static/illustrative (not functional yet)

**Calculator Interface**:
- All calculator elements (inputs, dropdowns) appear to be illustrative/static
- No live computation detected

**Form Inputs**:
- Email and brand name fields are functional inputs
- Submit button present but action not tested

### Visual States
- Buttons have hover states (likely darker blue or scale effect)
- Links underlined or color change on hover
- No complex animations observed (smooth scroll, subtle transitions)

---

## 12. RESPONSIVE BEHAVIOR

### Mobile (~390px width)

**Layout Changes**:
- Single column layout throughout
- Hero section: Headline above, card below
- Problem cards: Stacked vertically
- Feature cards: Full-width, stacked
- Navigation: Hamburger menu (assumption based on industry standard)

**Typography**:
- Headlines scale down (~40-48px on mobile)
- Body text remains readable (~16px)

**Cards**:
- Full-width minus horizontal padding
- Maintain border-radius and shadows

**Buttons**:
- Full-width or centered
- Maintain padding and pill shape

---

## 13. LOGO & MASCOT

**Logo**: 
- Icon: Black droplet/package character with simple face (two dots for eyes, smile)
- Text: "Landed." in serif font
- Usage: Appears in header, footer, and on cards

**Mascot/Character**:
- Small black character with blue accent (halo/antenna on top)
- Appears throughout: hero card, problem section, assistant section, footer
- Style: Simple, friendly, approachable

---

## 14. COPY TONE & STYLE

**Voice**: Professional but approachable, clear, benefit-focused

**Key Phrases**:
- "Import-cost intelligence for independent fashion"
- "Source smarter"
- "Make smarter sourcing decisions"
- "Everything you need to source smarter"

**Structure**: Problem → Solution → Features → CTA

**Disclaimers**: "CONCEPT PREVIEW • ILLUSTRATIVE NUMBERS" appears on all preview interfaces

---

## 15. ROUTES DISCOVERED

- `/` - Homepage
- `/#problem` - Problem section anchor
- `/#features` - Features section anchor
- `/waitlist` - Waitlist signup page

**Untested common routes**: `/calculator`, `/compare`, `/app`, `/login`, `/about`, `/pricing` - no evidence these exist yet

---

## 16. SCREENSHOTS CAPTURED

All screenshots saved to `/tmp/computer-use/`:

**Desktop Full-Page**:
- `ccacc.webp` - Hero section
- `ce9a8.webp` - Problem section top
- `f1d72.webp` - Problem section bottom / Features intro
- `9723d.webp` - Features section (calculator)
- `34b5c.webp` - Features section (comparison & reliability)
- `24514.webp` - Assistant section
- `07256.webp` - Footer CTA section

**Navigation Testing**:
- `919e5.webp` - "Why it matters" → Problem section
- `829fd.webp` - "What we're building" → Features section
- `0581b.webp` - Waitlist page

**Mobile View** (~390px):
- `94de0.webp` - Mobile hero
- `3e1bb.webp` - Mobile cost card

**DevTools/Inspection**:
- Various screenshots from earlier inspection work

---

## 17. DESIGN SYSTEM NOTES

### Component Patterns

**Card Component**:
- White background
- ~16-20px border radius
- Subtle shadow
- ~32-40px padding
- Optional header label (uppercase, small)

**Button Component**:
- Primary: Blue background, white text
- Secondary: Transparent, text only
- Pill shape (high border radius)
- Arrow icon "→" for primary actions

**Badge/Chip Component**:
- Small pill-shaped elements
- Blue background or outline
- Used for: unit prices, suggestion chips, tags

**Stacked Bar Chart**:
- Horizontal bar with colored segments
- Legend with bullet points matching colors
- Used for cost breakdowns

**Input Fields**:
- Light background
- ~12-16px padding
- Rounded corners (~8-12px)
- Placeholder text in muted gray

---

## 18. BRAND ATTRIBUTES

- **Modern**: Clean lines, sans-serif body text, contemporary color palette
- **Approachable**: Friendly mascot, conversational copy
- **Professional**: Serif headlines, clear data visualization
- **Trustworthy**: Muted color palette, clear disclaimers about illustrative data
- **Focused**: Specific target audience (independent fashion brands)

---

## 19. TECHNICAL NOTES

- Built with React (based on typical modern web app patterns)
- Likely using Tailwind CSS or similar utility framework
- CSS variables for theming (e.g., `--primary`, `--background`)
- Responsive design with mobile-first or adaptive breakpoints
- Static content (no live API integration observed)
- Form elements functional but submission not tested

---

## 20. RECOMMENDATIONS FOR REBUILD

### Must-Have Features:
1. **Live calculator** with real tariff/duty data
2. **Dynamic form validation** and submission
3. **Responsive navigation** with working hamburger menu
4. **Smooth scroll** to anchor sections
5. **Hover states** for all interactive elements

### Nice-to-Have:
1. **Assistant chat interface** (if building Tango AI)
2. **Supplier comparison tool** with real data
3. **User authentication** (/login, /app routes)
4. **Data visualization library** for charts
5. **Email integration** for waitlist

### Data Requirements:
- **Tariff rates** by HS code and country
- **Duty calculations** based on product value and origin
- **Shipping cost estimates** by route and weight
- **Tax rates** by destination country
- **Supplier database** (if building comparison features)

### Design Assets Needed:
- **Logo SVG** (mascot + wordmark)
- **Font files** (Instrument Serif, body sans-serif)
- **Icon set** (arrows, checkmarks, etc.)
- **Mascot character** in various sizes/positions

---

## SUMMARY

This is a well-designed landing page for a pre-launch SaaS product. The design is clean, modern, and professional with a clear value proposition. All interactive elements tested either navigate to anchor sections or the waitlist page. The calculator and comparison tools appear to be illustrative mockups only - no live computation is happening yet. The site is fully responsive with thoughtful mobile adaptations. The color palette is restrained (blue + neutrals), typography is a mix of serif headlines and sans body text, and the overall feel is trustworthy and focused on the target audience of independent fashion brands.
