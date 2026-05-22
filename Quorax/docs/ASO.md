# Quorax — App Store ASO (English-only store)

Single source of truth. Store is **English only** (primary & only locale).
Copy-paste each field into App Store Connect. Re-read before any future update.

> Verified against the real app (May 2026): photo + text math solver, step-by-step
> solutions, **verify-your-own-work**, per-step "why?" explanations, function graphing,
> scientific calculator, AI exam/practice-test generator (multi-subject), AI chat,
> activity history, daily reminders. Free tier with daily limits + soft feature gates
> + hard paywall after N solves. **Subscription is iOS-only (RevenueCat).**

---

## 1. App Store Connect — Localization

- App Information → Primary Language: **English (U.S.)**
- Keep **only** the English (U.S.) localization. Remove any TR/AR/ES/HI localizations if present.
- `app.json` already aligned: `CFBundleLocalizations: ["en"]`, `CFBundleDevelopmentRegion: "en"`.

---

## 2. Metadata fields (copy-paste)

### App Name — 30 char max
```
Quorax: AI Math Solver
```
21/30 · "Math Solver" = highest-volume keyword, "AI" = relevance signal, "Quorax" = brand.

### Subtitle — 30 char max
```
Photo Solver · Steps & Verify
```
29/30 · "Photo Solver" + "Steps" long-tails; "Verify" is the signature differentiator.

### Keywords — 100 char max (commas, NO spaces, no word repeated from name/subtitle)
```
homework,scan,algebra,calculus,trig,geometry,physics,chemistry,sat,act,jee,gre,gmat,quiz
```
88/100 · `math,solver,photo,steps,verify,ai` are already in name+subtitle — Apple auto-combines them (e.g. `algebra solver`, `scan math`, `sat math`, `physics solver`). Do **not** repeat them here. Exam keywords (sat/act/jee/gre/gmat) = high intent, low competition. **No Turkish exam terms** (yks/tyt/ayt/lgs/kpss) — they have ~zero volume in an English-language store.

### Promotional Text — 170 char max (no re-review; change every 1-2 months / per season)
**Use this now (May 2026 — finals & SAT/AP season):**
```
AP exams, finals & SAT prep. Snap any math problem for instant step-by-step solutions — then verify your OWN work line by line. Free trial.
```
135/170

Seasonal swaps:
- **Aug–Sep:** `Back to school. Homework helper that shows every step — snap a photo, get the solution, and learn the why behind it.`
- **Dec:** `Midterms prep. Snap, solve, understand. Quorax checks your own work and finds the exact step you got wrong.`

### Description — 4000 char max
```
Solve any math problem with AI. Take a photo or type it — get step-by-step solutions in seconds, then check your own work line by line.

✓ Step-by-step solutions for every problem
✓ Verify YOUR work — Quorax checks your steps and finds the exact one you got wrong
✓ Tap any step for a "why?" explanation, not just the "what"
✓ Algebra, Geometry, Trigonometry, Calculus, Statistics
✓ Physics & Chemistry problems
✓ AI practice exams: SAT, ACT, JEE, GRE, GMAT and more
✓ Scientific calculator built in
✓ Start instantly — no sign-up required

🧠 SMARTER THAN A CALCULATOR
Quorax doesn't just spit out answers. It walks you through every step so you actually learn. Tap any line to ask "why?" and get an instant explanation of the reasoning — not just the result.

✅ THE ONLY APP THAT VERIFIES YOUR WORK
Already solved it yourself? Quorax checks your solution line by line, marks each step correct or wrong, and tells you exactly where you slipped. Snap a photo of your handwritten work or type it in. No other math app does this.

📸 SNAP & SOLVE
Photograph any handwritten or printed problem. Quorax reads it, solves it, graphs it when it's a function, and explains it.

📚 EVERY SUBJECT
• Algebra (linear equations, quadratics, systems)
• Geometry (area, volume, proofs)
• Trigonometry (identities, equations)
• Calculus (derivatives, integrals, limits)
• Statistics & Probability
• Physics (mechanics, waves, electricity)
• Chemistry (stoichiometry, equilibrium)

🎯 AI PRACTICE EXAMS
Generate a full multiple-choice practice test on any topic or standardized exam — SAT Math, ACT, JEE, GRE Quant, GMAT, AP-style and more. Get instant feedback, see why each wrong answer was wrong, and track your mastery by topic so you know what to study next.

💬 AI STUDY CHAT
Ask follow-up questions, get hints, and work through problems in a back-and-forth conversation.

💎 PREMIUM
Try Quorax Premium, then subscribe monthly or yearly (best value). Manage or cancel anytime in iOS Settings.
• Unlimited problem solving
• Verify your own work
• Per-step "why?" explanations
• Topic mastery analysis
• Unlimited AI practice exams
• Wrong-answer explanations

🔒 PRIVACY
We don't sell your data. Your solutions are stored only for your own history. Start solving anonymously — no account needed.

📧 SUPPORT
support@quorax.app

Terms: https://quorax.app/terms
Privacy: https://quorax.app/privacy
```

> ⚠️ Before submitting, set the exact trial length / prices to match your real
> RevenueCat products in App Store Connect → Subscriptions. The description above
> intentionally avoids hard-coded numbers so it never goes stale or gets rejected.

### What's New (release notes) — edit per release
```
• Faster problem detection from photos
• Improved step-by-step explanations
• Better handwriting recognition
• Bug fixes and performance improvements
```

---

## 3. Screenshots (REQUIRED — biggest conversion lever)

Apple shows the **first 3** in search results — those matter most.
Required sizes: **6.7" iPhone (1290×2796)** and **6.5" iPhone (1242×2688)**, ≥3 each.
6.7" assets are auto-scaled down if you only upload that size, but uploading both is safest.

Order + overlay text (English):
1. **HOOK** — camera/solve screen → "Solve any math problem in seconds"
2. **DIFFERENTIATOR** — Verify-my-work screen → "The only app that verifies YOUR work"
3. **BENEFIT** — step-by-step + "why?" → "Step-by-step. Understand, don't just copy."
4. **BREADTH** — subject grid → "Algebra · Calculus · Physics · SAT · ACT · JEE"
5. **EXAMS** — practice exam result → "AI practice tests with instant feedback"
6. **CTA** — paywall/trial → "Start free. Cancel anytime."

Free tools: Canva ("App Store Screenshot" template), Previewed.app (device frames), Mockuuups Studio.
Optional: a 15–30s App Preview video (camera → solve → step explanation) lifts conversion.

---

## 4. App Icon
- 1024×1024 PNG, **no alpha / no transparency**, no rounded corners (Apple rounds it).
- Confirm `assets/images/logo.png` is crisp at 1024px or export a dedicated icon.

---

## 5. Compliance the reviewer WILL check (do these or risk rejection)

- **App Privacy "nutrition label":** declare Camera, Photos, Notifications, Email/account. Mark "Data not used to track you" to match the "we don't sell your data" claim — mismatch = rejection.
- **Age Rating:** complete the questionnaire (this app → 4+ likely).
- **App Review Information → Notes:** write: *"The app works in anonymous/guest mode — no login or demo account is required to use the solver, exams and chat. Subscriptions are iOS-only via RevenueCat."* This stops the reviewer getting stuck at a login wall.
- **Subscriptions:** every product needs a localized display name + description; attach a subscription review screenshot if prompted. Prices/trial in the description must match the products.
- **URLs live:** Support `https://quorax.app`, Privacy `https://quorax.app/privacy`, Terms `https://quorax.app/terms` must all load — Apple clicks them.
- **iOS-only paywall:** if you ever publish Android, do NOT advertise trial/Premium there (no RevenueCat on Android → premium is always off).

---

## 6. Apple-side steps, in order

**A. Listing (≈15 min)**
1. App Store Connect → Apps → Quorax → set Primary Language = English (U.S.); delete other localizations.
2. App Information / the version page → paste **Name, Subtitle, Keywords, Promotional Text, Description, What's New** from §2.
3. Save.

**B. Assets (1–2 h)**
4. Upload App Icon (§4) and ≥3 screenshots per required size (§5/§3).
5. (Optional) upload App Preview video.

**C. Compliance (§5)**
6. Fill App Privacy, Age Rating, Review Notes, Subscription metadata. Verify URLs load.

**D. Preview & submit**
7. On the version page click **View on App Store / Preview** to see exactly how the listing renders (name, subtitle, screenshots, description "more" fold).
8. Read the first 3 lines of the description as they appear before the fold — that's what converts.
9. **Add for Review → Submit.** Review typically lands in 24–48h.

**Ongoing**
10. Every 1–2 months update **only** the Promotional Text (no re-review). Use the seasonal swaps in §2.
11. Don't churn the whole listing weekly (re-review loop). Don't buy fake reviews. Don't repeat name/subtitle words in the Keyword field.
```
