
import { htmlLanguage } from '@codemirror/lang-html';
import {oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark'
import {renderString} from "./index.js";


import {EditorView} from "@codemirror/view"

// This again produces an extension value
let myBaseTheme = EditorView.theme({
  ".dark .cm-mySelector": { background: "dimgrey" },
  ".light .cm-mySelector": { background: "ghostwhite" }
})



console.log('baseTheme', EditorView.baseTheme);
console.log('baseTheme', EditorView.baseTheme.value);

console.log('#@EditorView', EditorView.theme());
console.log('@EditorView.baseTheme', EditorView.baseTheme());

// console.log(myBaseTheme)
// we can get the added ones. But where are the DEFAULT theme?
// console.log('####baseTheme', myBaseTheme[1].value?.getRules?.());


// test string render
function test1() {
  var code = `function add(a,b){
  return a+b;
} 
// amazing comment!`;

let result = renderString(code, oneDarkHighlightStyle, oneDarkTheme);
console.log('result', result);

  const html = `
    <head>
      <style>${result.css.highlightRules.join('\n')}</style>
    </head>

    <body>
      ${result.code}
  </body>
  `

  console.log('html:js', html);
  
}

function test2() {
  var code = `function add(a,b){
  return a+b;
} 
// amazing comment!`;

let result = renderString(code);
console.log('result', result);

  const html = `
    <head>
      <style>${result.css.highlightRules.join('\n')}</style>
    </head>

    <body>
      ${result.code}
  </body>
  `

  console.log('##default-html:js', html);
  
}



function testAnotherLanguage() {
  var code = `<!DOCTYPE html>

  <body>
    <style>
     .red {color: red;}
    </style>
  </body>
`;

let result = renderString(`alert("hello")`, oneDarkHighlightStyle, oneDarkTheme, {langProvider: htmlLanguage});
console.log('result', result);

  const html = `
    <head>
      <style>${result.css.baseEditorStyles}</style>
      <style>${result.css.highlightRules.join('\n')}</style>
    </head>

    <body>
      ${result.code}
  </body>
  `

  console.log('html:html', html);


  

}

test1();
test2();
testAnotherLanguage();


// FIXME: add a comparison test
// // comparison. DOM rendered
// import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
// var extensions = [basicSetup, EditorView.editable.of(false), javascript()];

// let view = new EditorView({
//     state: EditorState.create({
//       doc: code,  
//       extensions,
//       readOnly: true, 
//       theme:
//       {
//         "&": { height: "300px" },
//         ".cm-scroller": { overflow: "auto" }
//       }
//     })
//   })

//   document.getElementById('expected').appendChild(view.dom);