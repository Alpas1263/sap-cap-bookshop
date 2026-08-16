import cds from '@sap/cds'

export class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = this.entities

    this.after('READ', Books, results => {
      const books = Array.isArray(results) ? results : [results]
      for (const book of books) {
        if (book?.stock > 111) book.title += ' -- 11% discount!'
      }
    })

    this.before('submitOrder', req => {
      if (!Number.isInteger(req.data.quantity) || req.data.quantity < 1) {
        req.reject(400, 'Quantity must be a positive integer')
      }
    })

    this.on('submitOrder', async req => {
      const { book, quantity } = req.data
      const affectedRows = await cds.update(Books, book)
        .with({ stock: { '-=': quantity } })
        .where({ stock: { '>=': quantity } })

      if (!affectedRows) {
        const exists = await cds.ql.SELECT.one.from(Books, book).columns('ID')
        if (!exists) return req.reject(404, `Book ${book} not found`)
        return req.reject(409, `Insufficient stock for book ${book}`)
      }

      const updatedBook = await cds.ql.SELECT.one.from(Books, book).columns('stock')
      return updatedBook.stock
    })

    return super.init()
  }
}
