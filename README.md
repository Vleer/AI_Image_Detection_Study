# Can you prime someone to be worse at recognizing AI?

A self-contained web experiment. A participant judges images as real or
AI-generated, goes through a block of feedback training where the proportion of
AI images is secretly rigged, and then judges a fresh balanced set. The question
is whether the rigged block shifts their bias and costs them accuracy.

No build step, no dependencies, no server-side code. Plain HTML, CSS and
JavaScript.

## Running it

Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk works too, since nothing is fetched
over the network.

To deploy, upload the whole folder to any static host (GitHub Pages, Netlify,
a university web space).

## Study flow

| Screen | What happens |
| --- | --- |
| P1 | Welcome and consent, with a cover story that avoids the real hypothesis |
| P2 | Age, gender, education, prior exposure to AI images, confidence |
| P3 | Baseline: 20 images, 50% AI, **no feedback** |
| P4 | Training: 20 images with full-screen correct/wrong feedback, at a rigged 25%, 50% or 75% AI rate |
| P5 | Post-test: 20 images, 50% AI, no feedback — identical to P3 |
| P6 | Exit questionnaire, then a full debrief explaining the deception |

P3 and P5 are run by the same code path with feedback switched off, so the only
difference between the pre- and post-test is what happened in between.

Participants answer with the on-screen buttons, or with **←** for AI-generated
and **→** for real photo.

## Stimulus design

A **bucket** is one scene in three versions: the original photograph, a ChatGPT
version and a Gemini version. Trials draw one version per bucket, and each
bucket is used **at most once per session** — showing someone two versions of
the same scene would give the answer away and contaminate the comparison.

Buckets are drawn round-robin across the four categories (faces, landscapes,
interiors, objects), so every block stays balanced. Within the AI trials,
ChatGPT and Gemini are split evenly. The trial order is reshuffled until no
answer repeats more than three times in a row.

A full session needs 60 buckets in the between-subjects design, or 100 in the
within-subjects design.

## Swapping in the real photos

The site currently generates placeholder scenes so the whole flow is testable
before any photography exists. To go live:

1. Put the files in `Photos/`, using the same filename for the three versions
   of a bucket:

   ```
   Photos/real/faces-001.jpg
   Photos/chatgpt/faces-001.jpg
   Photos/gemini/faces-001.jpg
   ```

2. Fill in the per-category counts in `js/photo-manifest.js`.
3. Set `useDummyStimuli: false` in `js/config.js`.

If the filenames do not fit that pattern, replace `build()` in
`js/photo-manifest.js` with anything that returns the same array shape.

## Configuration

Everything tunable lives in `js/config.js`:

- `trials` — images per block (20 / 20 / 20 by default)
- `primingDesign` — `'between'` gives each participant one randomly assigned
  ratio; `'within'` runs all three blocks per participant in random order
- `primingRatios` — the AI proportions used in training
- `feedbackMs`, `interTrialMs`, `responseLockoutMs` — timings
- `uploadEndpoint` — set a URL to POST each finished session as JSON
- `showResultsToParticipant`, `allowSelfExport` — what the debrief screen offers

The default is **between-subjects**, because running all three ratios inside one
participant lets each block wash out the previous one. Switch to `'within'` if
you would rather trade that off for statistical power.

### URL parameters for piloting

- `?trials=5` — short blocks
- `?ratio=0.75` — force a training condition
- `?design=within` — override the design
- `?debug=1` — log trial construction and label placeholder images

## Data

Everything is written to `localStorage` after each trial, so a crash or a closed
lid does not cost the run. If a previous participant's session is still on the
device it is archived rather than overwritten.

Each trial row records the phase, block and its rigged ratio, the bucket,
category and variant shown, the response, whether it was correct, the reaction
time in milliseconds, and whether the answer came from the keyboard or a click.
Tab-switching during a block is logged as an event so inattentive sessions can
be filtered out.

At the end the participant can download their own data as JSON or CSV, or wipe
it. To collect from a shared device, run this in the browser console:

```js
RAI.store.exportAll()   // every session on this device, as CSV + JSON
```

For a real deployment, point `uploadEndpoint` at your own collector so data does
not depend on the participant's browser.

## Ethics notes

The study uses mild deception: participants are not told that the AI proportion
in the training block is manipulated. No feedback is ever false — every
correct/wrong screen reflects the true label. The debrief explains the
manipulation in full and offers deletion afterwards. Check the consent text in
`js/screens/welcome.js` and the debrief in `js/screens/debrief.js` against your
own ethics board's requirements before running anyone through it.

## Layout

```
index.html
css/styles.css
js/
  config.js            study settings and URL overrides
  rng.js               seeded RNG, so any session can be reconstructed
  photo-manifest.js    where the real photos are declared
  dummy-images.js      placeholder scene generator
  stimuli.js           bucket allocation and trial construction
  store.js             session record, persistence, export
  ui.js                DOM helpers, progress bar, feedback overlay
  app.js               flow controller
  screens/             one file per screen
Photos/                real/, chatgpt/, gemini/
```
