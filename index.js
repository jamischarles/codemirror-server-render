// TODO: Figure out theming

// render CSS
// render string
// 1-2 basic examples
// able to change the theme...

import fs from 'fs';
import {highlightTree} from '@lezer/highlight'
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { Decoration } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/rangeset';
import { Text } from '@codemirror/text';

// Styles
import { defaultHighlightStyle } from '@codemirror/language';


const baseEditorStyles = fs.readFileSync('./base-theme.css'); 

export function renderString(code, highlightStyle=defaultHighlightStyle, theme, cfg = {}) {
  var language = cfg.langProvider || javascriptLanguage; // js as default
  var tree = language.parser.parse(code);

  let markCache = {};

  let builder = new RangeSetBuilder();


  console.log('highlightStyle', highlightStyle);
  highlightTree(tree, highlightStyle, (from, to, style) => {
    // console.log('style', style);
    builder.add(
      from,
      to,
      markCache[style] || (markCache[style] = Decoration.mark({ class: style }))
    );
  });

  console.log('markCache', markCache);
  // just the decorations NOT the code itself
  let decorationRangeSet = builder.finish();


  console.log('>>decorationRangeSet', decorationRangeSet);

  // console.log('curs', curs);
  // console.log('curs::', curs.layer.chunk[0]);
  // console.log('curs::', curs.layer.chunk[0].value[0].spec);
  // console.log('curs.next()', curs.next());

  // just the code content. MUST be array of lines
  var text = Text.of(code.split('\n'));
  var spans = decorationRangeSet.spans;





  // TODO: get it working, then ask why the sliceOf doesn't work... bytes?
  // look at source or step through source...


  // console.log('curs.next();', curs.next());

  // now we need to mash the 2 together...

  // TODO: just get each line and work with that...

  var str = '';
  var pos = 0; // keep track of pos

  for (var i = 1; i <= text.lines; i++) {
    // catch up to the next line


    // FIXME: add logic for empty line (try empty string)

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
      debugger;
      // console.log('###INSIDE');
      // console.log('typeof curs.value', curs.value);
      // console.log('typeof curs.value', typeof curs.value);
      // console.log('typeof curs.value.from', typeof curs.value.from);

      //if the next token is after the current position, add the non-tokenized text to the string
      if (curs.from > pos) {
        // console.log('text.sliceString(pos, curs.from)', text.sliceString(pos, curs.from));
        str += `${text.sliceString(pos, curs.from)}`;
        // str += t.slice(pos, curs.from).join("");
      }

      // get token value from the current cursorPos to end of token (BUT NOT to extend the end of the current line)
      let codeVal = text.sliceString(curs.from, Math.min(curs.to, line.to));
      // let codeVal = t.slice(curs.from, curs.to);
      console.log('codeVal', codeVal);
      console.log('typeof codeVal', typeof codeVal);
      // if (codeVal === "") codeVal = undefined;
      str += `<${curs.value.tagName} class="${curs.value.class}">${codeVal}</${curs.value.tagName}>`;
      pos = curs.to;
      // curs.from.forEach((fromNum, i) => {
      // 	let from = fromNum;
      // 	let to = curs.to[i];
      // });

      // pos = Math.min(curs.to, line.to); // don't set pos beyond end of current line
      curs.next();


    }
    console.log('text.sliceString(pos, line.to)', text.sliceString(pos, line.to));

    // catch up to end of line
    str += `${text.sliceString(pos, line.to)}`;
    pos = line.to; // set pos to end of line...
    // Q: do we need to reset the cursor too?
    
    // FIXME: add space here for empty lines...
    // FIXME: only do this on empty lines...
    // maybe keep a buffer?
    str += " </div>"; // closing cm-line div
  }


  // TODO: get classNames that are being used... Does it matter? For the CSS string? Or do those pieces need to talk?
  var cssForCode = extractCSSRulesFromThemeHighlightStyle(highlightStyle, theme);


  let gutterEl = '';
  let gutterClass = '';

  // assemble the gutter markup
  if (cfg.lineNumbers) {
    let gutterNumEl = '';
    
    for (let i=0; i<text.lines; i++) {
      gutterNumEl += `<div class="cm-gutterElement">${i+1}</div>`
    }
    gutterEl = `<div class="cm-gutters">
    <div class="cm-gutter cm-lineNumbers">${gutterNumEl}</div>
    </div>`

    gutterClass = 'gutter';
  }

  return {
    css: cssForCode,
    code: `<div class="cm-editor ${gutterClass} ${cssForCode.scopeClassName}"><div class="cm-scroller">${gutterEl}<div class="cm-content">${str}</div></div></div>`,
    codeLinesOnly: str
  }
}


// FIXME: Add comments
function extractCSSRulesFromThemeHighlightStyle(highlightStyle, theme = []) {
  const scopeClassName = theme[0]?.value || '';
  const rules = [];
  
  for(let i=1; i<theme.length; i++) {
    if (theme[i].value?.getRules?.()) {
      rules.push(theme[i].value.getRules()); 
    }
  }


  rules.push(highlightStyle.module.getRules());
  
  return {
    scopeClassName,
    highlightRules: rules,
    baseEditorStyles
  }
}