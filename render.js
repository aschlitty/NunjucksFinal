import { validateJsonPath, readJsonFile, renderHtml, createNewClient } from "./renderFuncs.mjs";
import { createRequire } from 'module'
import chalk from 'chalk';

const require = createRequire(
    import.meta.url);

const fs = require('fs-extra')
const prompts = require('prompts');
const chokidar = require('chokidar');

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

function getFileNames(path) {


  return fs.readdir(path, function (err, files) {
    //handling error
    if (err) return console.log('Unable to scan directory: ' + err);

    return files
  });
}

let clientChoices = []
let clientDirectories = getDirectories('clients/')

let jsonChoices = []

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

for (var i = 0; i < clientDirectories.length; i++) {
  let client = clientDirectories[i].toLowerCase()
  clientChoices.push(capitalize(client))
}

clientChoices.push('New client')

const clientSelectPrompt = [
  {
    type: 'list',
    name: 'client',
    message: 'Client name',
    choices: clientChoices
  }
]

const newClientPrompt = [
  {
    type: 'input',
    name: 'newClient',
    message: 'New client name',
    validate: function (input) {
      let blacklist = ['\\','\/','.','"','\'']

      if (input) {
        for (let item of blacklist) {
          if (input.includes(item)) {
            return `bad char: ${item} -- Please enter a valid name`
          } 
        }

        return true
      } else {
        return `Please enter a name`
      }
    }
  }
]

let clientSelection 
let customJson 

function allEvents(event, path){
  console.log(`${chalk.white(event)}: ${chalk.redBright(path)}`)
}

function changeEvents(clientName, customJsonName){
  let json = readJsonFile(clientName, customJsonName)
  renderHtml(clientName, json)
}

function startWatchers(clientName, customJsonName){
  const clientWatcher = chokidar.watch(`clients/${clientName}/input/`)
  const optionsWatcher = chokidar.watch(`clients/clientOptions.cjs`)
  const mockerWatcher = chokidar.watch(`clients/htmlmocker.njk`)
  clientWatcher
    .on('all', (event, path) => {allEvents(event, path)})
    .on('change', (event, path) => {changeEvents(clientName, customJsonName)})
  mockerWatcher
    .on('all', (event, path) => {allEvents(event, path)})
    .on('change', (event, path) => {changeEvents(clientName, customJsonName)})
}

var inquirer = require('inquirer');

inquirer
.prompt(clientSelectPrompt)
.then(answers => { 
  if (answers.client != 'New client') {
    jsonChoices = fs.readdirSync(`./clients/${answers.client}/input/Data`, function (err, files) {
      return files
    });
  }

  return answers 
})
.then((answers) => {
  let clientName = answers.client
  if (answers.client == 'New client') {
    // new client prompt
    inquirer
      .prompt(newClientPrompt)
      .then((answers) => {
        clientName = answers.newClient
        let clientFolder = `./clients/${clientName}`
        createNewClient(`${clientFolder}/input`, clientName)

        let json = readJsonFile(clientName)

        startWatchers(clientName, clientName)
        renderHtml(clientName, json)
      })
      .catch((error) => {
        console.log(error)
      })

  } else {
    const customJsonPrompt = [
      {
        type: 'list',
        name: 'json',
        message: 'JSON file name',
        choices: jsonChoices
      }
    ]

    // custom json prompt
    inquirer
      .prompt(customJsonPrompt)
      .then((answers) => {
        let customJsonName = answers.json
        if (!customJsonName || customJsonName == '') customJsonName = clientName
        if (customJsonName.includes('.json')) customJsonName = customJsonName.slice(0, -5)

        validateJsonPath(clientName, customJsonName)
        let json = readJsonFile(clientName, customJsonName)

        startWatchers(clientName, customJsonName)
        renderHtml(clientName, json)
      })
      .catch((error) => {
        console.log(error)
      })
  }
})
.catch((error) => {
  console.log(error)
});