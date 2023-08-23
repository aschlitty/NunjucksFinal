/**
 * @file Load the user interface to modify JSON
 * @author Colin Whelan
 */


let clientName = ''
const clientSelectElement = document.getElementById("clientSelect")
const jsdonEditorElement = document.getElementById('jsoneditor')
const saveDocumentElement = document.getElementById('saveDocument')
const loadDocumentElement = document.getElementById('loadDocument')

/**
 * Create array of all client schemas available
 */
let clients = []
for (client in clientOptions) {
  clients.push(client)
};

/**
 * Populate dropdown list with client names
 */
for(let i = 0; i < clients.length; i++) {
  let clientName = clients[i];
  let el = document.createElement("option")
  el.textContent = clientName
  el.value = clientName
  clientSelectElement.appendChild(el)
}

/**
 * select client options
 */
function setClientOptions(clientName) {
  return clientOptions[clientName]
}

/**
 * Default json
 */
let json = {
  'array': [{ 'field1': 'v1', 'field2': 'v2' }, 2, 3],
  'boolean': true,
  'null': null,
  'number': 123,
  'object': { 'a': 'b', 'c': 'd' },
  'string': 'Hello World'
}

/**
 * Create default JSONEditor UI
 */
let options = setClientOptions('sample')
let editor = new JSONEditor(jsdonEditorElement, options, json)

/**
 * Load selected client options on button click
 */
document.getElementById('loadClientOptions').onclick = function changeSelectedClient() {
  const tooltipTimeout_ms = 2000

  clientName = clientSelectElement.options[clientSelectElement.selectedIndex].text;
  document.getElementById("tooltip").style.display = "inline";
  setTimeout( function() {
      document.getElementById("tooltip").style.display = "none";
  }, tooltipTimeout_ms);

  options = setClientOptions(clientName.toLowerCase())

  editor.destroy()
  editor = new JSONEditor(jsdonEditorElement, options, json)
}

/**
 * Load file from the user's file system
 */
FileReaderJS.setupInput(loadDocumentElement, {
  readAsDefault: 'Text',
  on: {
    load: function (event, file) {
      editor.setText(event.target.result)

      if (editor.getMode() == 'tree') {
        editor.expandAll()
      }
    }
  }
})

/**
 * Prepate JSON for saving
 */
saveDocumentElement.onclick = function () {
  editor.setMode('code')
  let json = applyMarkdownToJson([editor.getText()].toString())
  saveJsonFile(json, clientName)
}

/**
 * Apply markdown to JSON
 *
 * link and image elements use custom HTML
 */
function applyMarkdownToJson(json){
  // Markdown Render Settings
  const renderer = {
    link(href, title, text) {
      return `<a href=\\"${href}\\" target=\\"_blank\\" style=\\"color: inherit; text-decoration: underline;\\">${text}</a>`;
    },
    image(href, title, text) {
      return `<img src=\\"${href}\\" width=\\"\\" border=\\"0\\" alt=\\"${text}\\" style=\\"display: block; border: 0;\\"/>`;
    }
  };

  marked.setOptions({
    mangle: false,
    // don't autolink URLs
    gfm: false,
  });

  marked.use({ renderer });

  let markedJSON = marked.parseInline(json)
  markedJSON = markedJSON.replaceAll('&quot;','\"')

  return markedJSON
}

/**
 * Save file to the user's file system
 */
function saveJsonFile(json, client){
  const blob = new Blob([json.toString()], {type: 'application/json;charset=utf-8'})
  saveAs(blob, client+'.json')
}