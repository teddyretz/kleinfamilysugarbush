# Klein Family Sugarbush - Website Requirements

## 1. Project Overview

Rebuild the Klein Family Sugarbush website as a modern, self-hosted static site. The new site preserves the existing brand identity, photos, and casual tone while adding two interactive mini-games that teach visitors about maple syrup production.

**Business:** Klein Family Sugarbush - a small family maple syrup producer in New Hampshire.
**Purpose:** Informational site (no e-commerce). Educate and engage visitors about the syrup-making process.

---

## 2. Site Structure

Three pages total:

| Page | Description |
|------|-------------|
| **Home** | Landing page with hero image, welcome message ("See what's new with the Sugarbush"), photos, and brief intro to the business |
| **Staff** | Team page with photos and titles for each member (Alex, Jess, Steve, Ben, Aaron, Hayley, Susannah, David, Ted, Evan, Sam, and the Angel Investor) |
| **Games** | Dedicated page hosting both interactive mini-games |

---

## 3. Design & Branding

Carry forward the existing visual identity:

- **Color palette:** Dark background with dark blue accents (rgba(28,69,135,1)), white text, light section backgrounds (rgba(249,249,249,1))
- **Typography:** Lexend (headings) and Montserrat (body text) font families
- **Tone:** Warm, casual, fun - matches the playful staff titles on the current site
- **Photos:** User will provide original photo files from the current site (hero/header image, team photo, individual staff portraits)
- **Footer:** Copyright notice ("Klein Family Sugarbush"). No social media links - business is kept local.
- **Navigation:** Simple top nav bar with links to Home, Staff, Games
- **Responsive:** Must work well on mobile, tablet, and desktop

---

## 4. Interactive Mini-Games

### 4.1 Tapping & Collecting Game

**Concept:** Players learn how sap is collected from maple trees by interacting with a virtual sugar bush.

**Gameplay:**
- Scene shows a grove of maple trees in a snowy New Hampshire landscape
- Player taps on trees to drill tap holes, then hangs buckets or attaches tubing
- Sap drips into buckets over time (visual drip animation)
- Player clicks to collect full buckets before they overflow
- As sap is collected, a progress meter fills showing total gallons gathered
- Educational pop-ups appear at milestones explaining real facts:
  - It takes ~40 gallons of sap to make 1 gallon of syrup
  - Sap runs best when nights are below freezing and days are above freezing
  - Tapping season is typically late February through early April in NH

**Win condition:** Collect enough sap (e.g., 40 gallons) to produce 1 gallon of syrup, then proceed to the boiling game or see a congratulations screen.

### 4.2 Boiling Simulation Game

**Concept:** Players learn the evaporation process by managing a sugar house evaporator.

**Gameplay:**
- Scene shows an evaporator/arch setup inside a sugar house
- Player feeds sap into the evaporator pan
- Must manage the fire (add wood to keep temperature up)
- Monitor the temperature gauge - too low and nothing happens, too high and the syrup burns
- Watch the sap gradually change color as water evaporates and sugar concentrates
- Use a hydrometer/refractometer tool to check density
- Educational pop-ups explain:
  - Syrup is done at 219 degrees F (7 degrees above boiling point of water)
  - Proper density is 66-67 Brix (percent sugar)
  - Different draw-off times produce different grades (Golden, Amber, Dark, Very Dark)

**Win condition:** Successfully produce a batch of syrup at the correct temperature and density. Display the grade achieved based on timing/color.

### Game Requirements (Both)
- Built with HTML5 Canvas or a lightweight JS game library (e.g., Phaser, PixiJS, or plain Canvas API)
- No external servers required - all game logic runs client-side
- Mobile-friendly touch controls
- **Retro pixel art style** inspired by classic NES/Mario-era games - pixelated trees, characters, buckets, evaporator, etc.
- **Retro chiptune sound effects and music** - 8-bit style audio for actions (tapping, dripping, fire crackling, success jingles)
- Brief intro/instructions screen before each game
- **Linked experience:** Completing the tapping game transitions into the boiling game, carrying over the sap collected. Players can also start each game individually from the Games page.
- **Generated placeholder pixel art** to start - can be replaced with custom sprites later

---

## 5. Technical Stack

- **Framework:** Static site - HTML, CSS, and JavaScript (or a lightweight framework like Astro if beneficial for component reuse)
- **Games:** HTML5 Canvas / JavaScript (evaluate Phaser.js or plain Canvas based on complexity)
- **Hosting:** Vercel - client will acquire a custom domain
- **Analytics:** Google Analytics
- **Fonts:** Google Fonts (Lexend, Montserrat)
- **No backend required** - purely static/client-side
- **Build tool:** Optional bundler (Vite) if using a framework; otherwise plain files are fine

---

## 6. Assets Needed (from client)

- [ ] Hero/header background image
- [ ] Team group photo
- [ ] Individual staff portraits (12 members)
- [ ] Any additional photos for the Home page
- [ ] Staff member titles/descriptions (confirm current ones are accurate)
- [ ] Game art assets (or approve generated placeholder art to start)

---

## 7. Non-Goals (Out of Scope)

- E-commerce / online ordering
- Blog or news section
- About page (excluded per client request)
- User accounts or login
- Server-side functionality
- SEO optimization beyond basic meta tags

---

## 8. Resolved Decisions

1. **Game art style:** Retro pixel art, NES/Mario-era inspired
2. **Game linking:** Two separate games that link together - completing tapping transitions into boiling, but each can also be played standalone
3. **Domain/hosting:** Client will acquire a custom domain
4. **Social media:** None - business is kept local, no social media links on the site
5. **Analytics:** Google Analytics
6. **Hosting:** Vercel
7. **Game assets:** Generate placeholder pixel art to start, replace later
8. **Sound:** Retro chiptune sound effects and music

## 9. Open Questions

None - all questions resolved! Ready for implementation planning.
