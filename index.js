import {
  EditorState,
  Plugin,
  TextSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";
const { log } = console;

const SeekDirection = {
  Forwards: "fwd",
  Backwards: "back",
};

const getCursorAtWholeWord = ({
  direction = SeekDirection.Forwards,
  string = "",
  cursorStart = 0,
} = {}) => {
  let directionToInt = direction === SeekDirection.Backwards ? -1 : 1;
  let i =
    direction === SeekDirection.Backwards
      ? cursorStart
      : cursorStart - 1;
  while (string.substr(i, 1) !== " ") {
    if (direction === SeekDirection.Backwards && i <= 0) return 0;
    if (direction === SeekDirection.Forwards && i >= string.length)
      return string.length - 1;
    if (["\n", "\t", " "].includes(string.substr(i, 1))) {
      break;
    }
    i = i + directionToInt;
  }
  return i - directionToInt;
};

const modifySelection = (view) => {
  const state = view.state,
    selection = view.state.selection,
    doc = view.state.doc,
    from = view.state.selection.from,
    to = view.state.selection.to;
  if (selection.empty) return;
  const { newFrom, newTo } = {
    newFrom: getCursorAtWholeWord({
      direction: SeekDirection.Backwards,
      cursorStart: from - 1,
      string: doc.textContent,
    }),
    newTo: getCursorAtWholeWord({
      direction: SeekDirection.Forwards,
      cursorStart: to - 1,
      string: doc.textContent,
    }),
  };
  const newSelection = TextSelection.create(
    doc,
    newFrom + 1,
    newTo + 2
  );
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
