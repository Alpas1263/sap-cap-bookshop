const BOOKS_URL = '/admin/Books'
const GENRES_URL = '/admin/Genres'
const AUTHORS_URL = '/admin/Authors'
const CURRENCIES_URL = '/admin/Currencies'
const body = document.querySelector('#books-body')
const message = document.querySelector('#message')
const dialog = document.querySelector('#book-dialog')
const form = document.querySelector('#book-form')
const dialogTitle = document.querySelector('#dialog-title')
const idInput = document.querySelector('#book-id')
const titleInput = document.querySelector('#book-title')
const descrInput = document.querySelector('#book-descr')
const stockInput = document.querySelector('#book-stock')
const priceInput = document.querySelector('#book-price')
const genreInput = document.querySelector('#book-genre')
const authorInput = document.querySelector('#book-author')
const currencyInput = document.querySelector('#book-currency')
const relationFields = document.querySelector('#relation-fields')
const saveButton = document.querySelector('#save-book')
let books = []
let editingId = null

function showMessage(text, type = 'success') {
  message.textContent = text
  message.className = `message ${type}`
  message.hidden = false
}
function clearMessage() { message.hidden = true; message.textContent = '' }

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { Accept: 'application/json', ...options.headers } })
  if (!response.ok) {
    let detail = ''
    try {
      const payload = await response.json()
      detail = typeof payload.error?.message === 'string' ? payload.error.message : payload.error?.message?.value
    } catch { /* Yanıt JSON değilse genel hata gösterilir. */ }
    throw new Error(detail || `Sunucu ${response.status} koduyla yanıt verdi.`)
  }
  if (response.status === 204) return null
  return response.json()
}

function actionButton(label, className, action, id) {
  const button = document.createElement('button')
  button.type = 'button'; button.className = `button small ${className}`
  button.dataset.action = action; button.dataset.id = String(id); button.textContent = label
  return button
}

function renderBooks() {
  body.replaceChildren()
  if (!books.length) {
    const cell = body.insertRow().insertCell(); cell.colSpan = 8; cell.className = 'state-cell'; cell.textContent = 'Henüz kitap kaydı bulunmuyor.'
    return
  }
  const formatPrice = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  for (const book of books) {
    const row = body.insertRow()
    row.insertCell().textContent = book.ID
    const titleCell = row.insertCell(); titleCell.className = 'title-cell'; titleCell.textContent = book.title ?? '—'
    row.insertCell().textContent = book.author?.name ?? '—'
    row.insertCell().textContent = book.genre?.name ?? '—'
    row.insertCell().textContent = book.stock ?? '—'
    row.insertCell().textContent = book.price == null ? '—' : formatPrice.format(Number(book.price))
    row.insertCell().textContent = book.currency_code ?? '—'
    const actions = row.insertCell(); actions.className = 'actions'
    actions.append(actionButton('Düzenle', 'secondary', 'edit', book.ID), actionButton('Sil', 'danger', 'delete', book.ID))
  }
}

async function loadBooks({ keepMessage = false } = {}) {
  if (!keepMessage) clearMessage()
  body.innerHTML = '<tr><td class="state-cell" colspan="8">Kitaplar yükleniyor…</td></tr>'
  try {
    const payload = await request(`${BOOKS_URL}?$select=ID,title,descr,stock,price,author_ID,genre_ID,currency_code&$expand=author($select=ID,name),genre($select=ID,name)&$orderby=ID`)
    books = payload.value ?? []; renderBooks()
  } catch (error) {
    body.innerHTML = '<tr><td class="state-cell" colspan="8">Kitaplar yüklenemedi.</td></tr>'
    showMessage(`Kitaplar alınamadı: ${error.message}`, 'error')
  }
}

async function loadRelations() {
  const [genres, authors, currencies] = await Promise.all([
    request(`${GENRES_URL}?$select=ID,name&$orderby=name`),
    request(`${AUTHORS_URL}?$select=ID,name&$orderby=name`),
    request(`${CURRENCIES_URL}?$select=code&$orderby=code`)
  ])
  genreInput.replaceChildren(new Option('Tür seçin', ''))
  for (const genre of genres.value ?? []) genreInput.add(new Option(genre.name || `Tür ${genre.ID}`, genre.ID))
  authorInput.replaceChildren(new Option('Yazar seçin', ''))
  for (const author of authors.value ?? []) authorInput.add(new Option(author.name || `Yazar ${author.ID}`, author.ID))
  currencyInput.replaceChildren(new Option('Para birimi seçin', ''))
  for (const currency of currencies.value ?? []) currencyInput.add(new Option(currency.code, currency.code))
}

async function openCreateDialog() {
  clearMessage(); form.reset(); editingId = null; dialogTitle.textContent = 'Yeni Kitap Ekle'; relationFields.hidden = false; authorInput.disabled = false; genreInput.disabled = false; currencyInput.disabled = false
  try {
    const [, ids] = await Promise.all([
      loadRelations(),
      request(`${BOOKS_URL}?$select=ID&$orderby=ID desc&$top=1`)
    ])
    idInput.value = (ids.value?.[0]?.ID ?? 0) + 1
    dialog.showModal(); titleInput.focus()
  } catch (error) { showMessage(`Form açılamadı: Form bilgileri alınamadı. ${error.message}`, 'error') }
}

async function openEditDialog(book) {
  clearMessage(); editingId = book.ID; dialogTitle.textContent = 'Kitabı Düzenle'
  relationFields.hidden = false; authorInput.disabled = false; genreInput.disabled = false; currencyInput.disabled = false
  idInput.value = book.ID; titleInput.value = book.title ?? ''; descrInput.value = book.descr ?? ''; stockInput.value = book.stock ?? 1; priceInput.value = book.price ?? ''
  try {
    await loadRelations()
    authorInput.value = book.author_ID ?? ''
    genreInput.value = book.genre_ID ?? ''
    currencyInput.value = book.currency_code ?? ''
    dialog.showModal(); titleInput.focus()
  } catch (error) { showMessage(`Form açılamadı: Form bilgileri alınamadı. ${error.message}`, 'error') }
}

async function saveBook(event) {
  event.preventDefault(); saveButton.disabled = true
  const payload = {
    title: titleInput.value.trim(),
    descr: descrInput.value.trim(),
    stock: Number(stockInput.value),
    price: Number(priceInput.value),
    author_ID: Number(authorInput.value),
    genre_ID: Number(genreInput.value),
    currency_code: currencyInput.value
  }
  try {
    let successText
    if (editingId === null) {
      payload.ID = Number(idInput.value)
      await request(BOOKS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      successText = 'Kitap başarıyla eklendi.'
    } else {
      await request(`${BOOKS_URL}(${editingId})`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      successText = 'Kitap başarıyla güncellendi.'
    }
    dialog.close(); showMessage(successText); await loadBooks({ keepMessage: true })
  } catch (error) { showMessage(`İşlem tamamlanamadı: ${error.message}`, 'error') }
  finally { saveButton.disabled = false }
}

async function deleteBook(book) {
  if (!window.confirm(`“${book.title}” adlı kitabı silmek istediğinize emin misiniz?`)) return
  clearMessage()
  try { await request(`${BOOKS_URL}(${book.ID})`, { method: 'DELETE' }); showMessage('Kitap başarıyla silindi.'); await loadBooks({ keepMessage: true }) }
  catch (error) { showMessage(`Kitap silinemedi: ${error.message}`, 'error') }
}

body.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]'); if (!button) return
  const book = books.find(item => item.ID === Number(button.dataset.id)); if (!book) return
  if (button.dataset.action === 'edit') openEditDialog(book)
  if (button.dataset.action === 'delete') deleteBook(book)
})
document.querySelector('#add-book').addEventListener('click', openCreateDialog)
document.querySelector('#refresh').addEventListener('click', () => loadBooks())
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close())
document.querySelector('#cancel-dialog').addEventListener('click', () => dialog.close())
form.addEventListener('submit', saveBook)
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
loadBooks()
