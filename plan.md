# Implementation Plan: Align study to `requirements.md`

> Scope: adapt the existing static site to the experiment specification in `requirements.md`.
> This document is a plan only — no implementation has been done yet.
> Items are ordered by importance (Priority 1 → 5).

## Priority 1 — Correct study flow and screens

- [x] Split the current welcome screen into two separate screens: a simple welcoming page ("Real or AI?") and an informed consent page.
- [x] Add an informed consent screen with placeholder IRB Appendix B text and two required checkboxes; keep Continue disabled until both are ticked.
- [x] Replace demographics with 6 required questions: age as a whole-number field (18–99 only) and radio buttons for all other questions; no selects, textareas, or free-text fields; all required.
- [x] Remove the exit questionnaire's free-text fields and remove it from the main flow: Phase 3 trials → submit → debriefing.
- [x] Update phase intro screens to the required wording: "Phase 1", "Phase 2 – you will now receive feedback", "Phase 3 – you will no longer receive feedback".
- [ ] Replace instructions and debrief text with the full IRB Appendix D texts. (Pending IRB file.)
- [x] Ensure there is no Back button anywhere (already the case) and that submission happens only at the end.

## Priority 2 — Trial response scale and display

- [x] Change the judgement screen from a binary AI/Real choice to the required 4-point scale: 1 = Definitely real, 2 = Most likely real, 3 = Most likely AI, 4 = Definitely AI.
- [x] Render the four buttons in one row, identical in size and color, with only the text labels shown (no numbers).
- [x] Update the trial question to "Is this image real or AI-generated?".
- [x] Record the numeric rating (1–4) in the data; derive AI/real classification (rating ≥ 3 = AI) for correctness and attention-check scoring.
- [x] Keep the image centered at its original aspect ratio (never cropped or stretched) via `object-fit: contain`.
- [x] Ensure stimulus assets use the required orientations: landscapes/interiors 3:2, faces/objects 2:3 (including dummy generator output).
- [x] Keep the within-phase progress indicator ("Image X of Y").
- [x] Keep no time limit and immediate advance on click (no separate Next button).
- [x] Record response time in milliseconds from image onset to click (already; depends on Priority 4 preloading).

## Priority 3 — Neutral, self-paced feedback (Phase 2 only)

- [x] Replace the green/red full-screen flash with a separate neutral feedback page showing "This image was AI-generated." or "This image was real." plus a Continue button.
- [x] Make feedback self-paced (no auto-advance timer); advance only when Continue is clicked.
- [x] Remove color, icons, flashing, and animation from feedback; use plain text with a neutral grey/light box.
- [x] Do not show the image again on the feedback page.
- [x] Give attention-check trials the same feedback as any other image.

## Priority 4 — Stimulus allocation, attention checks, and preloading

- [x] Update counts: baseline 20, training 20, test 40; training AI proportions 20% / 50% / 80%; 3 attention checks.
- [x] Implement per-participant draw of 80 items (20 per category) from 100, split 20 / 20 / 40 across phases (5 / 5 / 10 per category).
- [x] Assign real vs. AI per phase to hit the required proportions, spreading AI across categories as evenly as possible with random tie-breaks.
- [x] Split AI trials evenly between ChatGPT and Gemini within each phase.
- [x] Ensure no bucket is reused across phases (already; verify with new counts).
- [x] Shuffle trial order within each phase and insert the attention check at a random non-first, non-last position.
- [x] Add the 3 attention-check images (one per phase, same image each phase) displayed exactly like other trials.
- [x] Flag attention-check trials in data and store pass/fail per check (rating 3/4 = pass; 1/2 = fail).
- [x] Exclude attention-check trials from AI proportions and from analysis.
- [x] Preload all images for a phase before its first trial starts (with a loading state) so response times stay accurate.
- [ ] (Nice-to-have) Balance faces by gender (~half female/male) using stimulus metadata.

## Priority 5 — Condition assignment, data, privacy, and persistence

- [x] Change training ratios from 25/50/75 to 20/50/80.
- [x] Implement balanced randomization across participants (assign to the condition with the fewest completed participants, random tie-break) instead of a simple random pick.
- [x] Remove per-trial `localStorage` writes; persist the session only on final submit.
- [x] If any intermediate persistence is needed for technical reasons, automatically delete incomplete sessions on load/unload.
- [x] Store attention-check flags and pass/fail results; update CSV/JSON export columns accordingly.
- [x] Ensure no identifying data is collected or stored (no names, emails, cookies for tracking, analytics, or free text); configure the upload endpoint/server not to log IP addresses.
- [x] Keep all UI text in English.
- [ ] Run end-to-end tests of the full flow for all three conditions with dummy stimuli, verifying counts, category balance, no bucket reuse, attention-check placement/flagging, preloading, and save-on-submit behavior.
- [ ] (External dependency) Obtain IRB appendices B, C, and D and insert their full texts before any live deployment.
