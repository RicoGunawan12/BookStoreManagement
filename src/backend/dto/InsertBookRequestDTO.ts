import { int64 } from 'azle';

export default class InsertBookRequestDTO {
    category: string;
    book_name: string;
    book_description: string;
    book_price: int64;
    book_stock: int64;

    constructor(category: string, book_name: string, 
                book_description: string, book_price: int64, book_stock: int64) {
        this.category = category;
        this.book_name = book_name;
        this.book_description = book_description;
        this.book_price = book_price;
        this.book_stock = book_stock;
    }
 }