import { app } from "../../scripts/app.js";

const TARGET_CLASS = "H3ContinuousAnalyzeHandoverV11";
// context_frames is live in EVERY preset (presets do not override it and it
// must match the Continue node), so it stays visible alongside the preset.
const ALWAYS_VISIBLE = new Set(["preset", "context_frames"]);

function targetNames(node) {
    return new Set([
        node?.type,
        node?.comfyClass,
        node?.constructor?.type,
        node?.constructor?.comfyClass,
        node?.constructor?.ComfyClass,
        node?.constructor?.nodeData?.name,
    ].filter(Boolean));
}

function isTarget(node) {
    return targetNames(node).has(TARGET_CLASS);
}

function isTargetDefinition(nodeType, nodeData) {
    return [
        nodeData?.name,
        nodeType?.type,
        nodeType?.comfyClass,
        nodeType?.ComfyClass,
        nodeType?.nodeData?.name,
    ].filter(Boolean).includes(TARGET_CLASS);
}

function findWidget(node, name) {
    return node?.widgets?.find((widget) => widget?.name === name);
}

function refreshNodeLayout(node) {
    node.setDirtyCanvas?.(true, true);
    node.graph?.setDirtyCanvas?.(true, true);

    // Canvas/LiteGraph needs an explicit height refresh. Nodes 2.0 uses the
    // DOM/ResizeObserver as source of truth, so defer the resize and only apply
    // it if computeSize returns a sane value.
    requestAnimationFrame?.(() => {
        try {
            if (typeof node.computeSize !== "function" || typeof node.setSize !== "function") return;
            const computed = node.computeSize();
            if (!Array.isArray(computed) || !Number.isFinite(computed[1])) return;
            const currentWidth = Array.isArray(node.size) && Number.isFinite(node.size[0])
                ? node.size[0]
                : computed[0];
            node.setSize([Math.max(currentWidth, computed[0]), computed[1]]);
        } catch (_) {
            // Visibility itself is more important than compact resizing. The
            // frontend will normally recalculate layout on its next pass.
        }
    });
}

function setPresetVisibility(node) {
    if (!isTarget(node) || !Array.isArray(node.widgets)) return;

    const preset = findWidget(node, "preset");
    if (!preset) return;

    const showCustom = String(preset.value ?? "Balanced").trim().toLowerCase() === "custom";
    const previousShowCustom = node.__herrgottsPresetShowCustom;
    node.__herrgottsPresetShowCustom = showCustom;

    // Use both current ComfyUI mechanisms deliberately:
    // 1) `advanced` + `node.showAdvanced` is the native Advanced Parameters UI.
    // 2) `hidden` makes the preset rule authoritative even if the user toggles
    //    Show Advanced manually, and is respected by current LiteGraph layout.
    node.showAdvanced = showCustom;

    for (const widget of node.widgets) {
        if (!widget?.name || ALWAYS_VISIBLE.has(widget.name)) {
            if (widget) widget.hidden = false;
            continue;
        }
        widget.advanced = true;
        widget.hidden = !showCustom;
    }

    // Resize only when visibility actually changed. The handlers re-run this on
    // every load/configure pass, and an unconditional height snap would discard
    // the node size saved in the workflow. An initial all-visible (Custom) pass
    // hides nothing, so it needs no resize either.
    const isTransition = previousShowCustom !== showCustom
        && !(previousShowCustom === undefined && showCustom);
    if (isTransition) {
        refreshNodeLayout(node);
    }
}

function installPresetCallback(node) {
    if (!isTarget(node)) return;
    const preset = findWidget(node, "preset");
    if (!preset) return;

    if (!node.__herrgottsPresetVisibilityInstalled) {
        node.__herrgottsPresetVisibilityInstalled = true;
        const originalCallback = preset.callback;
        preset.callback = function (...args) {
            const result = originalCallback?.apply(this, args);
            // Run after the widget value/store has settled. This is useful for
            // both Canvas nodes and the Vue/Nodes 2.0 widget bridge.
            queueMicrotask(() => setPresetVisibility(node));
            return result;
        };
    }

    setPresetVisibility(node);
}

app.registerExtension({
    name: "Herrgotts.H3Infinite.AutoHandoverPresetVisibility.v120",

    // beforeRegisterNodeDef gives us a second reliable targeting path on newer
    // ComfyUI frontends where instance `comfyClass` may not be populated in the
    // same way as classic Canvas nodes.
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (!isTargetDefinition(nodeType, nodeData)) return;

        const originalOnConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function (...args) {
            const result = originalOnConfigure?.apply(this, args);
            queueMicrotask(() => installPresetCallback(this));
            return result;
        };

        // Some frontend renderers route combo changes through onWidgetChanged
        // rather than the LiteGraph widget callback. Keep the patch isolated to
        // this one node type and react only to the preset widget.
        const originalOnWidgetChanged = nodeType.prototype.onWidgetChanged;
        nodeType.prototype.onWidgetChanged = function (name, value, oldValue, widget) {
            const result = originalOnWidgetChanged?.apply(this, arguments);
            const widgetName = widget?.name ?? name;
            if (widgetName === "preset") {
                queueMicrotask(() => setPresetVisibility(this));
            }
            return result;
        };
    },

    async nodeCreated(node) {
        if (!isTarget(node)) return;
        queueMicrotask(() => installPresetCallback(node));
    },

    loadedGraphNode(node) {
        if (!isTarget(node)) return;
        queueMicrotask(() => installPresetCallback(node));
    },

    async afterConfigureGraph() {
        for (const node of app.graph?._nodes ?? []) {
            if (isTarget(node)) installPresetCallback(node);
        }
    },
});
