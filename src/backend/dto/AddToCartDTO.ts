import { int64 } from 'azle';

export default class AddToCartDTO {
    book_id: string;
    quantity: int64
    constructor(book_id: string, quantity: int64) {
        this.book_id = book_id;
        this.quantity = quantity;
    }
 }