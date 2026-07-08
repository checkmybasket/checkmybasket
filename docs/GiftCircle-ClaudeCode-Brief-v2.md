# GiftCircle — Claude Code Prototype Brief (v2)

**Incorporating:** UI/UX Pro Max, Frontend Design, Onboarding CRO, Signup Optimisation, Copywriting Principles, Marketing Psychology

---

## What You're Building

A mobile-first web app for **GiftCircle**: a no-ads Secret Santa app with wishlists, anonymous messaging, gift ideas, and group games. UK-first, targeting families, friends, and workplaces for Christmas 2026.

**One-line pitch:** Draw names, share wishlists, ask anonymous questions, and find gifts people actually want — no ads, ever.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS with CSS custom properties for the design token system
- **UI Components:** shadcn/ui as the base component library (customised to match the brand)
- **Database:** Supabase (Postgres + Auth + Realtime + Storage)
- **Hosting:** Vercel
- **Language:** TypeScript
- **State:** React Server Components where possible, Zustand for client-side interactive state
- **Icons:** Lucide React (consistent rounded icon set — never use emoji as structural icons)
- **Fonts:** Google Fonts loaded via `next/font` for zero layout shift
- **Analytics:** Plausible or PostHog (privacy-first, no cookies)
- **Email:** Resend (transactional)

**Why web-first:** Users join via WhatsApp links. Zero app download friction. Works on desktop for office organisers. Faster to ship before October 2026.

---

## Design System

### Aesthetic Direction

**Tone:** Warm modern festive — like a candlelit dinner party, not a children's Christmas card. Cosy, confident, slightly cheeky. British humour where appropriate. Never corporate, never childish.

**The one unforgettable thing:** The name reveal animation. This is the moment people screenshot and share. It must feel genuinely exciting — a 2–3 second envelope-open or card-flip animation with haptic-level polish.

### Colour Tokens (CSS Custom Properties)

Use semantic colour tokens throughout. Never hardcode hex values in components.

```css
:root {
  /* Primary */
  --color-primary: #1B4332;        /* Deep forest green */
  --color-primary-light: #2D6A4F;  /* Lighter green for hover states */
  --color-primary-dark: #143026;   /* Darker green for pressed states */

  /* Accent */
  --color-accent: #C1121F;         /* Rich berry red — CTAs, alerts, badges */
  --color-accent-light: #D4343F;   /* Hover state */

  /* Warm */
  --color-warm: #D4A574;           /* Gold — premium touches, stars, celebrations */

  /* Surface */
  --color-bg: #FFF8F0;             /* Warm cream — main background */
  --color-surface: #FFFFFF;        /* Cards, panels */
  --color-surface-hover: #FEF3E6;  /* Card hover state */

  /* Text */
  --color-text-primary: #1A1A1A;   /* Near-black, never pure #000 */
  --color-text-secondary: #5C5C5C; /* Supporting text — must pass 4.5:1 on cream bg */
  --color-text-muted: #8A8A8A;     /* Hint text — must pass 3:1 on white surface */
  --color-text-inverse: #FFF8F0;   /* Text on dark backgrounds */

  /* State */
  --color-success: #2D6A4F;
  --color-error: #C1121F;
  --color-warning: #D4A574;

  /* Borders */
  --color-border: #E8DDD0;         /* Warm neutral border */
  --color-border-strong: #C4B8A8;  /* Stronger border for inputs */
}

/* Dark mode (optional for v1, but token system supports it) */
[data-theme="dark"] {
  --color-bg: #0D1B2A;
  --color-surface: #1B2838;
  --color-text-primary: #F0E8DF;
  --color-text-secondary: #B0A898;
  --color-border: #2A3A4A;
}
```

**Accessibility requirement (CRITICAL — Priority 1 from UI/UX Pro Max):**
- All text must meet WCAG 4.5:1 contrast ratio against its background
- Large text (18px+ bold or 24px+) needs 3:1 minimum
- Never convey information by colour alone — always pair with icon or text
- Test both light and dark mode before delivery

### Typography System

**Never use:** Inter, Roboto, Arial, system fonts, Space Grotesk. These are generic AI defaults.

**Font pairing:**
- **Display/Headings:** Fraunces (variable weight, optical size) — warm, characterful serif with a festive quality. Fallback: Playfair Display.
- **Body/UI:** DM Sans — clean, modern, highly readable at small sizes. Friendly without being childish.
- **Mono (code/numbers):** JetBrains Mono — only for budget displays or data.

```css
/* Type scale (base 16px, 1.25 ratio) */
--text-xs: 0.75rem;     /* 12px — captions, badges */
--text-sm: 0.875rem;    /* 14px — secondary text, help text */
--text-base: 1rem;      /* 16px — body text (minimum for body) */
--text-lg: 1.125rem;    /* 18px — large body */
--text-xl: 1.25rem;     /* 20px — section labels */
--text-2xl: 1.5rem;     /* 24px — card titles */
--text-3xl: 1.875rem;   /* 30px — page headings */
--text-4xl: 2.25rem;    /* 36px — hero heading mobile */
--text-5xl: 3rem;       /* 48px — hero heading desktop */

/* Line heights */
--leading-tight: 1.2;   /* Headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form */
```

**Rules:**
- Body text must never go below 16px (UI/UX Pro Max rule)
- Line height 1.5 for body text
- Heading hierarchy must be sequential: h1 → h2 → h3, no skipping

### Spacing System (8dp Rhythm)

Follow an 8px base spacing rhythm consistently across components, sections, and pages.

```css
--space-1: 0.25rem;  /* 4px — tight internal spacing */
--space-2: 0.5rem;   /* 8px — between related elements */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px — standard padding */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px — card padding */
--space-8: 2rem;     /* 32px — section gaps */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px — major section spacing */
--space-16: 4rem;    /* 64px — page-level spacing */
```

### Border Radius

```css
--radius-sm: 8px;    /* Buttons, inputs, badges */
--radius-md: 12px;   /* Small cards, dropdowns */
--radius-lg: 16px;   /* Main cards, panels */
--radius-xl: 24px;   /* Feature cards, hero elements */
--radius-full: 9999px; /* Avatars, pills */
```

### Shadows

Soft, warm shadows. Never harsh black shadows.

```css
--shadow-sm: 0 1px 3px rgba(26, 26, 26, 0.06);
--shadow-md: 0 4px 12px rgba(26, 26, 26, 0.08);
--shadow-lg: 0 8px 24px rgba(26, 26, 26, 0.12);
--shadow-xl: 0 16px 48px rgba(26, 26, 26, 0.16);
```

### Icons (CRITICAL — from UI/UX Pro Max)

- Use Lucide React exclusively. No emoji as structural icons. No mixing icon libraries.
- Consistent size tokens: `icon-sm` (16px), `icon-md` (20px), `icon-lg` (24px)
- Consistent stroke width (1.5px or 2px — pick one and use everywhere)
- All icon-only buttons MUST have `aria-label`
- Touch target minimum: 44×44px (even if the icon is 24px, extend the hit area with padding)

### Animation Principles (from UI/UX Pro Max)

- Micro-interaction duration: 150–300ms
- Page transitions: 300–500ms
- Easing: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state changes
- The name reveal animation is the exception: 2–3 seconds of cinematic suspense
- All animations must respect `prefers-reduced-motion` — disable or reduce when requested
- Never animate `width` or `height` — use `transform` and `opacity` for performance
- Motion must convey meaning, not decorate

### Backgrounds and Visual Texture

- Landing page: subtle noise texture overlay on the cream background for warmth and depth
- Cards: pure white `#FFFFFF` on cream `#FFF8F0` background — clear surface separation
- Consider a subtle festive pattern (pine branches, snowflakes) as a very low-opacity background element on the landing page only — never inside the app dashboard
- Avoid flat, lifeless solid colour backgrounds

---

## Interaction and Touch Guidelines (from UI/UX Pro Max)

### Touch Targets
- Minimum interactive area: 44×44px (iOS standard) / 48×48dp (Material)
- Minimum spacing between touch targets: 8px
- Use `touch-action: manipulation` to eliminate 300ms tap delay on mobile
- Add `cursor: pointer` on all clickable web elements

### Button States
Every button must have five distinct visual states:
1. **Default** — resting state
2. **Hover** — lighter/darker shade (desktop only, never rely on hover for mobile)
3. **Pressed/Active** — darker shade or scale-down (95%) for tactile feedback
4. **Disabled** — reduced opacity (0.5), no pointer events, visually distinct
5. **Loading** — spinner or skeleton replacing the label, button disabled during async

### Focus States (Accessibility — CRITICAL)
- Visible focus rings on ALL interactive elements: 2px offset, using `--color-primary`
- Never remove focus outlines. Style them, don't hide them.
- Tab order must match visual order
- Full keyboard navigation support

### Forms (from Signup + UI/UX Pro Max)
- Always use visible labels above inputs — never placeholder-only labels
- Error messages appear inline directly below the problem field, not at the top of the form
- Real-time validation on blur, not just on submit
- Helper text below fields when needed (e.g. "Add links from any shop, not just Amazon")
- Progressive disclosure: don't show all optional fields upfront
- Mobile: use appropriate keyboard types (`email`, `tel`, `url`, `text`)
- Mobile: support autofill and paste in all fields
- Mobile: single-column layout, sticky CTA button

---

## Onboarding Strategy (from Onboarding CRO + Signup Optimisation)

### Activation Definition

The "aha moment" for GiftCircle is: **seeing your match's name on the reveal screen.** Everything before this is onboarding. Everything after drives engagement (wishlists, messaging, games, gift buying).

### Critical Principle: Value Before Account

The user must experience the core product before being asked to create an account. The flow is:

1. Organiser creates a group → no account needed (session cookie)
2. Members join via link → enter name only, no account needed
3. Everyone participates in the draw → full experience, zero registration
4. AFTER they've seen the value, optionally: "Add your email to save access to your group"

**Never block the core experience behind a login wall.**

### Organiser Activation Funnel

```
Land on site → Click "Create a free draw" → Name the group → Set budget → Share invite link → Members join → Draw names → See reveal
100%            70%                          60%               55%           45%                  35%            30%          25%
```

Target: optimise the biggest drop-offs. The share-to-join step is the critical viral moment.

### Empty States

Every empty state is an onboarding opportunity, not a dead end.

**Wishlists (empty):**
- Headline: "No wishlist items yet"
- Show a ghost/preview of what a filled wishlist looks like
- CTA: "Add your first wish" with a prominent button
- Helper: "Add links from any shop — Etsy, John Lewis, Amazon, anywhere"

**Messages (empty, pre-draw):**
- "Anonymous messaging opens after names are drawn. In the meantime, add your wishlist so your Secret Santa knows what to get you."

**Messages (empty, post-draw, no messages sent):**
- "Not sure what to buy? Ask [recipient name] a question without revealing yourself."
- Show suggested question chips they can tap to send instantly

**Games (empty):**
- "No games running yet. The organiser can start Guess the Baby when everyone's ready."
- Show a fun preview image of what the game looks like

### Progressive Commitment (from Signup Optimisation)

Layer 1 (zero friction): Join group by tapping a link and entering a name
Layer 2 (light friction): Add likes/dislikes and wishlist items — prompted but optional
Layer 3 (delayed ask): "Add your email to save your group" — shown after the draw reveal, when value is proven
Layer 4 (future): Full account creation for returning users managing multiple groups year-round

### Stalled User Recovery

- If members join but don't add wishlist items: organiser sees a status dashboard showing who hasn't added items yet, with a "Send reminder" button that re-shares the invite link via WhatsApp
- If the organiser creates a group but doesn't share the link: 24-hour email nudge (if email provided): "Your Secret Santa group is waiting — share the link to get started"

---

## Marketing Psychology Applied (from Marketing Psychology Skill)

### Jobs To Be Done

Users don't want a "Secret Santa app." They want:
- **Organiser:** "I want to run Secret Santa without it being a hassle"
- **Buyer:** "I want to buy something my person actually wants without awkward guessing"
- **Recipient:** "I want to get a thoughtful gift, not a random mug"

All copy should frame around these jobs, not features.

### Social Proof

- Show live counter on homepage: "X groups created this week" (even if small, it signals activity)
- After launch: "Join X,000 groups already using GiftCircle this Christmas"
- Testimonial placement near the "Create a draw" CTA

### Commitment and Consistency

Once a user creates a group and adds even one person, they're psychologically committed. The app should:
- Celebrate every small step: "Group created ✓", "2 people joined ✓", "Wishlists added ✓"
- Show a progress checklist: "3 of 5 steps complete" — progress creates motivation

### Loss Aversion

- After the draw: "Your match has added 4 wishlist items — check them before they update their list"
- Gift buying: "3 of 8 people have already bought their gift" — creates gentle urgency without pressure

### Endowment Effect

- "Your group is saved — come back next year with one tap" (makes the group feel like something they own)
- "Your wishlist carries over — update it anytime" (builds year-round value)

### Reciprocity

- The app is free and ad-free. The affiliate disclosure is honest: "Some gift links earn us a small commission at no cost to you. This is how we keep GiftCircle free and ad-free."
- Users feel good supporting a product that respects them.

---

## Copywriting Guidelines (from Copywriting Skill)

### Core Rules for All Copy

1. **Clarity over cleverness.** If a feature name is ambiguous, make it obvious.
2. **Benefits over features.** "Find out what they really want" not "Anonymous messaging system."
3. **Specificity over vagueness.** "Gifts under £10 from UK shops" not "Browse gift ideas."
4. **Active voice.** "Draw names instantly" not "Names can be drawn."
5. **No exclamation marks in body copy.** One per page maximum, if any.
6. **No marketing buzzwords.** Never: "streamline", "leverage", "innovative", "cutting-edge", "game-changing", "seamless."

### Homepage Copy

**Hero:**
- Headline: "Secret Santa made simple"
- Subheadline: "Draw names, share wishlists, ask anonymous questions and find gifts people actually want. No ads, ever."
- Primary CTA: "Create a free draw" (action-oriented, not "Get started" or "Sign up")
- Secondary CTA: "View gift ideas"
- Trust line below CTA: "Free forever. No account needed. Takes 30 seconds."

**Feature blocks (benefits, not features):**
1. "Draw names privately" → "Fair, private matching. Set exclusions so couples don't draw each other."
2. "Share wishlists from any shop" → "Add gift ideas from Etsy, John Lewis, Amazon — anywhere. No more guessing."
3. "Ask anonymous questions" → "Buying for someone you barely know? Ask what they like without giving yourself away."
4. "Find UK gifts under budget" → "Curated ideas from UK shops, filtered by budget. No ads, just good gifts."
5. "Play festive group games" → "Guess the Baby, Christmas Awards, and more. Give your group a reason to stay."
6. "No ads, ever" → "We earn from affiliate gift links, not ads. Your experience stays clean."

**Rhetorical question hook (above the fold or in social sharing):**
"Hate buying Secret Santa gifts for people you barely know?"

### CTA Button Copy Standards

| Context | Do | Don't |
|---------|-----|-------|
| Create group | "Create a free draw" | "Get started", "Sign up" |
| Join group | "Join this Secret Santa" | "Create account", "Register" |
| Share invite | "Share invite link" | "Invite members" |
| Draw names | "Draw names now" | "Execute draw", "Submit" |
| Add wishlist item | "Add a wish" | "Create item" |
| Send anonymous question | "Ask a question" | "Send message" |
| Browse gifts | "Find gifts under £15" | "Browse products" |

### Microcopy and Helper Text

- Budget selector: "This is per person — everyone buys one gift"
- Exclusion rules: "Who shouldn't draw each other? Common for couples or siblings"
- Wishlist priority: "Mark as 'Would love' for your top picks"
- Anonymous message: "Your identity stays hidden. They'll only see 'Your Secret Santa'"
- Gift bought toggle: "Tick this when you've bought your gift — only you can see this"

---

## Core Data Models

```
User
├── id (uuid)
├── name (string)
├── email (string, optional — not required to join)
├── avatar_url (string, optional)
├── created_at (timestamp)

Group
├── id (uuid)
├── name (string) — e.g. "Marketing Team Secret Santa 2026"
├── mode (enum: family | friends | workplace | students | custom)
├── budget_amount (integer, in pence) — e.g. 1500 = £15.00
├── budget_currency (string, default "GBP")
├── exchange_date (date, optional)
├── exchange_location (string, optional)
├── invite_code (string, unique, URL-safe) — for shareable links
├── draw_status (enum: pending | drawn | revealed)
├── organiser_id (foreign key → User)
├── created_at (timestamp)

GroupMember
├── id (uuid)
├── group_id (foreign key → Group)
├── user_id (foreign key → User)
├── role (enum: organiser | member)
├── likes (text) — free text: hobbies, interests, favourites
├── dislikes (text) — allergies, things to avoid
├── joined_at (timestamp)

Exclusion
├── id (uuid)
├── group_id (foreign key → Group)
├── user_a_id (foreign key → User) — must not draw
├── user_b_id (foreign key → User) — this person
├── bidirectional (boolean, default true)

Draw
├── id (uuid)
├── group_id (foreign key → Group)
├── giver_id (foreign key → User)
├── recipient_id (foreign key → User)
├── gift_bought (boolean, default false)
├── drawn_at (timestamp)

WishlistItem
├── id (uuid)
├── user_id (foreign key → User)
├── group_id (foreign key → Group)
├── title (string)
├── url (string, optional) — any shop
├── price (integer, in pence, optional)
├── shop_name (string, optional)
├── notes (text, optional) — size, colour, "just inspiration"
├── priority (enum: love | like | inspiration)
├── image_url (string, optional)
├── created_at (timestamp)

AnonMessage
├── id (uuid)
├── group_id (foreign key → Group)
├── sender_id (foreign key → User) — the buyer (hidden from recipient)
├── recipient_id (foreign key → User)
├── content (text, max 500 chars)
├── is_reply (boolean)
├── parent_message_id (foreign key → AnonMessage, optional)
├── created_at (timestamp)

BabyPhoto
├── id (uuid)
├── group_id (foreign key → Group)
├── user_id (foreign key → User)
├── photo_url (string) — Supabase Storage, private bucket
├── auto_delete_at (timestamp) — 30 days after game ends
├── uploaded_at (timestamp)

BabyPhotoGuess
├── id (uuid)
├── group_id (foreign key → Group)
├── guesser_id (foreign key → User)
├── photo_id (foreign key → BabyPhoto)
├── guessed_user_id (foreign key → User)
├── is_correct (boolean)
├── guessed_at (timestamp)
```

---

## Pages and Routes

```
/                           → Landing page (marketing, SEO)
/create                     → Create a new group (single-page wizard)
/join/[invite_code]         → Join a group via invite link
/g/[group_id]               → Group dashboard (tabbed interface)
/g/[group_id]/draw          → Draw tab
/g/[group_id]/wishlists     → Wishlists tab
/g/[group_id]/messages      → Anonymous messages tab
/g/[group_id]/games         → Games tab
/g/[group_id]/settings      → Group settings (organiser only)
/g/[group_id]/reveal        → Name reveal screen (private per user)
/gifts                      → Gift ideas hub (SEO + affiliate)
/gifts/[category]           → Gift category page
```

---

## Feature Specifications

### 1. Group Creation (Single-Page Wizard)

**Route:** `/create`

A single scrollable page, not a multi-step modal. Show all fields with progressive disclosure — start with the essentials, expand optional sections on tap.

**Fields:**
1. Group name — text input, placeholder: "e.g. Office Secret Santa 2026"
2. Mode selector — four tappable cards: Family, Friends, Workplace, Students. Affects default language only.
3. Budget — preset pill buttons: £5, £10, £15, £20, £25, Custom. Helper: "This is per person"
4. Exchange date — date picker, optional. Label: "Gift exchange day"
5. Location — text input, optional. Placeholder: "e.g. The Rose & Crown, 7pm"
6. Your name — organiser enters their name. Label: "Your name"
7. CTA button: "Create your draw"

**After creation → Share screen:**
- The invite link prominently displayed: `giftcircle.app/join/[code]`
- Large "Copy link" button
- "Share via WhatsApp" button (pre-filled: "Join our Secret Santa! 🎅 [link]")
- QR code for in-person sharing (offices, family gatherings)
- Live member counter: "0 of ? have joined — share the link to get started"

**No account required.** Session-based auth via Supabase anonymous auth.

### 2. Join Flow

**Route:** `/join/[invite_code]`

**What the joiner sees:**
- Group name and mode badge
- Budget and date
- "X people have already joined" (social proof)
- Organiser's name: "Created by [name]"

**Join form (minimal — from Signup Optimisation):**
1. "Your name" — single field, visible label, autofocus on mobile
2. CTA: "Join this Secret Santa"

That's it. Name only. Everything else is optional and comes after joining.

**Post-join nudge (progressive commitment):**
- "You're in! While you wait for the draw, help your Secret Santa out:"
- Tappable prompt cards:
  - "Add your likes and dislikes" → expands inline text fields
  - "Add wishlist items" → opens wishlist editor
  - "Skip for now" → goes to dashboard

### 3. Group Dashboard

**Route:** `/g/[group_id]`

**Mobile layout:** Bottom tab bar with 4 tabs (max 5 per UI/UX Pro Max nav rules).

| Tab | Lucide Icon | Label | Badge |
|-----|-------------|-------|-------|
| Draw | `Dice5` | Draw | — |
| Wishlists | `Gift` | Wishlists | New items count |
| Messages | `MessageCircle` | Messages | Unread dot |
| Games | `Gamepad2` | Games | — |

**Top bar:** Group name (truncated), member count pill, settings gear (organiser only).

**Organiser dashboard (Draw tab, pre-draw state):**
- Progress checklist with completion percentage:
  - ✓ Group created
  - ✓ 6 of 8 people joined
  - ○ 3 of 6 wishlists added
  - ○ Names not yet drawn
- Member list with status indicators (joined ✓, wishlist added ✓)
- Exclusion rules editor
- "Draw Names" button (prominent, only enabled when 3+ members)
- Warning on tap: "Once names are drawn, this can't be undone without a full redraw. Everyone will be notified."

**Member view (pre-draw):**
- "Waiting for [organiser] to draw names..."
- Their own wishlist editor
- Who has joined (names visible, but no draw results yet)
- Prompt: "While you wait, add your wishlist so your Secret Santa knows what to get you"

### 4. Name Reveal

**Route:** `/g/[group_id]/reveal`

**This is the most important UI moment in the entire app. It must feel cinematic.**

**Screen 1:** "Ready to find out who you're buying for?" — large text, centred. Single button: "Reveal my match"

**Screen 2:** Suspenseful animation. Options (pick one):
- An envelope that opens to reveal a card
- A gift box that unwraps
- A card that flips over
- Snowfall parting to reveal the name

Duration: 2–3 seconds. Use CSS transforms and opacity. Respect `prefers-reduced-motion` by showing the name immediately without animation if enabled.

**Screen 3:** "You're buying for... **[Name]** 🎁"

Below the reveal:
- [Name]'s likes and dislikes (if added)
- [Name]'s wishlist items (if added, with links)
- Budget reminder: "Budget: £15"
- Action buttons:
  - "Ask [Name] a question" → anonymous messaging
  - "Find gifts under £15" → gift ideas page
  - "Mark gift as bought" → toggle

**Trust messaging (visible on this screen):**
- "Your match is private. Nobody else can see who you picked."
- "The organiser cannot see individual matches."
- "All [X] people matched successfully ✓"

### 5. Wishlists

**Route:** `/g/[group_id]/wishlists`

**Add item form:**
- Title (required) — label: "What do you want?", placeholder: "e.g. Heated blanket"
- Link (optional) — label: "Link to product", helper: "From any shop — Etsy, John Lewis, Amazon, anywhere"
- Price (optional) — label: "Rough price", in £
- Notes (optional) — label: "Anything else?", placeholder: "Size M, Blue, Just inspiration"
- Priority — three tappable pills: "Would love" / "Would like" / "Just inspiration"

**Your wishlist view:**
- Editable card list
- Sections: "Things I'd love", "Things like this", "Please avoid" (free text), "My sizes" (optional)

**Other people's wishlists:**
- Read-only card list
- "I'm getting this" button on each item — hidden from the recipient, visible to other buyers to prevent duplicates
- Link opens in new tab

**Retailer neutral.** No Amazon bias. Support any URL.

### 6. Anonymous Messaging

**Route:** `/g/[group_id]/messages`

**Sender view (buyer → recipient):**
- Chat bubble UI. Sender shown as "You (anonymous)" with a masked avatar
- Suggested question chips at the bottom (tappable to send):
  - "Do you prefer tea, coffee, or hot chocolate?"
  - "Any allergies I should know about?"
  - "Funny gifts or practical gifts?"
  - "What colours do you usually like?"
  - "Would you rather have snacks, desk items, or something cosy?"
- Free text input with 500 char limit
- Rate limit: 10 messages per day per sender

**Recipient view:**
- Messages from "Your Secret Santa 🤫" with a generic festive avatar
- Reply input
- Report button on each message (small, non-intrusive)

**Safety:**
- No images, no links, no files in messages
- Report/block option
- Character limit enforced

### 7. Guess the Baby Game

**Route:** `/g/[group_id]/games`

**Setup:**
1. Each member uploads a baby/childhood photo of themselves
2. Consent message: "Only upload a photo you have the right to share. Photos are visible only to your group and can be deleted at any time."
3. Photos stored in Supabase Storage private bucket with group-scoped Row Level Security
4. Auto-delete: 30 days after game ends
5. Minimum 4 photos to start

**Gameplay:**
1. One photo at a time, shuffled randomly
2. For each photo: select who you think it is from a dropdown of group members
3. After all guesses submitted, results are locked

**Results:**
- Leaderboard: most correct guesses wins
- Reveal: each photo shown next to the real person
- Fun stats: "Nobody guessed [name]!" or "Everyone recognised [name]!"
- Celebration animation for the winner

### 8. Gift Ideas (Affiliate Pages)

**Route:** `/gifts` and `/gifts/[category]`

**Static/SSG pages with curated gift recommendations.** Each gift card:
- Product image (optimised WebP, lazy loaded)
- Product name
- Price in £
- Shop name and logo/icon
- Affiliate link (opens in new tab, `rel="noopener sponsored"`)
- Tags: "Funny", "Cosy", "Practical", "Eco-friendly"

**Launch categories:**
- `/gifts/under-5` — Secret Santa gifts under £5
- `/gifts/under-10` — Secret Santa gifts under £10
- `/gifts/under-15` — Secret Santa gifts under £15
- `/gifts/under-20` — Secret Santa gifts under £20
- `/gifts/under-25` — Secret Santa gifts under £25
- `/gifts/colleague` — Safe gifts for colleagues
- `/gifts/funny` — Funny Secret Santa gifts
- `/gifts/cosy` — Cosy and warm gift ideas

**Affiliate disclosure (footer of every gift page):**
"Some gift links may earn us a small commission at no extra cost to you. This is how we keep GiftCircle free and ad-free."

---

## Auth Strategy

1. **Supabase anonymous auth** on group creation and join — zero friction session
2. **Optional email upgrade** — "Add your email to save access to your group" shown after the draw reveal
3. **Magic link login** for returning users — no passwords in v1
4. **Never force login before joining a group.** The invite link goes straight to the join screen.

---

## Responsive Breakpoints

- **Mobile (< 640px):** Primary design target. Bottom tab navigation. Full-width cards. Large touch targets. Single-column forms. Sticky CTA buttons.
- **Tablet (640–1024px):** Side navigation option. Two-column wishlist grid. Increased horizontal gutters.
- **Desktop (1024px+):** Sidebar navigation. Three-column layouts. Hover states for desktop interactions.

Safe area compliance: keep all fixed headers, tab bars, and bottom CTAs clear of notch, gesture bar, and screen edges.

---

## Pre-Delivery Checklist (from UI/UX Pro Max)

Before shipping any screen, verify:

### Visual Quality
- [ ] No emoji used as structural icons — Lucide only
- [ ] All icons from the same family, same stroke width
- [ ] Semantic colour tokens used everywhere — no hardcoded hex in components
- [ ] Pressed/active states don't cause layout shift

### Interaction
- [ ] All tappable elements provide clear pressed feedback
- [ ] Touch targets ≥ 44×44px
- [ ] Animation duration 150–300ms with appropriate easing
- [ ] Disabled states are visually clear and non-interactive
- [ ] Screen reader focus order matches visual order
- [ ] All interactive elements have descriptive aria-labels

### Accessibility
- [ ] Primary text contrast ≥ 4.5:1 on all backgrounds
- [ ] Focus rings visible on all interactive elements
- [ ] Colour is never the only indicator
- [ ] `prefers-reduced-motion` respected
- [ ] Form fields have visible labels, not just placeholders
- [ ] Error messages appear inline near the problem field
- [ ] Heading hierarchy is sequential (h1 → h2 → h3)

### Layout
- [ ] Safe areas respected for fixed headers and bottom bars
- [ ] Scroll content not hidden behind sticky elements
- [ ] Tested on mobile, tablet, and desktop
- [ ] 8px spacing rhythm maintained consistently
- [ ] No horizontal scroll on any viewport

---

## Build Priority Order

1. **Landing page** — marketing homepage with hero, feature blocks, CTA
2. **Group creation flow** — single-page wizard, invite link generation, share screen
3. **Join flow** — invite link → name entry → join group
4. **Group dashboard shell** — tabbed layout with bottom navigation
5. **Draw system** — exclusions, derangement algorithm, reveal animation
6. **Wishlists** — add items, view others' lists, mark as bought
7. **Anonymous messaging** — send questions, suggested prompts, replies
8. **Gift ideas pages** — static affiliate content with category filtering
9. **Guess the Baby** — photo upload, guessing game, leaderboard
10. **Email notifications** — draw results, new messages, reminders

---

## What NOT to Build

- ❌ Native iOS/Android apps (web-first)
- ❌ Push notifications (v2)
- ❌ AI gift recommendations
- ❌ Social feed or public profiles
- ❌ Payment processing or premium tier
- ❌ Games beyond Guess the Baby
- ❌ Year-round gifting modes (birthday, Eid — planned for post-Christmas)
- ❌ Slack/Teams integrations
- ❌ Dynamic affiliate product feeds (curated pages only)
- ❌ Real-time live chat (simple request/response messaging)
- ❌ Complex onboarding tutorials or tooltips
- ❌ Dark mode in v1 (design tokens support it, but ship light mode first)

---

## Success Criteria

The prototype is beta-ready when:

- [ ] An organiser can create a group and share an invite link via WhatsApp in under 60 seconds
- [ ] 3+ people can join via the link without creating an account
- [ ] Names can be drawn with exclusion rules, and each person sees only their own match
- [ ] The reveal animation looks polished on mobile Safari and Chrome and makes people want to screenshot it
- [ ] Users can add wishlist items from any URL
- [ ] A buyer can send an anonymous question and receive a reply
- [ ] Gift ideas pages load with affiliate links for at least 5 budget categories
- [ ] Guess the Baby works end-to-end with photo privacy controls
- [ ] All interactive elements pass the pre-delivery checklist above
- [ ] Page load under 2 seconds on 4G
- [ ] No ads anywhere
