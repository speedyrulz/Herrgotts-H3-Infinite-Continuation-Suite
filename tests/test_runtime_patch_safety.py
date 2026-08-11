import importlib
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = "herrgotts_h3_suite_testpkg"


def _load(name):
    if PKG not in sys.modules:
        pkg = types.ModuleType(PKG)
        pkg.__path__ = [str(ROOT)]
        pkg.__package__ = PKG
        sys.modules[PKG] = pkg
    return importlib.import_module(f"{PKG}.{name}")


def test_callable_classifier_distinguishes_stock_ours_and_foreign():
    pu = _load("patch_utils")

    class Owner:
        pass

    Owner.__module__ = "comfy.fake"

    def stock(self):
        pass
    stock.__module__ = "comfy.fake"
    st = pu.classify_callable(Owner, stock, "_ours", (("_other", "Other Pack"),))
    assert st.state == "stock"

    stock._ours = True
    st = pu.classify_callable(Owner, stock, "_ours", (("_other", "Other Pack"),))
    assert st.state == "ours"
    del stock._ours

    stock._other = True
    st = pu.classify_callable(Owner, stock, "_ours", (("_other", "Other Pack"),))
    assert st.state == "foreign"
    assert st.owner == "Other Pack"
    del stock._other

    def foreign(self):
        pass
    foreign.__module__ = "some_other_chaining_pack.patch"
    st = pu.classify_callable(Owner, foreign, "_ours")
    assert st.state == "foreign"


def test_payload_patch_is_gated_on_our_markers():
    pp = _load("patch_payload")
    assert not pp._graph_has_our_markers(
        [{"resolved_frame_index": 0}], [{"kind": "audio", "ref_audio_t": 3}]
    )
    assert pp._graph_has_our_markers(
        [{"resolved_frame_index": 0, pp.HC_INDEX: 0}],
        [{"kind": "audio", "ref_audio_t": 3}],
    )
    assert pp._graph_has_our_markers(
        [{"resolved_frame_index": 0}],
        [{"kind": "audio", "ref_audio_t": 3, pp.HC_AUDIO_END_FRAME: 2.0}],
    )


def test_marked_payload_keeps_keyframe_video_and_audio_ref():
    pp = _load("patch_payload")

    class Holder:
        def __init__(self):
            self.cond = {"cond_video_latents": ["stock-overwrite"]}

    out = {"minimax_payload": Holder()}
    keyframes = [{"latent": "kf0", pp.HC_INDEX: 0}, {"latent": "kf1", pp.HC_INDEX: 5}]
    refs = [{"kind": "audio", "audio_latent": "audio", pp.HC_AUDIO_END_FRAME: 5.0}]
    result = pp._rewrite_marked_payload(out, keyframes, refs, frame_count=243)
    payload = result["minimax_payload"].cond
    assert payload["cond_video_latents"] == ["kf0", "kf1"]
    assert payload["cond_audio_latents"] == ["audio"]
    assert payload["frame_count"] == 243


def test_known_motion_context_patch_is_reported_as_conflict(monkeypatch):
    pl = _load("patch_layout")

    class FakeLayout:
        pass
    FakeLayout.__module__ = "comfy.ldm.minimax.model"

    def other_init(self, *args, **kwargs):
        pass
    other_init.__module__ = "foreign.patch_layout"
    setattr(other_init, "_h3_motion_context_layout_patch", True)
    FakeLayout.__init__ = other_init

    fake_mm = types.SimpleNamespace(PackedLayout=FakeLayout)
    monkeypatch.setattr(pl, "_import_mm", lambda: fake_mm)
    status, err = pl.get_layout_patch_status()
    assert err is None
    assert status.state == "foreign"
    assert status.owner == "ComfyUI-H3-Motion-Context"


def test_nodepack_import_file_has_no_startup_patch_install_calls():
    text = (ROOT / "__init__.py").read_text(encoding="utf-8")
    assert "install_layout_patch()" not in text
    assert "install_payload_patch()" not in text
    assert "from .nodes import NODE_CLASS_MAPPINGS" in text


def test_continuation_endpoint_is_marked_for_isolated_layout_patch():
    text = (ROOT / "nodes.py").read_text(encoding="utf-8")
    marker = 'HC_INDEX: frame_count - 1'
    assert marker in text
