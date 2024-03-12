import { int64 } from 'azle';

export default class BookResponseDTO {
    category_name: string;

    constructor(category_name: string) {
        this.category_name = category_name;
    
    }
 }