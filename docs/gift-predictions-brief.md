# GiftCircle — Game Replacement Brief
**Change:** Remove Guess the Baby. Replace with "Gift Predictions" game.
**Reason:** Eliminates photo upload requirement, removes personal data storage (baby photos), removes privacy/consent complexity, and creates a game that's directly tied to the Secret Santa draw rather than bolted on.
---
## What You're Removing
Delete all references to Guess the Baby across the codebase, database schema, and UI:
- `BabyPhoto` table — delete entirely
- `BabyPhotoGuess` table — delete entirely
- Supabase Storage bucket for photos — not needed
- Photo upload flow — not needed
- Photo consent messaging — not needed
- Auto-delete logic — not needed
- All references to "Guess the Baby" in the Games tab, landing page, and feature blocks
---
## What You're Building
### Gift Predictions
A group guessing game where players predict what type of Secret Santa gift each person in the group will receive. No personal data. No uploads. Just gift-category stereotypes and group banter.
**One-line description:** "Think you know your group? Predict what everyone's getting for Secret Santa."
### How It Works
**Timing:** The game unlocks after the draw. Players know who they're buying for, but nobody knows what anyone else is buying. The game plays on that uncertainty.
**Round structure:** The app generates a prediction card for each group member. For each person, every other player selects which gift category they think that person will receive.
**Example:**
The screen shows:
> **What will Sarah get for Secret Santa?**
Then a grid of tappable gift category cards:
| 🍫 Chocolate & Snacks | ☕ A Mug | 🧴 Bath & Body |
| 🧣 Something Cosy | 🃏 A Joke Gift | 🎟️ An Experience |
| 📖 A Book | 🕯️ A Candle | 💳 A Gift Card |
| 🎁 A Mystery Wildcard | 🧩 Something Useful | 🍷 Drinks |
The player taps one category per person. They do this for every group member except themselves.
**After everyone submits:**
Results are revealed showing:
1. **The group consensus** — what the majority predicted each person would receive
2. **The spread** — "5 people think James is getting a mug, 2 think he's getting chocolate, 1 thinks he's getting a joke gift"
3. **Stereotype awards** — fun auto-generated titles based on predictions:
   - "Most Likely to Get a Mug" — the person the group overwhelmingly predicted would receive a mug
   - "The Wildcard" — the person with the most varied predictions (no consensus)
   - "The Predictable One" — the person where everyone guessed the same category
   - "The Candle Magnet" — whoever got the most candle predictions
4. **Post-Christmas reveal** (optional) — after gifts are exchanged, players can log what they actually received. The app then shows who predicted correctly: "4 out of 7 people correctly predicted Sarah would get bath stuff 🎯"
---
## Data Model
```
PredictionRound
├── id (uuid)
├── group_id (foreign key → Group)
├── status (enum: open | closed | revealed)
├── created_at (timestamp)
├── closed_at (timestamp, nullable)
Prediction
├── id (uuid)
├── round_id (foreign key → PredictionRound)
├── predictor_id (foreign key → User) — the person guessing
├── subject_id (foreign key → User) — the person being guessed about
├── predicted_category (string) — e.g. "mug", "chocolate", "bath_body"
├── created_at (timestamp)
ActualGift (optional, for post-Christmas reveal)
├── id (uuid)
├── round_id (foreign key → PredictionRound)
├── recipient_id (foreign key → User)
├── actual_category (string) — what they actually received
├── logged_by (foreign key → User) — the recipient logs this
├── created_at (timestamp)
```
**Privacy note:** No personal data is stored. No photos. No free text about people. Just category selections (enum values). Nothing sensitive. Nothing that needs auto-deletion or consent flows.
---
## Gift Categories
Use these 12 fixed categories. Each has an emoji, a short label, and an internal key.
| Emoji | Label | Key | Examples |
|-------|-------|-----|----------|
| ☕ | A Mug | `mug` | Novelty mug, travel mug, mug with chocolates |
| 🍫 | Chocolate & Snacks | `chocolate` | Selection box, artisan chocolate, biscuit tin |
| 🧴 | Bath & Body | `bath_body` | Bath bombs, hand cream, gift sets |
| 🕯️ | A Candle | `candle` | Scented candle, candle set, wax melts |
| 🧣 | Something Cosy | `cosy` | Socks, blanket, hot water bottle, slippers |
| 🃏 | A Joke Gift | `joke` | Funny book, novelty item, gag gift |
| 📖 | A Book | `book` | Novel, cookbook, coffee table book |
| 🍷 | Drinks | `drinks` | Wine, gin, craft beer, hot chocolate set |
| 💳 | A Gift Card | `gift_card` | Amazon, shop voucher, experience voucher |
| 🎟️ | An Experience | `experience` | Cinema tickets, escape room, class |
| 🧩 | Something Useful | `useful` | Desk gadget, phone accessory, tool |
| 🎁 | Complete Surprise | `surprise` | No idea — total mystery |
These categories are deliberately stereotypical and lighthearted. They're the things people actually give and receive at Secret Santa. The humour comes from the group recognising the patterns.
**Do not allow custom categories in v1.** Fixed categories make the results comparable and the awards computable.
---
## UI Specification
### Games Tab (Pre-Game)
Before the game starts, the Games tab shows:
**If draw hasn't happened yet:**
> "Games unlock after names are drawn. Hang tight!"
**If draw has happened but game hasn't started:**
> **Gift Predictions**
> "Think you know your group? Predict what type of Secret Santa gift everyone will get."
>
> [Start Predictions] — button, available to any group member (not organiser-only)
**If game is open but this user hasn't submitted:**
> "Predictions are open! Make your guesses before everyone else."
> [Make My Predictions]
**If user has submitted but others haven't:**
> "You're in! Waiting for X more people to submit..."
> Progress bar: "5 of 8 predictions submitted"
### Prediction Flow
**Screen layout (one person per screen, swipe or next button to advance):**
Top: "What will **[Name]** get for Secret Santa?"
Middle: 4×3 grid of category cards (emoji + label). Each card is tappable. Selected card gets a highlighted border and subtle scale animation. Only one selection per person.
Bottom: "Next →" button (disabled until a category is selected). Progress dots showing which person you're on: ● ● ● ○ ○ ○
**After the last person:**
Confirmation screen: "All predictions locked in! 🔒"
Summary of your predictions listed by person.
[Submit Predictions] button.
**Important:** Players do NOT predict for themselves. The app skips the current user automatically.
### Results Screen
**Unlocks when all players have submitted, OR the organiser manually closes the round, OR after 48 hours (auto-close with whoever has submitted).**
Results are displayed as a series of reveal cards, one per group member:
**Card format:**
> **Sarah**
> The group predicted: **Bath & Body** 🧴 (5 votes)
> Runner-up: A Candle 🕯️ (2 votes)
>
> [Bar chart showing vote distribution across all categories]
After all individual cards, the **Stereotype Awards** screen:
> 🏆 **Gift Prediction Awards**
>
> ☕ **Most Likely to Get a Mug** — James (6 out of 7 predicted it)
> 🎭 **The Wildcard** — Priya (votes spread across 5 different categories)
> 🔮 **The Predictable One** — Tom (unanimous: everyone said chocolate)
> 🕯️ **Candle Magnet** — Sarah (most candle votes in the group)
> 🃏 **The Joker** — Dave (most joke gift predictions)
Awards are auto-generated based on the data. Only show awards where there's a clear winner (don't force awards if the data doesn't support them).
### Post-Christmas Reveal (Optional, Lightweight)
After the gift exchange date, a prompt appears in the Games tab:
> "Gifts have been exchanged! Log what you actually received to see who predicted correctly."
Each user selects one category for what they received. No free text. Just tap a category card.
Once logged, the results update to show accuracy:
> **Sarah** actually received: **Bath & Body** 🧴
> 5 out of 7 people predicted correctly! 🎯
Leaderboard: "Best Predictor" — the person with the most correct guesses across all group members.
---
## Award Generation Logic
Awards are computed from the prediction data after all submissions are in. Rules:
```
"Most Likely to Get a [Category]"
→ For each category, find the person who received the most votes in that category.
→ Only generate if the top person has ≥ 50% of votes in that category.
→ Generate for the top 3–5 categories with the clearest winners.
"The Wildcard"
→ The person whose predictions are most evenly spread (highest entropy across categories).
→ Minimum 3 different categories predicted to qualify.
"The Predictable One"
→ The person where the highest single-category vote share is the greatest.
→ Ideally unanimous or near-unanimous.
"Best Predictor" (post-Christmas only)
→ The predictor who correctly guessed the most recipients' actual gift categories.
```
Generate a maximum of 5 awards. Quality over quantity. If the data doesn't clearly support an award, skip it. Never force a label onto someone with marginal data.
---
## What This Replaces in Other Documents
Update these references across the project:
### Landing Page
**Old:** "Play festive group games" → "Try Guess the Baby"
**New:** "Play festive group games" → "Try Gift Predictions"
**Feature block update:**
Old: 🎮 "Play festive group games" — Guess the Baby, Christmas Awards, and more
New: 🎮 "Play festive group games" — Predict what everyone's getting, earn Stereotype Awards
### Homepage CTAs
**Old:** "Try Guess the Baby"
**New:** "Try Gift Predictions"
### Feature Backlog
Replace GC-019 (Guess the Baby) with this game. Same phase (P0 MVP), same priority (High). Effort estimate: 4 days (reduced from 5 — no photo upload, no storage bucket, no consent flow, no auto-delete logic).
### Data Model
Remove: `BabyPhoto`, `BabyPhotoGuess`
Add: `PredictionRound`, `Prediction`, `ActualGift`
### Pre-Delivery Checklist
Remove: Photo upload privacy checks, consent messaging, auto-delete verification
Add: Award generation edge cases tested, results display tested with 3-person and 15-person groups
---
## Why This Game Is Better for Launch
| Dimension | Guess the Baby | Gift Predictions |
|-----------|---------------|-----------------|
| Personal data stored | Baby photos (sensitive) | Category selections (not sensitive) |
| Privacy risk | High — photos of children, consent required | None — no personal data |
| GDPR complexity | Auto-delete, right to deletion, consent flows | Minimal — enum values only |
| Setup friction | Everyone must find and upload a baby photo | Zero setup — just tap categories |
| Minimum participants | 4 photos minimum | 3 people minimum |
| Tied to Secret Santa | No — standalone game bolted onto the app | Yes — directly about the gift exchange |
| Replayable | No — one-time per group | Yes — can play again after gifts are exchanged to compare |
| TikTok shareable | Photo reactions (good but privacy-sensitive to share) | Stereotype Awards screenshots (safe and funny to share) |
| Development effort | 5 days (storage, upload, consent, auto-delete) | 4 days (simpler data model, no file handling) |
| Moderation risk | Photo content moderation needed | None — fixed category options only |
---
## Social Content This Game Creates
The Stereotype Awards screen is designed to be screenshotted and shared:
- "☕ Most Likely to Get a Mug — James" → James shares this in the group chat, everyone laughs
- "🔮 The Predictable One — Tom (unanimous: chocolate)" → Tom posts this on his Instagram story
- "🎯 5 out of 7 predicted correctly for Sarah" → post-Christmas bragging rights
These screenshots are safe to share (no personal data, no photos, just fun labels) and naturally drive awareness of GiftCircle when shared in WhatsApp groups, Instagram Stories, and TikTok.
Potential TikTok content: "We all predicted James would get a mug... and he actually did 😂☕" — reaction video format with the results screen visible.
