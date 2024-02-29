import {
    Canister,
    Err,
    int64,
    nat64,
    Ok,
    Opt,
    Principal,
    query,
    Record,
    Result,
    StableBTreeMap,
    text,
    update,
    Variant,
    Vec,
} from "azle";

const BOOKS_STORAGE_MEMORY_ID = 0;

const Book = Record({
    id: Principal,
    bookTitle: text,
    bookDescription: text,
    bookPrice: int64,
    bookStock: int64,
    bookCreatedDate: text,
});
type Book = typeof Book.tsType;

const BookCreatePayload = Record({
    bookTitle: text,
    bookDescription: text,
    bookPrice: int64,
    bookStock: int64,
});
type BookCreatePayload = typeof BookCreatePayload.tsType;

const BookIDPayload = Record({
    id: Principal,
});
type BookIDPayload = typeof BookIDPayload.tsType;

const Error = Variant({
    BookNotFound: Principal,
});
type Error = typeof Error.tsType;

let booksStorage = StableBTreeMap<Principal, Book>(BOOKS_STORAGE_MEMORY_ID);

// Function to generate secure IDs
function generateID() {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
    }

    return Principal.fromUint8Array(Uint8Array.from(array));
}
export default Canister({
    insertBook: update(
        [BookCreatePayload],
        Book,
        (dto: BookCreatePayload) => {
            // Validate input data
            if (dto.bookPrice <= 0 || dto.bookStock < 0) {
                throw new Error("Invalid input data");
            }

            const book: Book = {
                id: generateID(),
                bookTitle: dto.bookTitle,
                bookDescription: dto.bookDescription,
                bookPrice: dto.bookPrice,
                bookStock: dto.bookStock,
                bookCreatedDate: new Date().toDateString(),
            };
            booksStorage.insert(book.id, book);
            return book;
        }
    ),

    getBookCount: query([], nat64, () => {
        return booksStorage.len();
    }),

    getBookById: query([Principal], Opt(Book), (id: Principal) => {
        return booksStorage.get(id);
    }),

    getBooks: query([], Vec(Book), () => {
        return booksStorage.values();
    }),

    deleteBook: update(
        [BookIDPayload],
        Result(text, Error),
        (dto: BookIDPayload) => {
            // Validate input data
            if (!dto.id) {
                throw new Error("Invalid input data");
            }

            const bookToDelete = booksStorage.get(dto.id);
            if (!bookToDelete) {
                return Err({ BookNotFound: dto.id });
            }

            booksStorage.remove(dto.id);
            return Ok("Book with id " + dto.id + " deleted!");
        }
    ),

    updateBook: update(
        [Book],
        Result(text, Error),
        (dto: Book) => {
            // Validate input data
            if (!dto.id) {
                throw new Error("Invalid input data");
            }

            const bookToUpdate = booksStorage.get(dto.id);
            if (!bookToUpdate) {
                return Err({ BookNotFound: dto.id });
            }

            const updatedBook: Book = {
                ...bookToUpdate,
                bookTitle: dto.bookTitle,
                bookDescription: dto.bookDescription,
                bookPrice: dto.bookPrice,
                bookStock: dto.bookStock,
            };

            booksStorage.insert(dto.id, updatedBook);
            return Ok("Book with id " + dto.id + " updated!");
        }
    ),
});
