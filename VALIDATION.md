# v1.2.0 validation notes

## Automated validation

The release regression suite covers:

- H3 temporal/phase-aligned latent timeline math.
- Stable-tail freeze detection and Auto Handover presets.
- No-Lock Fallback behavior.
- Direct AV continuation metadata and saved head-context metadata.
- Lazy/marker-gated runtime patch isolation and conflict detection.
- Full / Stitch Ready / Final Clip trim planning.
- Context-aligned video/audio seam math.
- 15 ms audio de-click crossfade duration and sample-exact A/V alignment.
- Safe Tail Bridge eligibility, safety-cap behavior and unchanged final timeline duration.
- Example-workflow model/VAE wiring and release seam defaults.

Current v1.2.0 release-candidate result: **66/66 regression tests passing**.

Run from the repository root:

```bash
python -m pytest -q
```

## Empirical ComfyUI validation before v1.2

- Balanced freeze detection was manually checked against roughly ten H3 clips and matched the visible freeze boundary very closely in those tests.
- Direct latent continuation preserved strong movement and native audio across boundaries.
- The phase-aligned extended context removed startup flicker seen with earlier arbitrary latent cut positions.
- A full three-clip showcase completed successfully with 243-frame segments, dynamic 22/26-frame continuation contexts and `Final Clip` preserving the last keyframe landing.
- Saved Chain Stitching completed on the same three saved clips with **617 video frames @ 24 fps**, **822667 audio samples @ 32000 Hz** and **A/V sample rounding delta 0**.
- The **15 ms audio de-click crossfade** was subjectively reported as seamless in live testing.
- A 4-frame video crossfade reduced the visible seam but left a small brightness change. Increasing it to 8 frames only spread that change over a longer interval.
- Boundary luminance matching successfully measured the decode-to-decode brightness difference, but live frame inspection showed that fading the gain could turn the seam into a visible brightness drift. It is therefore retained only as an experimental fallback and disabled by default in v1.2.

## v1.2 change requiring final live smoke test

v1.2 replaces brightness correction as the default video-seam strategy with **Safe Tail Bridge**:

1. take only rendered frames between the phase-aligned latent cutoff and the detector's already-safe ideal end,
2. keep at most two of them from the previous clip,
3. skip the same number of early video frames in the next clip,
4. keep audio on the original timeline with the already-tested 15 ms de-click crossfade.

Before tagging v1.2.0, live-test at least one saved chain where `phase_aligned_cutoff_loss_frames` is 1–3 and verify:

- the log reports `bridge-in` / `bridge-out` values as expected,
- the visible 1–2 frame seam is reduced or removed,
- A/V sample rounding delta remains 0,
- audio remains identical to the already successful 15 ms result,
- no detector safety-margin frames are reintroduced.
