# Female ROC v2 — generation provenance

Six newly generated sheets, five views per sheet: 30 views. Built-in ImageGen, not CLI. All 2172 × 724 pixels. Order: left 90°, left 45°, front, right 45°, right 90°.

Recovered the successful vessels and bone outputs from the original generation session on 2026-10-11; they had not been copied into the project. No new generation was necessary for recovery. These are new outputs from the same batch as the four existing v2 sheets, not legacy anatomy assets.

Original output directory: `/Users/renannoronha/.codex/generated_images/01a12825-15a4-71e2-97a0-44915b719073/`.

| Project file | Original output |
|---|---|
| female-skin.png | exec-89b334cc-a9aa-4cae-9e26-14ab176ad7c8.png |
| female-subcutaneous.png | exec-a63606c1-8c4b-422c-9073-3a56645f291f.png |
| female-superficial.png | exec-95410dfc-d1f9-4187-bc50-a1833690eb18.png |
| female-deep.png | exec-fcb85b8e-d09f-42f9-8ba6-2baeba716f29.png |
| female-vessels.png | exec-a380b0c0-6759-4491-ad92-9ceafee23ef1.png |
| female-bone.png | exec-6e56f6be-2bc9-4dfd-af11-59a95612c995.png |

## Prompts

### Skin

Use case: identity-preserve. Recreate a NEW coherent photorealistic medical mannequin turntable sheet using this woman as identity reference. Five equal-width panels in a single horizontal row, no dividers: strict left profile 90°, left 45°, front 0°, right 45°, strict right profile 90°. SAME woman, identical warm fair skin tone, pores/freckles, brown hair swept into same small bun, closed eyes, neutral mouth, age and face shape in all five views. Camera orthographic, fixed scale, fixed yaw axis through head center, zero pitch/roll; eye line, nose base and chin line at identical heights in all panels. Head centered at each panel center, full head plus neck with generous white margins so no heads touch. No shoulders. Change neck ending: softly feather/fade the lower neck into pure white, no hard cutout edge. Professional realistic medical illustration with soft neutral lighting identical for all views. This will be the base for five internal anatomical layers: preserve natural anatomy. Background pure white. No text, numbering, labels, borders, marks, duplicate ears or extra heads. Output wide 3:1 sheet; all five equal panels with enough white gap to crop each independently.

Reference: `../female-skin-turntable-v1.png`. All following outputs use the new `female-skin.png` as reference.

### Subcutaneous

Use case: precise-object-edit. Image 1 is the NEW female turntable edit target. Produce one NEW five-view anatomical sheet, exact same layout and geometry. LOCK all five head centers, camera, yaw angles left90,left45,front,right45,right90, eye height, nose base height, chin height, neck position, scale, white background and soft white fade at lower neck. Do not rearrange, crop, enlarge, shift or tilt any head. Same female anatomy under the skin. Professional realistic clean medical anatomical 3D illustration, non-gory, no labels/text/numbers, no shoulders, no extra heads, no panel borders. Reveal only requested anatomical layer while preserving underlying female skull/face proportions. Layer: SUBCUTANEOUS TISSUE. Remove the surface skin and hair to reveal golden pale-yellow lobulated adipose compartments and delicate fibrous septa across face/scalp/neck. Preserve nose and ears anatomy and closed eyelids. Fat should be structured subtle yellow lobules, not red muscles, no vascular network; keep lips recognizably anatomical. This is the exact same woman in every pose, not a new generic head. Lower neck dissolves softly to white identically to reference.

### Superficial — successful retry

Create a clean educational manufactured anatomy mannequin illustration based on the exact five poses of the attached female turntable. This is an inert plastic medical teaching model, not a person undergoing surgery. Five views in identical positions and scale as reference: left90,left45,front,right45,right90. Depict the superficial facial musculature as matte terracotta-red molded muscle shapes with fine fiber grooves, cream fascial borders, recognizable frontalis, orbicularis oculi/oris, zygomaticus, mentalis, platysma. Same head geometry, eyelid/nose/chin heights, camera, neck and white background. No hair on anatomy teaching model. No gore, blood, wounds, procedures or damaged tissue. Soft white feathered fade at neck ending. No labels or text, no extra heads, no cropped heads. Professional anatomical textbook teaching model. Change only surface anatomical representation, not head placement or proportions.

### Deep

Create a clean educational manufactured anatomy mannequin illustration based on the exact five poses of the attached female turntable. Inert plastic medical teaching model, not a person undergoing surgery. Five views in identical positions and scale as reference: left90,left45,front,right45,right90. Depict the DEEP FACIAL MUSCLES anatomical teaching layer, distinct from superficial facial expression muscles: sculpted masseter and temporalis, buccinator, deeper perioral structure, deep neck musculature with sternocleidomastoid and suprahyoid structures. Matte deep terracotta-red molded fibers with pale ivory fascial borders. Same female head geometry, eyelid/nose/chin heights, camera, neck and white background. No hair. Do not move or rescale any head. No gore,blood,wounds,procedures,damaged tissue. Soft white feathered fade at neck ending. No labels,text,extra heads,cropped heads. Professional anatomical teaching model. Change only anatomical layer, not proportions or pose.

### Vessels

Create a clean educational manufactured anatomy mannequin illustration based on the exact five poses of the attached female turntable. Inert plastic medical teaching model, not a person undergoing surgery. Five views in identical positions and scale as reference: left90,left45,front,right45,right90. Depict VESSELS AND NERVES anatomical layer: realistic fine red arteries, blue veins and yellow facial nerve branches over a lightly desaturated warm terracotta molded muscular head and neck. Show organized branching facial and superficial temporal vessels, facial nerve branches, cervical vessels, not random decorative webs. Same female head geometry, eyelid/nose/chin heights, camera, neck and white background. No hair. Do not move or rescale any head. No gore,blood,wounds,procedures,damaged tissue. Soft white feathered fade at neck ending. No labels,text,extra heads,cropped heads. Professional anatomical teaching model. Change only anatomical layer, not proportions or pose.

### Bone

Create a clean educational manufactured female SKULL AND CERVICAL SPINE teaching model turntable matching the attached female five-pose sheet. Five views in same centers and camera scale: strict left profile90,left45,front,right45,strict right profile90. Replace only soft-tissue appearance with ivory bone skull, mandible, full teeth in natural closed occlusion and upper cervical vertebrae. Important cranial vault, orbital centers, mandibular chin and cervical axis correspond to the attached woman's anatomy and identical camera; do NOT enlarge skulls to occupy hair outline. Female delicate morphology, not male heavy brow. Skull naturally lacks skin nose tip/cartilage, lips, ears, hair; do not invent bony protruding nose tip or ears. Clean matte ivory teaching model, realistic bone sutures but no grunge. Same white background, no shoulders, soft white fade at bottom of neck. No extra rows, no labels/text, no duplicate skull, no cut edges, no wounds, no gore. All five complete independent skulls, no overlap, equal full head scale and eye/orbit height; identical mannequin only rotated around vertical axis.

## Validation scope

All sheets inspected as full images. Five complete views each; soft neck fade; no text. Approximate panel boundaries normalized to 2048 px width: 0, 450, 835, 1207, 1592, 2048. These images are illustrative, not a registered physical 3D scan or clinically validated anatomical data. Surface contours naturally differ from underlying bone.
