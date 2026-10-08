# Game mascot reactions

## Blink frame update
Built-in image_gen output saved as public/mascot-blink.png. The UI overlays only the eye band and preserves the original body image.

Prompt: Precise object edit for animation. This exact 1536x1024 three-character sprite sheet is the edit target. Change ONLY the eyes of ALL THREE characters to fully closed eyelids for one natural blink frame. Keep glasses frames, nose, brows, mouths, hair, hands, books, body, poses, scale, position, background and every other pixel as unchanged as possible. Closed eyelids are warm golden skin with a curved dark eyelash line inside the same glasses lens shapes. Do not move or redraw the character. No new objects, text or lighting changes. Same exact canvas and sprite alignment. This will be overlaid ONLY in the eye areas over the original, so matching eye positions is essential.

Created with the built-in image_gen tool using the user-supplied character in Downloads.
Final asset: public/mascot-reactions.png. Three poses: idle, correct, encouraging retry.
The generated background is opaque; the app intentionally displays portrait frames.

## Initial prompt
Use case: identity-preserve. Create ONE production game mascot sprite sheet from the reference character. Keep his exact recognizable identity: gray-brown curly afro, angular long face and chin, round glasses, warm golden skin, blue sweatshirt, three red green blue books tucked under his left arm, same polished outlined cartoon illustration. Transparent alpha background, no white backdrop, no checkerboard drawn in. Landscape canvas 1536x1024 divided into THREE EXACT equal-width columns, no visible panel lines. Each column contains one complete waist-up character at the SAME scale, baseline and head height with generous transparent margins, no overlaps between columns. Left column: original friendly confident smile, right hand pointing up. Middle column: delighted correct-answer reaction, bright open eyes and big happy grin, right hand thumbs up. Right column: sympathetic wrong-answer reaction, slightly raised worried eyebrows and small concerned smile, right hand open palm encouraging try again. Preserve original style, not photorealism. No speech bubbles, no globe, no extra symbols, no text, no labels, no ground shadow. All hair, hands and torso fully inside their respective cells. Sprite sheet for a Thai language learning Hangman game.

## Final edit prompt (v1)
Edit this sprite sheet ONLY to fix production use. Remove ALL background, colored glow, brown haze, blue light and shadows: actual transparent alpha background. Keep the same three cartoon poses and exact identity and illustration. Re-layout precisely within a landscape 1536x1024 sheet: three equal 512px columns. Shrink EACH character so its full silhouette including fingers and books fits within x=40..472 in its own cell. Left cell center x256, middle x768, right x1280. No silhouette crosses a cell boundary. All heads at y170, torso baseline y870. Uniform scale, generous empty transparent margin. No text, no ground, no backdrop, no gradients behind characters. Characters should be isolated sticker cutouts.

---

# v2: mascot crew (3 characters) matched to the site theme

Plan: turn the current character into the master (A+B) → game sprite sheet (C) → blink frame (D) → two new characters (E, then repeat B → C → D for each).
Always attach the master image from B as a reference, so all three stay one set.

Why v2: the yellow/red "HELLO!" sticker version was off-brand (the site uses ink blue / mint / teal), the side-eye smirk read as smug instead of a friendly buddy, baked-in text can't be translated, and the small details turn to noise at ~250px.

## A. Shared style block (append to every prompt)
```
STYLE (keep identical for every character in this set):
Bold street-graffiti sticker illustration. Thick confident near-black navy outlines (#0B0F3A), flat cel shading with light spray-paint texture, a few paint drips, very subtle halftone only inside shadows. Thick clean white sticker border around the whole silhouette.
Brand palette ONLY: ink blue #2F39A9, steel blue #2E6FA0, teal #49A4BB, mint #15D8B3, navy #0B0F3A, cream #F5F3EA for highlights. Natural skin tones.
NO yellow, NO red, NO orange, NO bright green. All spray, drips, sparkles and crowns are mint or teal only.
Personality: warm, friendly, encouraging study buddy. Eyes look directly at the viewer. Open warm smile. Never smug, sarcastic or side-eyeing.
Must read clearly at 250px wide: big expressive eyes, clean face, simple shapes, minimal tiny details, at most one small crown and 2–3 sparkles.
No text, no letters, no speech bubbles, no logos. Transparent background.
```

## B. Fix the current character into the master (attach the "HELLO!" image)
```
Edit this character. Keep his exact identity: dark gray curly afro, round glasses, long angular face, blue sweatshirt, stack of books under his left arm, waving right hand, same sticker illustration style.
Changes:
1. Replace ALL yellow spray, drips, crowns and sparkles with mint #15D8B3 and teal #49A4BB.
2. Recolor the books: ink blue #2F39A9, mint #15D8B3 and steel blue covers with cream pages. No red or green.
3. Eyes look straight at the viewer, relaxed friendly eyebrows, warm open smile. Remove the smirk and clenched teeth.
4. Remove the "HELLO!" speech bubble and all text completely.
5. Keep only one small mint crown near his hair and 2–3 small sparkles. Remove all other decoration clutter.
6. Make the neck slightly shorter and thicker. Make the waving hand the same size as the hand holding the books.
7. Keep the thick white sticker border and a few paint drips at the bottom edge. Transparent background.
[paste STYLE block A here]
```

## C. Game sprite sheet (attach the master from B)
Layout must match exactly — GameMascot.vue slices the sheet into 3 columns and the blink overlay uses a fixed eye band.
```
Create ONE game sprite sheet from the reference character. Keep his exact identity and illustration style.
Canvas exactly 1536x1024, transparent background, three equal 512px columns, no panel lines.
Each column: one waist-up character, same scale, full silhouette inside x=40..472 of its own column, head top at y=170, torso bottom at y=870, nothing crosses a column boundary.
Left (idle): friendly wave with right hand, looking at viewer, warm smile.
Middle (correct answer): big happy grin, eyes bright, right hand thumbs up, tiny mint sparkles.
Right (wrong answer): sympathetic encouraging smile, eyebrows slightly raised, right palm open like "try again". Kind, NOT sad or disappointed.
No ground shadow, no backdrop, no text.
[paste STYLE block A here]
```
Save as public/mascot-reactions.png.

## D. Blink frame (edit target = the sheet from C)
```
Precise edit for animation. This exact 1536x1024 three-character sprite sheet is the edit target. Change ONLY the eyes of all three characters to fully closed eyelids for one natural blink frame: skin-colored eyelids with a curved navy lash line, inside the same round glasses. Do not move, redraw or recolor anything else. Same canvas, same positions, same pixels everywhere except the eyes.
```
Save as public/mascot-blink.png. The blink overlay shows only the eye band of the sheet (`.buddy-blink` clip-path in GameMascot.vue). For the v2 sheet the eyes sit at y≈372–465 px → `inset(31.4% 0 56.5% 0)`; if new eyes land elsewhere, re-measure and update that value.

v2 installed 2026-09-28: public/mascot-reactions.png + public/mascot-blink.png (old v1 files backed up in assets/mascot-v1/), single waving master saved as assets/mascot-master.png.

## E. New character template (one at a time, attach the master from B)
```
Create a new character for the same mascot set as the reference image. Same illustration style, outline weight, sticker border, proportions and level of detail as the reference, so they look like one crew.
Character: [age / look, e.g. "teen girl, short bob hair, over-ear headphones, mint hoodie"]
Signature item: [e.g. "a smartphone showing a chat bubble"]
Main outfit color: [pick one not used by the others: ink blue / mint / teal]
Pose: waist-up, friendly wave, looking at viewer, warm smile.
[paste STYLE block A here]
```

## Tips
- Give each character a different main outfit color (ink blue / mint / teal) so they stay distinguishable when small.
- Before accepting an image, shrink it to ~250px wide — that's roughly how big it shows on the site.
