// renders a dead-simple server and server-rendered html to manually verify everything is working
import http from 'http';
import fs from 'fs';

import {oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark'
import {renderString} from "../index.js";





var host = '0.0.0.0'
var port = 8000

var server = http.createServer((request, response) => {
  response.writeHead(200, {"Content-Type": "text/html"});
  // response.write("Hello World!");

  let html = generateHTMLSnippet()

  response.write(html);
  
  response.end();
});


function generateHTMLSnippet() {
  var code = `function add(a,b){
  return a+b;
} 
// amazing comment! This is really the most amazing comment evar!

function sub(a,b){
  return a-b;
} 
// another amazing comment! This is really the most amazing comment evar!
`;
  
  var result = renderString(code, oneDarkHighlightStyle, oneDarkTheme, {lineNumbers: true});
  // console.log('result', result);

  // base css I've stolen from codeMirror needed for basic styles to look good
  const baseEditorCSS = fs.readFileSync('./base-theme.css');
  

  const html = `
    <head>
      <style>${baseEditorCSS}</style>
      <style>${result.css.highlightRules.join('\n')}</style>
    </head>

    <body>
      ${result.code}
  </body>
  `

  return html;
}

server.listen(port,host, (error) => {  
  if (error) {
    return console.log('Error occured : ', error );
  }

  console.log('server is listening on ' + host + ':'+ port);
});	
