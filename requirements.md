Experiment Specification: AI Image Detection Study
Overview
Each participant goes through one fixed sequence, takes about 20 minutes, and sees 83 images (80 test images plus 3 attention checks). The only difference between participants is the proportion of AI images in Phase 2.
Welcoming page (just some simple text that welcomes the participants)
Informed consent (two required checkboxes)
Demographic questionnaire (6 questions)
Instructions for the experiment (then they click “Start”)
Phase 1 intro screen, then Phase 1: baseline, 20 images + 1 attention check, 50% AI, no feedback
Random assignment to one of three conditions: 20%, 50%, or 80% AI in Phase 2
Phase 2 intro screen, then Phase 2: training, 20 images + 1 attention check, feedback after every image
Phase 3 intro screen, then Phase 3: test, 40 images + 1 attention check, 50% AI, no feedback
Submit, then debriefing page
The full texts of the consent form, questionnaire, instructions, and debrief are in the IRB form appendices (IRB file is uploaded in the same Google Drive folder as the images). 
Pages
Pages appear in this order; there is no Back button anywhere, and nothing is saved until the final submit, if possible (to allow for withdrawal by closing the tab).
#
Page
Content
Participant can
Notes
1
Welcoming page
Could display a simple short text like: “Real or AI?”
Click Continue
I think it would be better if the first thing participants see after opening the link wasn’t the informed consent, but rather something simple. 
2
Informed consent
Full consent text (IRB Appendix B)
Tick "I confirm that I am at least 18 years old." and "I confirm that I have read and understood the information above, and that I agree to participate in this study."
Continue button stays disabled until both boxes are ticked.
2
Demographic questionnaire
6 questions (IRB Appendix C)
Enter age; pick one option for each other question
Age: number field, whole numbers 18–99 only. All other questions: radio buttons, one answer, no free-text fields. All questions required.
3
Instructions
Instructions text (IRB Appendix D)
Read, click Start
Explains the task, the 1–4 scale, that the task is hard and mistakes are expected, and that feedback appears in one part.
4
Phase 1 intro
"Phase 1"
Click Continue


5
Phase 1 trials
21 trial screens
Rate each image
No feedback.
6
Phase 2 intro
"Phase 2 – you will now receive feedback"
Click Continue
Condition is assigned before this screen.
7
Phase 2 trials
21 trial screens
Rate each image
Feedback after every image.
8
Phase 3 intro
"Phase 3 – you will no longer receive feedback"
Click Continue


9
Phase 3 trials
41 trial screens
Rate each image
No feedback. The last rating submits the data.
10
Debriefing
Full debrief text (IRB Appendix D)
Read; close the tab
Shown only after the data are saved.

Trial screen
Every trial shows one image with the four-point scale directly underneath; the participant clicks one of four buttons and the next trial (or the feedback, in Phase 2) appears.
Image: centered, shown at its original aspect ratio, never cropped or stretched. Landscapes and interiors are horizontal 3:2; faces and objects are vertical 2:3. 
Question above the image: "Is this image real or AI-generated?"
Scale: four buttons in one row, left to right, with no midpoint:
1 = Definitely real
2 = Most likely real
3 = Most likely AI
4 = Definitely AI
Buttons: identical in size and color, so no option looks preferred. Labels: only the text labels (e.g., “Definitely real”) are displayed under the buttons, without the numbers 1–4. The numbers are used only in the recorded data.
Progress indicator: a simple bar or "Image 7 of 21" within the current phase would be nice-
No time limit, no Back button. Clicking a rating moves on immediately; there is no separate Next button.
Response time: recorded in milliseconds from image onset to click.
Feedback (Phase 2 only)
After each Phase 2 rating, a separate page without the image shows the true answer in neutral wording, then the participant clicks Continue. The IRB form promises neutral feedback, so it never says "wrong" or "correct."
Wording: "This image was AI-generated." or "This image was real."
Placement: a separate page after each rating, showing only the feedback text and a Continue button. The image is not shown again, so the feedback conveys how often images are AI rather than which visual cues gave them away. 
Look: plain text in the normal text color, no red or green, no icons, no flashing or animation. A neutral grey or light background box is fine.
Moving on: a Continue button; participants decide when to move on (self-paced).
Attention check in Phase 2 gets the same feedback as any other image.
Stimulus rules
The stimulus set has 100 items, each existing in three versions (a triplet): the real Unsplash photo, a ChatGPT version, and a Gemini version. Each participant sees every item at most once, in only one of its three versions. For example, no participant sees both the real photo and the ChatGPT version of the same scene.
The stimulus set
4 categories × 25 items: faces, objects, interiors, landscapes = 100 items, 300 image files.
Each file has an item ID, category, and version (real / ChatGPT / Gemini). 
Per participant
Randomly draw 80 of the 100 items, 20 per category.
Randomly split them across the phases: 20 to Phase 1, 20 to Phase 2, 40 to Phase 3, with an equal number from each category in every phase (5 / 5 / 10 per category).
Decide for each item whether it is shown as real or AI, so that each phase hits its AI proportion (table below).
For each AI item, pick ChatGPT or Gemini so the two generators are split evenly within each phase.
Shuffle the order within each phase. The attention check is inserted at a random position, but not as the first or last trial of the phase.
Images per phase and condition (excluding attention checks)
Phase
Condition
Total
Real
AI
of which ChatGPT
of which Gemini
1 Baseline
all
20
10
10
5
5
2 Training
20% AI
20
16
4
2
2
2 Training
50% AI
20
10
10
5
5
2 Training
80% AI
20
4
16
8
8
3 Test
all
40
20
20
10
10

Balancing within a phase
Categories × real/AI: spread AI images across the four categories as evenly as the numbers allow. Where they can’t divide evenly (e.g. 10 AI over 4 categories = 3, 3, 2, 2), choose which categories get the extra image at random for each participant. If this turns out to be difficult to program, let me know and we’ll simplify it. 
Faces: ideally, the faces a participant sees would be roughly half female and half male. This is a nice-to-have: if it makes the programming difficult, random selection is fine. 
Condition assignment: balanced randomization, so the three conditions fill up evenly (about 60 participants each), e.g. assign each new participant to whichever condition currently has the fewest completed participants, with random tie-breaks.
Attention checks
Three extra images, one per phase, are obviously AI-generated with exaggerated artifacts (e.g. extra fingers, melted text); anyone paying attention should rate them 3 or 4.
Images: 3 files in the “Attention Checks” folder on Google Drive. Each phase always uses the same one.
Placement: one per phase at a random position, never first or last in the phase.
Look: displayed exactly like every other trial, with nothing marking it as a check.
Scoring: a rating of 1 or 2 = failed check. Store pass/fail per check if possible, please.
Analysis: attention-check trials are flagged so they can be excluded from all analyses. They do not count toward the AI proportions in the stimulus table.
Privacy and technical requirements
The IRB form promises full anonymity, so these are requirements, not preferences.
No IP addresses stored anywhere, including server logs.
No identifying data: no names, emails, cookies used for tracking, or third-party analytics (e.g. Google Analytics).
No free-text fields anywhere, so participants can't type identifying information.
Save only on final submit. If someone closes the tab before submitting, nothing is stored; that is how withdrawal works in this study. If answers are saved along the way for technical reasons, incomplete sessions must be deleted automatically.
Images preloaded before each phase starts, so no image appears with a delay and response times stay accurate.
Language: English throughout.
