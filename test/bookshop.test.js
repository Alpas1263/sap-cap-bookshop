import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const port = 4005
const baseUrl = `http://127.0.0.1:${port}`
let server

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/`)
      if (response.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('CAP test server did not start in time')
}

async function json(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json()
  return { response, body }
}

before(async () => {
  server = spawn(process.execPath, ['node_modules/@sap/cds/bin/serve.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  await waitForServer()
})

after(async () => {
  if (server && !server.killed) {
    server.kill()
    await Promise.race([once(server, 'exit'), new Promise(resolve => setTimeout(resolve, 2000))])
  }
})

test('catalog exposes books with flattened author and genre', async () => {
  const { response, body } = await json('/browse/Books?$select=ID,title,author,genre,stock&$orderby=ID')
  assert.equal(response.status, 200)
  assert.equal(body.value.length, 5)
  assert.deepEqual(body.value[0], {
    ID: 201,
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    genre: 'Drama',
    stock: 12
  })
  assert.equal(body.value[2].title, 'The Raven -- 11% discount!')
  assert.equal(body.value[3].title, 'Eleonora -- 11% discount!')
})

test('admin service expands the author-books relationship', async () => {
  const { response, body } = await json('/admin/Authors?$select=ID,name&$expand=books($select=ID,title)&$filter=ID%20eq%20150')
  assert.equal(response.status, 200)
  assert.equal(body.value[0].name, 'Edgar Allan Poe')
  assert.equal(body.value[0].books.length, 2)
})

test('submitOrder reduces stock and validates requests', async () => {
  const headers = {
    'content-type': 'application/json',
    authorization: `Basic ${Buffer.from('bob:').toString('base64')}`
  }
  const order = await json('/browse/submitOrder', {
    method: 'POST', headers, body: JSON.stringify({ book: 201, quantity: 2 })
  })
  assert.equal(order.response.status, 200)
  assert.equal(order.body.value, 10)

  const invalid = await json('/browse/submitOrder', {
    method: 'POST', headers, body: JSON.stringify({ book: 201, quantity: 0 })
  })
  assert.equal(invalid.response.status, 400)

  const insufficient = await json('/browse/submitOrder', {
    method: 'POST', headers, body: JSON.stringify({ book: 207, quantity: 99 })
  })
  assert.equal(insufficient.response.status, 409)

  const missing = await json('/browse/submitOrder', {
    method: 'POST', headers, body: JSON.stringify({ book: 999, quantity: 1 })
  })
  assert.equal(missing.response.status, 404)
})

test('admin constraints reject invalid book data', async () => {
  const headers = { 'content-type': 'application/json' }

  const missingTitle = await json('/admin/Books', {
    method: 'POST', headers, body: JSON.stringify({
      ID: 301, author_ID: 101, genre_ID: 11, stock: 1, price: 10, currency_code: 'EUR'
    })
  })
  assert.equal(missingTitle.response.status, 400)

  const invalidRelations = await json('/admin/Books', {
    method: 'POST', headers, body: JSON.stringify({
      ID: 302, title: 'Invalid relations', author_ID: 999, genre_ID: 999,
      stock: 1, price: 10, currency_code: 'EUR'
    })
  })
  assert.equal(invalidRelations.response.status, 400)

  const invalidRanges = await json('/admin/Books', {
    method: 'POST', headers, body: JSON.stringify({
      ID: 303, title: 'Invalid ranges', author_ID: 101, genre_ID: 11,
      stock: 0, price: 112, currency_code: 'EUR'
    })
  })
  assert.equal(invalidRanges.response.status, 400)
})
