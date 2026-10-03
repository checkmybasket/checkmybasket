# CheckMyBasket: The Receipt build brief for Codex

Reviewed 3 October 2026. Preview implementation only.

## Current decisions

The headline is **Gifting made simple**. The tagline is **Thoughtful gifts, no matter how well you know them.** Keep **From group to gifts in minutes** for the journey section. CheckMyBasket is the evergreen gifting brand; Secret Santa describes the current draw feature. This brief covers the homepage, shared typography and palette, and social sharing image. Other page layouts will be reviewed separately. No route, draw logic, authentication, API or catalogue changes are part of this work. Optional verified email recovery is available; creating and joining a draw do not require an account. Individual wishlists and Basket Check remain future features. Gift categories may be empty until verified products are added.

Tailwind 4 uses CSS `@theme inline`, so map tokens there rather than adding a legacy configuration file. Shared functional status colours remain available outside the homepage. The receipt is illustrative sample data. No unsupported provenance claims should be introduced.

## How to use this brief

Paste the prompt in the next section into Codex, then add the rest of this doc to the repo as `docs/BRAND.md` so Codex can refer back to it on every future task.

1. Export this doc as Markdown and save it in the repo as `docs/BRAND.md`.
2. Paste the Codex prompt as your first task. It tells Codex to read `docs/BRAND.md` before touching anything.
3. Review the homepage on a branch preview before merging. Check it at 390px and 1440px widths.
4. For later pages (create draw, gift ideas, group view), start each Codex task with: "Follow docs/BRAND.md. Build the \[page\] in The Receipt style."

The brief assumes the existing app logic, routes and data stay as they are. This is a visual and copy redesign only.

## The Codex prompt

Copy everything inside the block below into Codex as one task.

```markdown
You are redesigning the public homepage of CheckMyBasket (checkmybasket.co.uk), a free UK Secret Santa app with wishlists, anonymous questions, curated UK gift ideas and group games. The site is an existing Next.js app. Do not change routes, data, auth, the draw logic or any API. This is a visual, brand and copy redesign.

Before writing code, read docs/BRAND.md in full. It is the single source of truth for colours, type, logo, layout, copy and components. Where this prompt and BRAND.md differ, BRAND.md wins.

Design direction: "The Receipt". Swiss, stark and confident. White page, near black type, one red accent. Square corners everywhere. Thick 2px black rules divide sections. The signature element is a till receipt card in the hero that plays on the name CheckMyBasket and ends with "Ads shown 0" and "You pay £0.00".

Tasks:
1. Inspect the repo. Identify the styling approach already in use (Tailwind, CSS modules or plain CSS) and keep using it. Do not add a new UI library.
2. Create design tokens as CSS custom properties in the global stylesheet, exactly as listed in BRAND.md "Tokens". Map Tailwind 4 tokens into the existing @theme inline block.
3. Load Space Grotesk (400, 500, 700) and IBM Plex Mono (400, 600) with next/font/google. Remove the old fonts and the old green theme colour (#1B4332). Set the theme-color meta to #FFFFFF.
4. Replace the logo with the inline SVG basket mark and wordmark from BRAND.md "Logo". Make it a reusable Logo component.
5. Rebuild the homepage (app/page.tsx or pages/index.tsx, whichever exists) as the sections in BRAND.md "Homepage spec", in that order, with that exact copy.
6. Build these as reusable components: Header, Logo, Button (primary, secondary, inverse), Receipt, StepStrip, FeatureList, BudgetChips, CtaBand, Footer.
7. Keep all existing hrefs: /create, /gifts, /gifts/under-10, /gifts/under-20, /gifts/under-30, /gifts/under-50, /gifts/colleague, /gifts/funny, /gifts/cosy, /gifts/personalised, /return, /about, /privacy, /terms, /contact, and #how-it-works.
8. Update the Open Graph image route so it uses the new colours, fonts and logo: white background, the wordmark, and the line "Gifting made simple"
9. Meet every item in BRAND.md "Quality checklist". Test at 390px, 768px and 1440px.

Copy rules: plain UK English. No hyphens or em dashes in any visible copy. Sentence case for every heading and button. No exclamation marks. No emoji. No arrows appended to buttons or links.

When done, list the files you changed and anything in BRAND.md you could not follow, with the reason.
```

## Brand guidelines

CheckMyBasket looks like a well designed till receipt: plain, honest, itemised and free. Every design choice should make the product feel fast, trustworthy and obviously free of charge.

### Concept

The name is a pun on checking out a shopping basket. The brand leans into that with receipt and checkout language, used sparingly: "Ads shown 0" and "You pay £0.00" inside the sample receipt. Use one receipt joke per page at most. The product does the talking.

### Voice

- Direct and short. State what happens, then stop.
- Plain UK English: personalised, colour, favourite, organise.
- Sentence case for headings and buttons.
- No hyphens or em dashes in copy. Use commas or full stops instead.
- No exclamation marks, emoji or arrows on buttons.
- Numbers as digits: 30 seconds, £20, 12 people.
- Name actions by what happens: "Create a free draw", never "Get started".

### Colour

| Name | Hex | Use |
| --- | --- | --- |
| Ink | #141414 | All text, rules, secondary buttons, dark CTA buttons |
| Paper | #FFFFFF | Page background |
| Receipt | #F6F5F2 | Receipt card background only |
| Receipt edge | #DDDAD3 | Receipt card bottom edge line |
| Basket red | #D42A24 | Primary buttons, step numbers, budget band, logo basket, receipt totals |

Red is the only accent. Use it for one primary action per screen and for the step numbers. White text on Basket red passes WCAG AA (about 4.9:1). Never use red for body text. Never add gradients, tints or a second accent.

### Typography

| Role | Font | Weight | Size (desktop) | Line height | Letter spacing |
| --- | --- | --- | --- | --- | --- |
| Hero headline | Space Grotesk | 700 | clamp(3rem, 7vw, 6.5rem) | 0.92 | -0.05em |
| Closing headline | Space Grotesk | 700 | clamp(2.75rem, 6vw, 5.5rem) | 0.92 | -0.05em |
| Section heading | Space Grotesk | 700 | clamp(2.25rem, 4.6vw, 4rem) | 0.98 | -0.045em |
| Step number | Space Grotesk | 700 | 72px | 1 | -0.05em |
| Card heading | Space Grotesk | 700 | 21 to 22px | 1.3 | -0.02em |
| Lead paragraph | Space Grotesk | 400 | 21px | 1.55 | 0 |
| Body | Space Grotesk | 400 | 17px | 1.55 | 0 |
| Nav and buttons | Space Grotesk | 500 nav, 700 buttons | 17 to 20px | 1.2 | 0 |
| Receipt text | IBM Plex Mono | 400, 600 for totals | 15px, 18px totals | 1.7 | 0 |

IBM Plex Mono appears only inside the receipt. Fallbacks: "Helvetica Neue", sans-serif and "Courier New", monospace.

### Logo

A red shopping basket with a black handle and a white tick, followed by the wordmark "CheckMyBasket" in Space Grotesk 700, 23px, letter spacing -0.03em, Ink. Mark and wordmark sit 10px apart. Minimum mark size 24px. On a red background, the basket becomes white and the tick red.

```html
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <path d="M4 11h24l-3 17H7z" fill="#D42A24"/>
  <path d="M10 11l6-7 6 7" stroke="#141414" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M11 19l4 4 7-7" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Shape and structure

- Border radius is 0 everywhere. No rounded buttons, cards or chips.
- Sections are divided by 2px solid Ink rules, not by background colour changes.
- No drop shadows. The receipt is the only tilted element (rotate 2deg).
- Icons: 24px viewBox, 2px stroke, square caps, mitre joins, Ink colour, no fills.
- Imagery: none on the homepage. If product photography is added later, use square crops on white.

## Homepage spec

The homepage specification has eight parts in this order. Content container is max width 1280px, centred, 32px side padding (20px under 640px). Copy below reflects the current approved headline and tagline. The layout is a preview for review.

### 1. Header

- Full width, 2px Ink bottom border. Inner row: 18px vertical padding, logo left, nav right, wraps on small screens.
- Nav links (Space Grotesk 500, Ink, no underline, red on hover): "Gift ideas" to /gifts, "How it works" to #how-it-works, "Return to your group" to /return.
- Button, Ink background, white text, 12px by 20px padding: "Create a free draw" to /create.
- Under 768px: links collapse into a menu button (aria-label "Open menu"); the Create button stays visible.

### 2. Hero

Two columns that wrap: text (flex 1 1 560px) and receipt (flex 0 1 380px), 64px gap, 80px top and 104px bottom padding.

- H1: "Gifting made simple"
- Tagline (21px): "Thoughtful gifts, no matter how well you know them."
- Lead (21px, max width 540px): "Draw names, share wishlists from any shop and ask anonymous questions. Find gifts people actually want. No ads, ever."
- Buttons, joined edge to edge with no gap: primary red "Create a free draw" to /create (20px by 32px padding, 19px bold) and secondary 2px Ink outline "Gift ideas" to /gifts.

Receipt card (max width 360px, Receipt background, 32px by 28px padding, 40px bottom, rotate 2deg, 1px Receipt edge line underneath). All text IBM Plex Mono 15px. Rows are label left, value right. Dashed 2px Ink lines separate the blocks.

| Row | Label | Value |
| --- | --- | --- |
| Title (centred, 600, 17px) | CheckMyBasket |  |
| Subtitle (centred) | Draw no. 0412 |  |
| Block 1 | Group | Office party |
| Block 1 | People | 12 |
| Block 1 | Budget | £20.00 |
| Block 1 | Swap date | 19 Dec |
| Block 2 | Names drawn | 12/12 |
| Block 2 | Wishlists | 9 |
| Block 2 | Questions asked | 17 |
| Totals (600, 18px, values red) | Ads shown | 0 |
| Totals (600, 18px, values red) | You pay | £0.00 |
| Footer (centred) | Thank you for gifting well |  |

The receipt is decorative sample data. Give it aria-label "Example draw summary: 12 people, £20 budget, no ads, free".

### 3. How it works (id how-it-works)

H2: "From group to gifts in minutes".

Full width band with 2px Ink rules top and bottom. Four columns that wrap (flex 1 1 260px), each 48px by 32px padding with a 2px Ink right border (hide it on the last column and when stacked). Each column: red number 72px, heading 22px, one line of body.

| No. | Heading | Body |
| --- | --- | --- |
| 1 | Create a draw | Group name, budget, date. 30 seconds. |
| 2 | Share the link | WhatsApp or copy. People join with a tap. |
| 3 | Draw names | Fair, private, with exclusions for couples. |
| 4 | Buy the gift | Wishlists, anonymous questions, UK gift ideas. |

### 4. Features

104px vertical padding. H2 (max width 820px): "Everything your group needs. All of it free." Then a wrapping list (flex 1 1 360px per item), each item with a 2px Ink top rule, 28px top padding, icon left (28px) and text right.

| Icon | Heading | Body |
| --- | --- | --- |
| Shuffle | Private draws | Each person only ever sees their own match. |
| List | Wishlists from any shop | Paste links from Etsy, John Lewis, Amazon or anywhere. |
| Speech bubble | Anonymous questions | Find out what they like without giving yourself away. |
| Gift | Gifts under budget | Browse UK gift ideas by budget. |
| Star | Group games | Predictions and Stereotype Awards after the swap. |
| Shield | No ads, ever | Funded by affiliate gift links, not by ads. |

Icon paths (24 viewBox): shuffle `M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5`, list `M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01`, bubble `M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z`, gift `M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z`, star `M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z`, shield `M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z`.

### 5. Shop by budget (id gifts)

Full width Basket red band, white text, 88px vertical padding.

- H2: "Shop by budget"
- Lead (19px): "Browse gift ideas from UK shops by budget or recipient."
- Chips: white background, Ink text, 700, 14px by 22px padding, 12px gap, square. Labels and links: Under £10 (/gifts/under-10), Under £20 (/gifts/under-20), Under £30 (/gifts/under-30), Under £50 (/gifts/under-50), For colleagues (/gifts/colleague), Funny gifts (/gifts/funny), Cosy gifts (/gifts/cosy), Personalised gifts (/gifts/personalised).

### 6. Closing call to action

104px vertical padding. Row that wraps, aligned to the bottom, space between.

- H2 (max width 760px): "Ready to organise your gift exchange?"
- Ink button, white text, 22px by 36px padding, 20px bold: "Create a free draw" to /create.

### 7. Footer

2px Ink top rule, 36px vertical padding, 15px text, two blocks that wrap.

- Left (max width 540px): "Some gift links may earn us a small commission at no extra cost to you. That keeps CheckMyBasket free and free of ads."
- Right links: About, Privacy, Terms, Contact. Then a small line: "© 2026 CheckMyBasket".

### 8. Metadata

- Title: "CheckMyBasket | Free Secret Santa generator with wishlists"
- Description: "Draw names, share wishlists from any shop and ask anonymous questions. Organise a free Secret Santa draw and find UK gift ideas. No ads, ever."
- theme-color: #FFFFFF

## Tokens and components

Put these tokens in the global stylesheet and build every component from them, never from raw hex values.

```css
:root {
  --cmb-ink: #141414;
  --cmb-paper: #FFFFFF;
  --cmb-receipt: #F6F5F2;
  --cmb-receipt-edge: #DDDAD3;
  --cmb-red: #D42A24;
  --cmb-red-hover: #B3221D;

  --cmb-font-sans: "Space Grotesk", "Helvetica Neue", sans-serif;
  --cmb-font-mono: "IBM Plex Mono", "Courier New", monospace;

  --cmb-rule: 2px solid var(--cmb-ink);
  --cmb-radius: 0;
  --cmb-container: 1280px;
  --cmb-gutter: 32px;

  --cmb-space-1: 8px;
  --cmb-space-2: 12px;
  --cmb-space-3: 16px;
  --cmb-space-4: 24px;
  --cmb-space-5: 32px;
  --cmb-space-6: 48px;
  --cmb-space-7: 64px;
  --cmb-space-8: 88px;
  --cmb-space-9: 104px;
}

@media (max-width: 640px) {
  :root { --cmb-gutter: 20px; }
}
```

| Component | Spec | States |
| --- | --- | --- |
| Button primary | Red background, white text, 700, 20px by 32px padding, radius 0 | Hover #B3221D. Focus: 3px Ink outline, 3px offset |
| Button secondary | Transparent, 2px Ink border, Ink text, 18px by 30px padding | Hover: Ink background, white text |
| Button inverse | Ink background, white text | Hover: red background |
| Budget chip | White on red band, Ink text, 700, 14px by 22px | Hover: Ink background, white text |
| Nav link | Ink, 500, no underline | Hover and current page: red |
| Receipt | See Homepage spec section 2 | Static, no hover |
| StepStrip | 4 columns, 2px Ink dividers | Stacks to 1 column under 640px, dividers become bottom rules |
| FeatureList | Items with 2px top rule, icon left | 1 column under 768px |
| CtaBand | Headline and button, bottom aligned | Button goes full width under 640px |

Hero buttons sit edge to edge as one joined pair. On screens under 480px they stack and each goes full width.

## Quality checklist

Codex should confirm every item before the change is merged.

- [ ] Every page section works at 390px, 768px and 1440px with no sideways scroll.
- [ ] Text contrast is at least 4.5:1. White on Basket red and Ink on white both pass.
- [ ] Every link is a real `<a href>` and every action a real `<button>`. Tab order follows reading order.
- [ ] Visible focus ring on all interactive elements: 3px Ink outline, 3px offset (white outline on the red band).
- [ ] Touch targets are at least 44px tall.
- [ ] One H1 per page; H2 for each section; headings in order.
- [ ] Receipt has an aria-label and its rows are not read as a data table.
- [ ] Fonts load through next/font with `display: swap`; use font optimisation to minimise layout shift.
- [ ] On the homepage: no border radius, shadows, gradients or colours outside the token list. Other page layouts are outside this preview scope.
- [ ] No hyphens, em dashes, exclamation marks, emoji or arrows in visible copy.
- [ ] All existing routes and links still resolve.
- [ ] `prefers-reduced-motion` respected if any transition is added (none are required).
- [ ] Lighthouse accessibility score 95 or higher on the homepage.
