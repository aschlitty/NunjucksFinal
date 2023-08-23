import { createRequire } from 'module'
import chalk from 'chalk';

const require = createRequire(
    import.meta.url);

const nunjucks = require('nunjucks')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const fs = require('fs-extra')
const http = require('http')
let server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'html'});
  res.write('hello');
  res.end();
});

server.listen(8080)

let filename
let clientFolder
let renderedHTML
let json
let jsonFile2

var env = nunjucks.configure({
  autoescape: false, 
  noCache: true
})

let dom
let document


export var validateJsonPath = function validateJsonPath(client, json) {
  let jsonPath

  clientFolder = `./clients/${client}`

  if (json) jsonPath = `${clientFolder}/input/data/${json}.json`
  else jsonPath = `${clientFolder}/input/data/${client}.json`

  if (!fs.existsSync(jsonPath)) {
    console.error(chalk.red(`json file does not exist: ${jsonPath}`))
    process.exit()
  }
}

export var createNewClient = function createNewClient(inputPath, clientName) {
    if (fs.existsSync(`./clients/${clientName}`)) throw Error(chalk.red(`Error: './clients/${clientName}' already exists - `))

    fs.copySync('./clients/sample/input', inputPath)

    fs.rename(`${inputPath}/Data/sample.json`, `${inputPath}/Data/${clientName}.json`)
    console.log(`New client folder created: clients/${clientName}`)
}

export var createFilename = function createFilename(client, i) {
    filename = `${client}_v${i+1}_output`
}

export var writeFile = function writeFile(html, client) {
    if (!fs.existsSync(clientFolder)) createFolder(clientFolder);
    if (!fs.existsSync(`${clientFolder}/output`)) createFolder(`${clientFolder}/output`);

    fs.writeFile(`${clientFolder}/output/${filename}.html`, html, (err) => {
        if (err) throw Error(chalk.red(`Error writing file(s) in ${clientFolder}/output/${filename}.html`))
    })
}

export var createFolder = function createFolder(folderName) {
  fs.mkdirSync(folderName);
}

export var readJsonFile = function readJsonFile(clientName, jsonName) {
  let jsonString

  if (!jsonName) { jsonName = clientName }

    jsonString = fs.readFileSync(`./clients/${clientName}/input/data/${jsonName}.json`, {encoding:'utf8'})
    jsonString = JSON.parse(jsonString)

  return jsonString
}

function setOptions(clientName){
  let clientOptions = require('./clients/clientOptions.cjs')

  return options.data[clientName]['scripts']
}

export var renderHtml = function renderHtml(clientName, jsonFile){
  clientFolder = `./clients/${clientName}`

  let options = require('./clients/clientOptions.cjs')

  let templateCount = 0
  let prerenderedHtml
  // let clientOptions = require('./clients/clientOptions.cjs')

  for (let i = 0; i < jsonFile.length; i++) {
    let clientScripts

    try {
      clientScripts = options.data[clientName]['scripts']
    }
    catch (error) {
     // no optional scripts found
    }

    // pre-render HTML with nunjucks
    prerenderedHtml = nunjucks.render(`${clientFolder}/input/template.njk`, jsonFile[i])

    //create DOM from HTML 
    dom = new JSDOM(prerenderedHtml, {
      pretendToBeVisual: true
    })
    document = dom.window.document

    // if post-process scripts exist, execute them
    if (clientScripts) {
      renderedHTML = postProcessScripts(document, clientScripts, jsonFile[i])
    } else{
      renderedHTML = prerenderedHtml
    }

    // remove empty lines from Nunjucks build
    renderedHTML = removeEmptyLines(renderedHTML)

    createFilename(clientName, i)
    writeFile(renderedHTML, clientName)
    templateCount++

    server.close();

    server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'html'});
      res.write(renderedHTML);
      res.end();
    })

    server.listen(8080) 

    let checkerOptions = {
      recursive: false,
      urlFilter: function(url) {
          return url.indexOf(urlToScrape) != -1;
      }
    }

    console.log('-------------------')
    console.log(chalk.white.bgMagenta.bold(`RESULTS:`))
    console.log(chalk.cyan.bold.underline(`Templates: ${templateCount}`))
    console.log('-------------------')  
    console.log('')   
    // checkLinks(document)     
  }
}

'use strict';
const linkCheck = require('link-check');

function checkLinks(document){

  var links = document.getElementsByTagName('a');
  var i;
  for (i = 0; i < links.length; ++i) {
    let link = links[i]
    let linkType = link.toString().split(':')[0]
    let linkValue = link.toString().split(':')[1]

    checkLink(link, linkType)    
  }

}  

let linkResults = []

function checkLink(link, linkType){
  let linkStatus

  switch (linkType){
    case 'http':
    case 'https':
    case 'mailto':
      showLinkStatus(link.toString())
      break
    case 'tel':
    default:
      console.log(chalk.grey(`Skipped: ${link}`));  
      break
  }

} 

function showLinkStatus(link){
  let status

  linkCheck(link, { 
    open_timeout: '4000ms',
    repsonse_timeout: '5000ms',
    headers: { 'user_agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0)'},
    retryCount : 0,
    // 999 is custom rejection for bots. still alive though
    aliveStatusCodes: [200,999] 
  }, function (err, result) {
    if (err) {
        console.error(err);
        return;
    }
    else{
      status = result.status
    }

    switch(status) {
      case 'dead':
        console.log(chalk.red(`${link} is ${status}`));  
        break
      case 'alive':
        console.log(chalk.green.dim(`${link} is ${status}`));  
        break
      default:
        console.log(`${link} is ${status}`);  
        break
    }
  });
}

function postProcessScripts(document, scripts, json){ 
  let templateType = json['templateType']

  if(!templateType) {
    throw Error(chalk.red(`'templateType' value is missing from json`))
  }

  for (var scriptNumber = 0; scriptNumber < scripts[templateType].length; scriptNumber++) {
    scripts[templateType][scriptNumber](document)
  }

  renderedHTML = document.getElementsByTagName('html')[0].outerHTML

  let doctype = document.doctype
  doctype = "<!DOCTYPE "
   + doctype.name
   + (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : '')
   + (!doctype.publicId && doctype.systemId ? ' SYSTEM' : '')
   + (doctype.systemId ? ' "' + doctype.systemId + '"' : '')
   + '>'
  renderedHTML = doctype + '\n' + renderedHTML
  renderedHTML = removeTBodys(renderedHTML)   

  return renderedHTML
}

function removeEmptyLines(html){
  const emptyLines = /^\s*$\n/gm;
  return html.replace(emptyLines, '')
}

function removeTBodys(html){
  const tbodyTags = /<tbody>|<\/tbody>/gm;
  return html.replace(tbodyTags, '')
}

// 88888888888 88 88
// 88          "" 88   ,d
// 88             88   88
// 88aaaaa     88 88 MM88MMM ,adPPYba, 8b,dPPYba, ,adPPYba,
// 88"""""     88 88   88   a8P_____88 88P'   "Y8 I8[    ""
// 88          88 88   88   8PP""""""" 88          `"Y8ba,
// 88          88 88   88,  "8b,   ,aa 88         aa    ]8I
// 88          88 88   "Y888 `"Ybbd8"' 88         `"YbbdP"'
// 
let date = new Date()
let months_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

env.addGlobal('_currentYear', date.getFullYear())
env.addGlobal('_currentMonth', date.getMonth()+1)
env.addGlobal('_currentMonthName', months_EN[date.getMonth()])

env.addFilter('is_string', isString);
env.addFilter('is_array', isArray);
env.addFilter('to_array', toArray);
env.addFilter('contains', contains);
env.addFilter('setAttribute', setAttribute);
env.addFilter('addAttributes', addAttributes);
env.addFilter('log', log);
env.addFilter('substring', substring);
env.addFilter('pluralize', pluralize);
env.addFilter('getUrlParam', getUrlParam);
env.addFilter('getNMonth', getNMonth);
env.addFilter('getNMonthName', getNMonthName);

function isString(obj) {
    return Object.prototype.toString.call(obj) == '[object String]';
}

function isArray(obj) {
    return Array.isArray(obj);
}

function toArray(obj) {
    if( isArray(obj) ) return obj;
    var array = [obj];
    return array;
}

function contains(string, substring) {
  return string.includes(substring)
}

function setAttribute(dictionary, key, value) {
  dictionary[key] = value;
  return dictionary;
}

function addAttributes(dictionary, key, value) {
  if (isString(value)){
      value = JSON.parse(value);
  }
  if( !(!!dictionary[key]) ) { //Key not in dict yet, set key=value
      dictionary[key] = value;
  } else { //Key in dict, add to existing
      for (const additionalKey in value) {
          dictionary[key][additionalKey] = value[additionalKey];
      }
  }
  return dictionary;
}

function log(value) {
  console.log(chalk.bgGreen.whiteBright(`log: ${value}`))
}

function substring(string, start, end) {
  // if one arg is missing, start is 0, and end is the value passed
  if (arguments.length == 2) {
    end = start
    start = 0
  }

  return string.substring(start, end)
}

function pluralize(value, singular, plural) {
  switch(arguments.length) {
    // If only 1 user arg is passed, it's assumed that the arg is for plural and singular is blank 
    case 2:
      plural = singular+'s'
      break
    default:
      break
  }

  switch(value > 1) {
    case true:
      return plural
      break
    case false:
      return singular
      break
  }
}

function getUrlParam(url, param) {
  // if one arg is missing, start is 0, and end is the value passed
  let urlParams = new URLSearchParams(url)

  return urlParams.get(param)
}

function getNMonth(thisDate, n) {
  if(isNaN(n)) {    
    console.log(chalk.bgRed.whiteBright(`"${n}" not valid. Must be a number.`))
    return
  }
  if(n < 1){
    n = n + 12
  }
  if(thisDate == '' || !thisDate){
    thisDate = date
  } else {
    thisDate = new Date(thisDate)
  }
  let nMonth = ((thisDate.getMonth()) + n)%12

  return nMonth + 1
}

function getNMonthName(thisDate, n) {
  let monthName = months_EN[getNMonth(thisDate, n-1)]

  return monthName
}

export const exportedForTesting = {
  removeEmptyLines,
  removeTBodys,
  isString,
  isArray,
  toArray,
  contains,
  setAttribute,
  addAttributes,
  substring,
  pluralize,
  getUrlParam,
  getNMonth,
  getNMonthName
}