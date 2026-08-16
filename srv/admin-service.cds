using { sap.capire.bookshop as bookshop } from '../db/schema';

service AdminService @(path: '/admin') {
  entity Authors as projection on bookshop.Authors;
  entity Books   as projection on bookshop.Books;
  entity Genres  as projection on bookshop.Genres;
}
