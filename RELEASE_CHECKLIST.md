# Release checklist

## One-time GitHub setup

- Create repository: `HerrgottMargott/Herrgotts-H3-Infinite-Continuation-Suite`
- Upload/push the contents of this repository root.
- Use `main` as the default branch.
- Enable GitHub Issues.
- Enable private vulnerability reporting under repository Security settings.
- Add a short repository description and topics such as `comfyui`, `minimax`, `h3`, `video-generation`, `custom-nodes`.

## One-time Comfy Registry setup

- Confirm publisher profile is `@herrgottmargott`.
- Create a Registry Publishing API key for that publisher.
- In GitHub: Settings -> Secrets and variables -> Actions -> Repository secrets.
- Create `REGISTRY_ACCESS_TOKEN` containing that Registry publishing key.

## Before every release

- Update `version` in `pyproject.toml`.
- Update `CHANGELOG.md`.
- Run `pytest -q`.
- Run Python syntax compilation.
- Check the example workflows load.
- Search for prohibited `eval` / `exec` / runtime `pip install` patterns.
- Commit and push.

## Publish

Recommended controlled flow:

1. Tag the tested commit, e.g. `v1.2.0`.
2. Create/publish a GitHub Release from that tag.
3. The `publish_registry.yml` workflow publishes the same tagged version to Comfy Registry when the GitHub Release is published.
4. Confirm the Registry page and ComfyUI Manager listing.

The Registry workflow can also be started manually with `workflow_dispatch`.
