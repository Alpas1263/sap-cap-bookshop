const BOOKS_URL = '/admin/Books'
const GENRES_URL = '/admin/Genres'
const AUTHORS_URL = '/admin/Authors'
const body = document.querySelector('#books-body')
const message = document.querySelector('#message')
const dialog = document.querySelector('#book-dialog')
const form = document.querySelector('#book-form')
const dialogTitle = document.querySelector('#dialog-title')
const idInput = document.querySelector('#book-id')
const titleInput = document.querySelector('#book-title')
const stockInput = document.querySelector('#book-stock')
const priceInput = document.querySelector('#book-price')
const genreInput = document.querySelector('#book-genre')
const authorInput = document.querySelector('#book-author')
const relationFields = document.querySelector('#relation-fields')
const saveButton = document.querySelector('#save-book')
let books = []
let relationsLoaded = false
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
    const cell = body.insertRow().insertCell(); cell.colSpan = 5; cell.className = 'state-cell'; cell.textContent = 'Henüz kitap kaydı bulunmuyor.'
    return
  }
  const formatPrice = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  for (const book of books) {
    const row = body.insertRow()
    row.insertCell().textContent = book.ID
    const titleCell = row.insertCell(); titleCell.className = 'title-cell'; titleCell.textContent = book.title ?? '—'
    row.insertCell().textContent = book.stock ?? '—'
    row.insertCell().textContent = book.price == null ? '—' : formatPrice.format(Number(book.price))
    const actions = row.insertCell(); actions.className = 'actions'
    actions.append(actionButton('Düzenle', 'secondary', 'edit', book.ID), actionButton('Sil', 'danger', 'delete', book.ID))
  }
}

async function loadBooks({ keepMessage = false } = {}) {
  if (!keepMessage) clearMessage()
  body.innerHTML = '<tr><td class="state-cell" colspan="5">Kitaplar yükleniyor…</td></tr>'
  try {
    const payload = await request(`${BOOKS_URL}?$select=ID,title,stock,price,genre_ID&$orderby=ID`)
    books = payload.value ?? []; renderBooks()
  } catch (error) {
    body.innerHTML = '<tr><td class="state-cell" colspan="5">Kitaplar yüklenemedi.</td></tr>'
    showMessage(`Kitaplar alınamadı: ${error.message}`, 'error')
  }
}

async function loadRelations() {
  if (relationsLoaded) return
  const [genres, authors] = await Promise.all([
    request(`${GENRES_URL}?$select=ID,name&$orderby=name`),
    request(`${AUTHORS_URL}?$select=ID,name&$orderby=name`)
  ])
  genreInput.replaceChildren(new Option('Tür seçin', ''))
  for (const genre of genres.value ?? []) genreInput.add(new Option(genre.name || `Tür ${genre.ID}`, genre.ID))
  authorInput.replaceChildren(new Option('Yazar seçin', ''))
  for (const author of authors.value ?? []) authorInput.add(new Option(author.name || `Yazar ${author.ID}`, author.ID))
  relationsLoaded = true
}

async function openCreateDialog() {
  clearMessage(); form.reset(); editingId = null; dialogTitle.textContent = 'Yeni Kitap Ekle'; idInput.disabled = false; relationFields.hidden = false; authorInput.disabled = false; genreInput.disabled = false
  try { await loadRelations(); dialog.showModal(); idInput.focus() }
  catch (error) { showMessage(`Form açılamadı: Yazar ve tür bilgileri alınamadı. ${error.message}`, 'error') }
}

function openEditDialog(book) {
  clearMessage(); editingId = book.ID; dialogTitle.textContent = 'Kitabı Düzenle'
  idInput.value = book.ID; idInput.disabled = true; titleInput.value = book.title ?? ''; stockInput.value = book.stock ?? 0; priceInput.value = book.price ?? ''; relationFields.hidden = true; authorInput.disabled = true; genreInput.disabled = true
  dialog.showModal(); titleInput.focus()
}

async function saveBook(event) {
  event.preventDefault(); saveButton.disabled = true
  const payload = { title: titleInput.value.trim(), stock: Number(stockInput.value), price: Number(priceInput.value) }
  try {
    let successText
    if (editingId === null) {
      Object.assign(payload, { ID: Number(idInput.value), author_ID: Number(authorInput.value), genre_ID: Number(genreInput.value) })
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
