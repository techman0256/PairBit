import {EditorState, StateField, StateEffect} from "@codemirror/state"
import { EditorView } from "codemirror";
import type { Tooltip } from "@codemirror/view";
import {showTooltip} from "@codemirror/view"

export type RemoteCursor = {
  clientID: number
  pos: number
  name?: string
  color?: string
}
export const setRemoteCursors = StateEffect.define<RemoteCursor[]>();
export const remoteCursorField = StateField.define<RemoteCursor[]>({
  create() {
    return [];
  },

  update(value, tr) {
    for (let e of tr.effects) {
      if (e.is(setRemoteCursors)) {
        return e.value;
      }
    }
    return value;
  }
});

export const getRemoteCursorTooltips = (
  state: EditorState
): readonly Tooltip[] => {
  const cursors = state.field(remoteCursorField, false);
  if (!cursors) return [];

  return cursors.map(cursor => {
    const line = state.doc.lineAt(cursor.pos);
    const text =
      (cursor.name ?? "User") +
      " @ " +
      line.number +
      ":" +
      (cursor.pos - line.from);

    return {
      pos: cursor.pos,
      above: true,
      strictSide: true,
      arrow: true,
      create: () => {
        const dom = document.createElement("div");
        dom.className = "cm-tooltip-cursor";
        dom.textContent = text;
        dom.style.backgroundColor = cursor.color ?? "#66b";
        return { dom };
      }
    };
  });
};

const remoteCursorTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return getRemoteCursorTooltips(state);
  },

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.effects.length) return tooltips;
    return getRemoteCursorTooltips(tr.state);
  },

  provide: f => showTooltip.computeN([f], state => state.field(f))
});

export const remoteCursorTooltip = () => [
  remoteCursorField,
  remoteCursorTooltipField,
  cursorTooltipBaseTheme
];

const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent"
    }
  }
})