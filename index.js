/**
 * Allows for Server-side and build time rendering of tokenized strings, and CSS rules so we end up with similar markup
 * and CSS styles as CodeMirror generates on the clientside.
 */

// TODO: Make this TS
import fs from "fs";
import { highlightTree } from "@lezer/highlight";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { Decoration } from "@codemirror/view";
import { RangeSetBuilder, Text } from "@codemirror/state";

// Styles
import { defaultHighlightStyle } from "@codemirror/language";
const baseEditorStyles = fs.readFileSync("./base-theme.css"); //

export function renderString(
  code,
  highlightStyle = defaultHighlightStyle,
  theme,
  cfg = {}
) {
  var language = cfg.langProvider || javascriptLanguage; // js as default
  var tree = language.parser.parse(code);

  let markCache = {};

  let builder = new RangeSetBuilder();

  //
  highlightTree(tree, highlightStyle, (from, to, style) => {
    builder.add(
      from,
      to,
      markCache[style] || (markCache[style] = Decoration.mark({ class: style }))
    );
  });

  // just the decorations NOT the code itself
  let decorationRangeSet = builder.finish();

  // just the code content. MUST be array of lines
  var text = Text.of(code.split("\n"));

  var str = "";
  var pos = 0; // keep track of pos

  // loop through each line of code we need to tokenize
  for (var i = 1; i <= text.lines; i++) {
    var line = text.line(i);
    str += '<div class="cm-line">';

    // reset cursor position to beginning of current line
    pos = line.from;

    // iterate through the current line only
    var curs = decorationRangeSet.iter(line.from);
    // pos = line.from; // always start at beginning of the line

    //Q: Do we need to walk the cursor back to pos, or keep track of the tag that was started at the end of the last line?

    // as long as the iterator has a value, and we haven't reached the end of the current line, keep working
    while (curs.value && curs.from < line.to) {
      //if the next token is after the current position, add the non-tokenized text to the string
      if (curs.from > pos) {
        str += `${text.sliceString(pos, curs.from)}`;
        // str += t.slice(pos, curs.from).join("");
      }

      // get token value from the current cursorPos to end of token (BUT NOT to extend the end of the current line)
      let codeVal = text.sliceString(curs.from, Math.min(curs.to, line.to));

      str += `<${curs.value.tagName} class="${curs.value.class}">${codeVal}</${curs.value.tagName}>`;
      pos = curs.to;

      // pos = Math.min(curs.to, line.to); // don't set pos beyond end of current line
      curs.next();
    }

    // catch up to end of line
    str += `${text.sliceString(pos, line.to)}`;
    pos = line.to; // set pos to end of line...
    // Q: do we need to reset the cursor too?

    str += "</div>"; // closing cm-line div
  }

  var highlightStyles = extractCSSRulesFromThemeHighlightStyle(
    highlightStyle,
    theme
  );

  let gutterEl = "";
  let gutterClass = "";

  // assemble the gutter markup
  if (cfg.lineNumbers) {
    let gutterNumEl = "";

    for (let i = 0; i < text.lines; i++) {
      gutterNumEl += `<div class="cm-gutterElement">${i + 1}</div>`;
    }
    gutterEl = `<div class="cm-gutters">
    <div class="cm-gutter cm-lineNumbers">${gutterNumEl}</div>
    </div>`;

    gutterClass = "gutter";
  }

  return {
    css: highlightStyles,
    code: `<div class="cm-editor ${gutterClass} ${highlightStyles.scopeClassName}"><div class="cm-scroller">${gutterEl}<div class="cm-content">${str}</div></div></div>`,
    codeLinesOnly: str,
  };
}

// extracts the CSS style rules needed from the highlightStyle and theme passed in from the codeMirror theme
function extractCSSRulesFromThemeHighlightStyle(highlightStyle, theme = []) {
  const scopeClassName = theme[0]?.value || ""; // top level custom className for scoping added to `.cm-editor` wrapper el
  const rules = [];

  // loop through the theme rules (esp for editor. Things like editor bg color, gutter color etc...)
  for (let i = 1; i < theme.length; i++) {
    if (theme[i].value?.getRules?.()) {
      rules.push(theme[i].value.getRules());
    }
  }

  // add the highlighting rules, which is used for the tokenized code
  rules.push(highlightStyle.module.getRules());

  return {
    scopeClassName,
    highlightRules: rules,
    baseEditorStyles,
  };
}
