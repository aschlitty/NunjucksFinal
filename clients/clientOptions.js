let options = {};
  
let perfectSchema =
{
  "title": "perfectSchema",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "lang": { 
          "type": "string",
          "default": "en",
          "enum": ["en","fr"]
        },
        "emailName": { "$ref": "#/definitions/simple-string" },
        "modules": { "$ref": "#/definitions/simple-string" }
      },
      "required": [
        "lang",
        "emailName",
        "modules"
      ]
    }
  ],
  "definitions": {
    "simple-string": {
        "type": "string"
    }
  }
}

options.perfect = {
  schema: perfectSchema,
  mode: 'code',
  modes: ['code', 'tree'], // allowed modes
  onError: function (err) {
    alert(err.toString())
  },
  onModeChange: function (newMode, oldMode) {
    console.log('Mode switched from', oldMode, 'to', newMode)
  },
  onEditable: function (node) {
    switch (node.field) {

      case 'lang':
        return {
          field: false,
          value: true
        }

      default:
        return true
    }
  },
  templates: [
    {
      text: 'perfectBlock',
      title: 'Test Block',
      field: '',
      value: {
        'name': '',
        'title': 'Title',
        'copy': 'Copy',
        'imageName': '',
        'imageAlt': '',
        'buttonName': '',
        'buttonAlt': '',
        'link': 'href',
      }
    },
  ],
  scripts: {
    perfect:[_addRolePresentation]
  }
}  

let sampleSchema =
{
  "title": "sampleSchema",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "lang": { 
          "type": "string",
          "default": "en",
          "enum": ["en","fr"]
        },
        "emailName": { "$ref": "#/definitions/simple-string" },
        "modules": { "$ref": "#/definitions/simple-string" }
      },
      "required": [
        "lang",
        "emailName",
        "modules"
      ]
    }
  ],
  "definitions": {
    "simple-string": {
        "type": "string"
    }
  }
}

options.sample = {
  schema: sampleSchema,
  mode: 'tree',
  modes: ['code', 'tree'], // allowed modes
  onError: function (err) {
    alert(err.toString())
  },
  onModeChange: function (newMode, oldMode) {
    console.log('Mode switched from', oldMode, 'to', newMode)
  },
  onEditable: function (node) {
    switch (node.field) {

      case 'lang':
        return {
          field: false,
          value: true
        }

      default:
        return true
    }
  },
  templates: [
    {
      text: 'perfectBlock',
      title: 'Test Block',
      field: '',
      value: {
        'name': '',
        'title': 'Title',
        'copy': 'Copy',
        'imageName': '',
        'imageAlt': '',
        'buttonName': '',
        'buttonAlt': '',
        'link': 'href',
      }
    },
  ],
  scripts: {
    perfect:[]
  }
}


function _addRolePresentation(document){
  let tableElements = document.getElementsByTagName('table')

  for (let i = 0; i < tableElements.length; i++) {
    if (tableElements[i].getAttribute('trole') != 'hello') {
      tableElements[i].setAttribute('role', 'testy')
    }
  }
}

exports.data = options
