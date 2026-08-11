# Example workflows

All examples include short in-canvas notes for the relevant inputs and settings.

## 1. `Herrgotts_H3_Infinite_v1.2_01_Start.json`
Creates Clip 1 with native FFLF conditioning, analyzes the end boundary and saves the **full AV latent** for later continuation or Saved Chain Stitching.

## 2. `Herrgotts_H3_Infinite_v1.2_02_Continue.json`
Loads a saved AV latent and creates Clip 2+. Recommended settings are already selected (`auto`, `phase_aligned_extended`, context 22). The Save node stores the actual reused head-context length together with the latent.

## 3. `Herrgotts_H3_Infinite_v1.2_03_3Clip_Showcase_AutoStitch.json`
Complete one-queue demonstration:

`Clip 1 Start -> Clip 2 Continue -> Clip 3 Continue -> Seamless AV Joins -> Save final video`

Release defaults are **Safe Tail Bridge max 2 frames**, **4 context-aligned video crossfade frames** and a separate **15 ms audio de-click crossfade**. Boundary luminance matching remains available only as an experimental fallback and is off by default.

## 4. `Herrgotts_H3_Infinite_v1.2_04_Stitch_Saved_Chain.json`
For longer projects generated clip-by-clip. It loads the numbered full AV latents, reconstructs saved boundaries, applies the same Safe Tail Bridge / seam logic and writes a final MP4.

The stitcher decodes **one clip at a time**, so peak RAM/VRAM does not grow with the total number of clips in the same way as a giant decoded IMAGE/AUDIO batch.
