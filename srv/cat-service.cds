using { sap.capire.bookshop as bookshop } from '../db/schema';

service CatalogService @(path: '/browse') {
  @readonly
  entity Books as projection on bookshop.Books {
    *,
    author.name as author,
    genre.name  as genre
  } excluding { createdBy, modifiedBy };

  @requires: 'authenticated-user'
  action submitOrder(book: Books:ID, quantity: Integer) returns Integer;
}
