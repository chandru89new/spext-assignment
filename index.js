import {
  EditorState,
  Plugin,
  TextSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";
// const { log } = console;

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

const wholeWordSelectionPlugin = new Plugin({
  props: {
    createSelectionBetween: (view_, anchor, head) => {
      if (anchor.pos === head.pos) return;
      const doc = view_.state.doc;
      const start = anchor.pos > head.pos ? head.pos : anchor.pos;
      const end = anchor.pos > head.pos ? anchor.pos : head.pos;
      const plainText = document.querySelector(
        "#editor .ProseMirror"
      ).innerText;
      const { newStart, newEnd } = {
        newStart: getCursorAtWholeWord({
          direction: SeekDirection.Backwards,
          cursorStart: start - 1,
          string: plainText,
        }),
        newEnd: getCursorAtWholeWord({
          direction: SeekDirection.Forwards,
          cursorStart: end - 1,
          string: plainText,
        }),
      };
      // log(start, end, newStart, newEnd);
      return TextSelection.create(doc, newStart + 1, newEnd + 2);
    },
  },
});

const editorView = new EditorView(document.querySelector("#editor"), {
  // dispatchTransaction: (tr) => {
  //   const { selection } = tr;
  //   if (!selection.empty) {
  //     const { from, to } = selection;
  //     const plainText = document.querySelector(
  //       "#editor .ProseMirror"
  //     ).innerText;
  //     const newBackwardCursor = getCursorAtWholeWord({
  //       direction: SeekDirection.Backwards,
  //       string: plainText,
  //       cursorStart: from - 1,
  //     });
  //     const newFwdCursor = getCursorAtWholeWord({
  //       direction: SeekDirection.Forwards,
  //       string: plainText,
  //       cursorStart: to - 1,
  //     });
  //     console.log({ from, to, newFwdCursor, newBackwardCursor });
  //     tr.setSelection(
  //       TextSelection.create(
  //         tr.doc,
  //         newBackwardCursor + 1,
  //         newFwdCursor + 2
  //       )
  //     );
  //   }
  //   editorView.updateState(editorView.state.apply(tr));
  // },
  state: EditorState.create({
    schema,
    plugins: [].concat(
      exampleSetup({ schema }),
      wholeWordSelectionPlugin
    ),
  }),
});
