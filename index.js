import {
  EditorState,
  Plugin,
  TextSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";
const { log } = console;

const separators = [" ", ".", ",", "\n", "\t", "\r\n"];

const getTextBetween = ({ doc, from, to }) => {
  return doc.textBetween(from, to, "\n");
};

const getFromCursor = ({ doc, initFrom, initTo }) => {
  let done = false;
  let cursor = initFrom;
  while (!done) {
    let text = getTextBetween({
      doc,
      from: cursor,
      to: initTo,
    });
    if (separators.includes(text[0])) {
      done = true;
      return cursor + 1;
    }
    cursor--;
  }
};

const getToCursor = ({ doc, initFrom, initTo }) => {
  let done = false;
  let cursor = initTo;
  while (!done) {
    let text = getTextBetween({
      doc,
      from: initFrom,
      to: cursor,
    });
    if (separators.includes(text[text.length - 1])) {
      done = true;
      return cursor - 1;
    }
    cursor++;
  }
};

const modifySelection = (view) => {
  const state = view.state,
    selection = view.state.selection,
    from = view.state.selection.from,
    to = view.state.selection.to,
    doc = view.state.doc;
  if (selection.empty) return;
  const fromCursor = getFromCursor({
    doc,
    initFrom: from,
    initTo: to,
  });
  const toCursor = getToCursor({
    doc,
    initFrom: from,
    initTo: to,
  });
  let newSelection = TextSelection.create(doc, fromCursor, toCursor);
  const newSelectionTrax = state.tr.setSelection(newSelection);
  view.updateState(state.apply(newSelectionTrax));
};

const wholeWordSelectionPlugin = new Plugin({
  props: {
    handleDOMEvents: {
      mouseup: (view) => {
        modifySelection(view);
        return true;
      },
      keyup: (view, event) => {
        if (
          event.shiftKey &&
          [37, 38, 39, 40].includes(event.keyCode)
        ) {
          modifySelection(view);
        }
        return true;
      },
    },
  },
});

const editorView = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    schema,
    plugins: [].concat(
      exampleSetup({ schema }),
      wholeWordSelectionPlugin
    ),
  }),
});
