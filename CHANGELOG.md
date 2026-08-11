# Changelog

Only major user-facing or technically important milestones are listed here. Experimental micro-iterations are intentionally omitted.

## 1.2.0 — First public release candidate

- Added **Safe Tail Bridge** for video seams. When phase alignment forces the latent handover 1–3 frames before Auto Handover's already-safe ideal endpoint, the stitcher can keep up to **2** of those exact rendered frames from the previous clip and skip the same number of early video frames in the next clip. The detector safety margin and total timeline length remain unchanged.
- Kept the tested seam defaults at **4 context-aligned video crossfade frames + 15 ms audio de-click crossfade**. Audio timing is intentionally independent from Safe Tail Bridge.
- Boundary luminance matching remains available as an **experimental fallback**, but is now **off by default** after live testing showed that it could turn a short brightness seam into a longer brightness drift.
- Updated the 3-clip Auto-Stitch and Saved-Chain workflows to use Safe Tail Bridge and refreshed all in-canvas guidance.
- Reworked the public README: clearer FFLF quality-reset / keyframe-control positioning, Prompting Guidance, current limitations/OOM observations, simplified node descriptions and less development-detail noise.
- Public node display names now use **v1.2** while the existing internal class IDs remain registered for workflow compatibility.

## 1.1 — Release hardening and complete long-form workflow

- Added `Balanced`, `Motion Safe` and `Custom` Auto Handover presets plus the No-Lock Fallback.
- Added `Full`, `Stitch Ready` and `Final Clip` output modes.
- Added the annotated Start, Continue and 3-clip automatic-stitch workflows.
- Added context-aligned rendered video smoothing and the separately tuned **15 ms audio de-click crossfade**.
- Added self-describing saved AV latents and the **memory-bounded Stitch Saved Chain** workflow/node.
- Changed H3 runtime hooks to lazy, marker-gated installation with compatibility self-checks and explicit conflict detection instead of patching ComfyUI at startup.

## 1.0 — Usable release interface

- Switched from raw frame counts to **Duration (Seconds)**.
- Added non-destructive full AV latent Save / Load support and rendered-output trimming.
- Kept older experimental alignment/safety modes as Legacy options for reproducibility.

## 0.x — Core continuation research

- Built the first direct **video + audio latent continuation** prototype.
- Added automatic FL2VA freeze-tail detection after fixed trimming proved unreliable.
- Reworked freeze detection into the current stable-tail / residual-motion approach.
- Solved continuation startup flicker with **`phase_aligned_extended`** context selection.
- Restored native First/Last-Frame anchoring while keeping optional `<Picture 1>` Qwen-only.
