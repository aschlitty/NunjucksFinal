import * as renderFuncs from "./renderFuncs.mjs";
import { createRequire } from 'module'
const require = createRequire(import.meta.url);

const assert = require('assert')

const programTests = require('baretest')('Program tests')
const filterTests = require('baretest')('Nunjucks filter tests')

// isString
filterTests(`'string' is a string`, async function() {
    assert.equal(renderFuncs.exportedForTesting.isString('string'), true)
})
filterTests(`['string'] is not a string`, async function() {
    assert.equal(renderFuncs.exportedForTesting.isString(['string']), false)
})

// isArray
filterTests(`['array'] is an array`, async function() {
    assert.equal(renderFuncs.exportedForTesting.isArray(['array']), true)
})
filterTests(`'array' is not an array`, async function() {
    assert.equal(renderFuncs.exportedForTesting.isArray('array'), false)
})

// substring
filterTests(`first 3 chars of 'hello world' are 'hel'`, async function() {
    assert.equal(renderFuncs.exportedForTesting.substring('hello world',0,3), 'hel')
})
// add test using length value for end of string

// contains
filterTests(`'hello world' contains 'wor'`, async function() {
    assert.equal(renderFuncs.exportedForTesting.contains('hello world','wor'), true)
})
filterTests(`'hello world' does not contain 'tool'`, async function() {
    assert.equal(renderFuncs.exportedForTesting.contains('hello world','tool'), false)
})

// pluralize
filterTests(`'dog' auto pluralized is 'dogs'`, async function() {
    assert.equal(renderFuncs.exportedForTesting.pluralize(5, 'dog'), 'dogs')
})
filterTests(`1 'dog' is not pluralized`, async function() {
    assert.equal(renderFuncs.exportedForTesting.pluralize(1, 'dog'), 'dog')
})
filterTests(`'dog' custom pluralized is 'doggos'`, async function() {
    assert.equal(renderFuncs.exportedForTesting.pluralize(2, 'dog','doggos'), 'doggos')
})

// getUrlParam
filterTests(`'age' param value is 18 in URL`, async function() {
    assert.equal(renderFuncs.exportedForTesting.getUrlParam('https://example.com/?name=Jonathan&age=18','age'), 18)
})
filterTests(`'test' param is not in URL`, async function() {
    assert.equal(renderFuncs.exportedForTesting.getUrlParam('https://example.com/?name=Jonathan&age=18','test'), null)
})

// remove empty lines
filterTests(`empty lines removed`, async function() {
    assert.equal(renderFuncs.exportedForTesting.removeEmptyLines(`hello \n\nWorld`), `hello \nWorld`)
})

// remove <tbody> tags
filterTests(`tbody tags removed`, async function() {
    assert.equal(renderFuncs.exportedForTesting.removeTBodys('<table border="0" cellpadding="0" cellspacing="0" width="100%" style="" role="presentation"> <tbody> <tr> <td align="" style=""> </td> </tr> </tbody> </table>'), '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="" role="presentation">  <tr> <td align="" style=""> </td> </tr>  </table>')
})

// toArray
filterTests('very simple toArray', async function() {
    assert.deepEqual(renderFuncs.exportedForTesting.toArray('x'), ['x'])
})
filterTests('simple toArray', async function() {
    assert.deepEqual(renderFuncs.exportedForTesting.toArray({x:'y', a: 'b'}), [{x:'y', a: 'b'}])
})

filterTests.skip('troublesome', async function() {
})

programTests.run()
filterTests.run()
