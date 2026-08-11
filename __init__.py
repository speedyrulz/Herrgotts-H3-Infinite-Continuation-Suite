"""Herrgotts H3 Infinite Continuation Suite for ComfyUI.

Importing the node pack only registers nodes and the small frontend extension.
The MiniMax H3 runtime hooks are installed lazily when a continuation node is
first executed, never during ComfyUI startup.
"""

WEB_DIRECTORY = "./web/js"

# ComfyUI loads this file as a package and therefore provides a non-empty
# __package__. Pytest may collect the hyphenated custom-node root as a top-level
# ``__init__`` module; keep that collection path side-effect free.
if __package__:
    from .nodes import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS
else:
    NODE_CLASS_MAPPINGS = {}
    NODE_DISPLAY_NAME_MAPPINGS = {}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
