import { Server, StableBTreeMap, int64 } from 'azle';
import express from 'express';
import { Request } from "express";
import UserRequestDTO from "./dto/UserRequestDTO";
import BookResponseDTO from "./dto/BookResponseDTO";
import InsertBookRequestDTO from "./dto/InsertBookRequestDTO";
import CategoryRequestDTO from "./dto/CategoryRequestDTO";
import AddToCartDTO from "./dto/AddToCartDTO";
import * as crypto from 'crypto';

class Book {
    book_id: string;
    category_id: string;
    book_name: string;
    book_description: string;
    book_price: int64;
    book_stock: int64;

    constructor(book_id: string, category_id: string, book_name: string, 
                book_description: string, book_price: int64, book_stock: int64) {
        this.book_id = book_id;
        this.category_id = category_id;
        this.book_name = book_name;
        this.book_description = book_description;
        this.book_description = book_description;
        this.book_price = book_price;
        this.book_stock = book_stock;
    }
 }

class Transaction {
    transaction_id: string;
    user_id: string;
    books: Cart[];
    date: Date

    constructor(transaction_id: string, user_id: string, books: Cart[], date: Date) {
        this.transaction_id = transaction_id;
        this.user_id = user_id;
        this.books = books;
        this.date = date
    }
}

class User {
    user_id: string;
    username: string;
    password: string;
    role: string

    constructor(user_id: string, username: string, password: string, role: string) {
        this.user_id = user_id;
        this.username = username;
        this.password = password;
        this.role = role;
    }
}

class Category {
    category_id: string;
    category_name: string

    constructor(category_id: string, category_name: string) {
        this.category_id = category_id;
        this.category_name = category_name
    }
}

class Salt {
    user_id: string;
    salt: string;
    constructor(user_id: string, salt: string) {
        this.user_id = user_id;
        this.salt = salt;
    }
}

class Token {
    token: string;
    user_id: string;
    exp: number;
    constructor(token: string, user_id: string, exp: number) {
        this.token = token;
        this.user_id = user_id;
        this.exp = exp;
    }
}


class Cart {
    user_id: string;
    book_id: string;
    quantity: int64
    constructor(user_id: string, book_id: string, quantity: int64) {
        this.user_id = user_id;
        this.book_id = book_id;
        this.quantity = quantity;
    }
}

const booksStorage = StableBTreeMap<string, Book>(0);
const transactionsStorage = StableBTreeMap<string, Transaction>(1);
const usersStorage = StableBTreeMap<string, User>(2);
const categoriesStorage = StableBTreeMap<string, Category>(3);
const saltsStorage = StableBTreeMap<string, Salt>(4);
const tokensStorage = StableBTreeMap<string, Token>(5);
const cartsStorage = StableBTreeMap<string, Cart>(6);

function hashPassword(password: string, salt: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
}

function generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
}

function generateRandomId(length: number): string {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    return buffer.toString('hex').slice(0, length);
}

function generateToken(): string {
    const token = crypto.randomBytes(15).toString('hex');
    return token;
}


function checkUser(req: Request<any, any, any>, res: any, next: any) {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(400).send("There is no required token!");
    }

    const findToken = tokensStorage.get(token);

    if ("None" in findToken) {
        return res.status(401).send("Token not found!");
    }

    if (findToken.Some.exp < Date.now() / 1000) {
        const deletedTokenOpt = tokensStorage.remove(findToken.Some.token);
        if ("None" in deletedTokenOpt) {
            return res.status(500).send("Token not removed");
        }
        return res.status(401).send("Token expired!");
    }

    const user = usersStorage.get(findToken.Some.user_id);
    
    (req as any).user = user.Some;

    next();
}

function checkAdmin(req: Request<any, any, any>, res: any, next: any) {
    const user: User = (req as any).user;

    if (user.role !== "Admin") {
        return res.status(401).json("Unauthorize");
    }

    next();
}

export default Server(() => {
    const app = express();
    app.use(express.json());

    // Test Purpose
    app.get("/test", (req, res) => {
        res.json("test");
    });

    app.get("/token", (req: Request<any, any, any>, res: any) => {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(400).json("Unauthorize");
        }
        const tokenOpt = tokensStorage.get(token);
        return res.json(tokenOpt);
    })

    app.get("/users", (req: Request<any, any, any>, res) => {
        res.json(usersStorage.values());
    });
    app.get("/tokens", (req: Request<any, any, any>, res) => {
        res.json(tokensStorage.values());
    });

    
    // Payload example:
    // {
    //     username: "test",
    //     password: "test"
    // }
    app.post("/register", (req: Request<UserRequestDTO, any, any>, res) => {
        const requestBody = req.body;
        if (requestBody.username.trim().length === 0 || requestBody.password.trim().length === 0) {
            return res.status(400).json("Invalid Request Body");
        }

        for (const user of usersStorage.values()) {
            if (user.username === requestBody.username) {
                return res.status(400).json("This username is taken");
            }
        }

        var userID = generateRandomId(10);
        
        const salt = generateSalt();
        const hashedPassword = hashPassword(requestBody.password, salt);
        const userToInsert: User = {
            user_id: userID,
            ...requestBody,
            password: hashedPassword,
            role: "User"
        }
        const saltToInsert: Salt = {
            user_id: userID,
            salt: salt
        }

        usersStorage.insert(userID, userToInsert);
        saltsStorage.insert(userID, saltToInsert);

        return res.status(200).json(userToInsert);

    });


    // Payload example:
    // {
    //     username: "test",
    //     password: "test"
    // }
    app.post("/register-new-admin", (req: Request<UserRequestDTO, any, any>, res) => {
        const requestBody = req.body;
        if (requestBody.username.trim().length === 0 || requestBody.password.trim().length === 0) {
            return res.status(400).json("Invalid Request Body");
        }

        for (const user of usersStorage.values()) {
            if (user.username === requestBody.username) {
                return res.status(400).json("This username is taken");
            }
        }

        var userID = generateRandomId(10);
        
        const salt = generateSalt();
        const hashedPassword = hashPassword(requestBody.password, salt);
        const userToInsert: User = {
            user_id: userID,
            ...requestBody,
            password: hashedPassword,
            role: "Admin"
        }
        const saltToInsert: Salt = {
            user_id: userID,
            salt: salt
        }

        usersStorage.insert(userID, userToInsert);
        saltsStorage.insert(userID, saltToInsert);

        return res.status(200).json(userToInsert);

    });


    // Payload example:
    // {
    //     username: "test",
    //     password: "test"
    // }
    app.post("/login", (req: Request<UserRequestDTO, any, any>, res) => {
        const requestBody = req.body;
        if (requestBody.username.trim().length === 0 || requestBody.password.trim().length === 0) {
            return res.status(400).json("Invalid Request Body");
        }

        for (const user of usersStorage.values()) {
            if (requestBody.username === user.username) {
                const userSaltOpt = saltsStorage.get(user.user_id);
                if ("None" in userSaltOpt) {
                    return res.status(400).json("Salt does not exist");
                }
                const hashedInputPassword = hashPassword(requestBody.password, userSaltOpt.Some.salt);
                if (hashedInputPassword === user.password) {
                    const generatedToken: Token = {
                        token: generateToken(),
                        user_id: user.user_id,
                        exp: Math.floor(Date.now() / 1000) + (60 * 60)
                    }
                    tokensStorage.insert(generatedToken.token, generatedToken);
                    return res.status(200).json(generatedToken.token);
                }
            }
        }
        return res.status(400).json("Invalid Credential!");
    });

    app.delete("/logout", checkUser, (req: Request<any, any, any>, res: any) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json("Unauthorize");
        }
        const findToken = tokensStorage.get(token);

        if ("None" in findToken) {
            return res.status(401).send("Token not found!");
        }

        tokensStorage.remove(token);
        return res.status(200).send("Logout successfully!");
    })

    app.get("/books", (req, res) => {
        res.json(booksStorage.values());
    });

    app.get("/book/:id", (req, res) => {
        const book_id = req.params.id;
        const book = booksStorage.get(book_id);

        if ("None" in book) {
            return res.status(400).json("Book not found!");
        }

        const getCategory = categoriesStorage.get(book.Some.category_id);

        if ("None" in getCategory) {
            return res.status(400).json("Category not found!");
        }

        const response: BookResponseDTO = {
            book_id: book.Some.book_id,
            category: getCategory.Some?.category_name,
            book_name: book.Some.book_name,
            book_description: book.Some.book_description,
            book_price: book.Some.book_price,
            book_stock: book.Some.book_stock
        }

        return res.json(response);
    });


    // Payload example:
    // {
    //     category_name: "Horror"
    // }
    app.post("/insert-category", checkUser, checkAdmin, (req: Request<CategoryRequestDTO, any, any>, res: any) => {
        const requestBody = req.body;
        for (const category of categoriesStorage.values()) {
            if (category.category_name === requestBody.category_name) {
                return res.status(400).json("Duplicate Category!");
            }
        }
        const randomID = generateRandomId(15);
        const categoryToInsert: Category = {
            category_id: randomID,
            category_name: requestBody.category_name
        }
        categoriesStorage.insert(randomID, categoryToInsert);
        return res.status(200).json("Category Inserted!");
    });

    app.get("/categories", (req: Request<any, any, any>, res: any) => {
        res.json(categoriesStorage.values());  
    })


    // Payload example:
    // {
    //     "category": "Horror",
    //     "book_name": "Harry Potter",
    //     "book_description": "Buku serem",
    //     "book_price": 10,
    //     "book_stock": 0
    // }
    app.post("/insert-book", checkUser, checkAdmin, (req: Request<InsertBookRequestDTO, any, any>, res: any) => {
        const requestBody = req.body;
        if (requestBody.category.trim().length === 0 || 
            requestBody.book_name.trim().length === 0 ||
            requestBody.book_price <= 0 ||
            requestBody.book_stock < 0) {
            return res.status(400).json("Invalid Request Body");
        }

        var category_id = "";
        for (const category of categoriesStorage.values()) {
            if (category.category_name === requestBody.category) {
                category_id = category.category_id;
            }
        }

        var randomID = generateRandomId(15);
        const book: Book = {
            book_id: randomID,
            category_id: category_id,
            book_name: requestBody.book_name,
            book_description: requestBody.book_description,
            book_price: requestBody.book_price,
            book_stock: requestBody.book_stock
        }
        booksStorage.insert(randomID, book);
        return res.status(200).json("Book inserted!");
    });

    app.delete("/delete-book/:id", checkUser, checkAdmin, (req: Request<any, any, any>, res: any) => {
        const book_id = req.params.id;
        if (!book_id) {
            return res.status(400).json("There is no book id");
        }
        const book = booksStorage.get(book_id);
        if ("None" in book) {
            return res.status(400).json("Book not found!");    
        }

        booksStorage.remove(book_id);
        return res.status(200).json("Book deleted!");
    })

    app.get("/get-book-by-category/:category", (req: Request<any, any, any>, res: any) => {
        const categoryToFilter = req.params.category;

        var category_id = "";
        for (const category of categoriesStorage.values()) {
            if (categoryToFilter === category.category_name) {
                category_id = category.category_id;
            }
        }

        if (category_id === "") {
            return res.status(400).json("Category not found!");
        }

        var books: Book[] = [];
        for (const book of booksStorage.values()) {
            if (book.category_id === category_id) {
                books.push(book);
            }
        }

        return res.status(200).json(books);
    });
    

    // Payload example:
    // {
    //     "category": "Horror",
    //     "book_name": "Test",
    //     "book_description": "Buku serem",
    //     "book_price": 10,
    //     "book_stock": 0
    // }
    app.put("/update-book/:id", checkUser, checkAdmin, (req: Request<any, any, any>, res: any) => {
        const requestBody = req.body;
        const book_id = req.params.id;

        const book = booksStorage.get(book_id);

        if ("None" in book) {
            return res.status(400).json("Book not found!");
        }

        if (requestBody.category.trim().length === 0 || 
            requestBody.book_name.trim().length === 0 ||
            requestBody.book_price <= 0 ||
            requestBody.book_stock < 0) {
            return res.status(400).json("Invalid Request Body");
        }

        var category_id = "";
        for (const category of categoriesStorage.values()) {
            if (category.category_name === requestBody.category) {
                category_id = category.category_id;
            }
        }

        const bookToUpdate: Book = {
            book_id: book.Some.book_id,
            category_id: category_id,
            book_name: requestBody.book_name,
            book_description: requestBody.book_description,
            book_price: requestBody.book_price,
            book_stock: requestBody.book_stock
        }
        booksStorage.insert(book.Some.book_id, bookToUpdate);
        return res.status(200).json("Book updated!");
    });

    app.post("/add-to-cart", checkUser, (req: Request<any, any, any>, res: any) => {
        const requestBody: AddToCartDTO = req.body;
        if (requestBody.quantity <= 0) {
            return res.status(400).json("Quantity cannot be less than 0");
        }

        const book = booksStorage.get(requestBody.book_id);
        if ("None" in book) {
            return res.status(400).json("Book not found!");
        }

        const cartToAdd: Cart = {
            user_id: (req as any).user.user_id,
            book_id: requestBody.book_id,
            quantity: requestBody.quantity
        } 
        const cartID = cartToAdd.user_id + cartToAdd.book_id;
        cartsStorage.insert(cartID, cartToAdd);
        return res.status(200).json("Book added to cart!");
    });

    app.get("/show-cart", checkUser, (req: Request<any, any, any>, res: any) => {
        const user_id = (req as any).user.user_id;
        var bookInCart = [];
        for (const cart of cartsStorage.values()) {
            if (cart.user_id === user_id) {
                bookInCart.push(cart);
            }
        }

        return res.status(200).json(bookInCart);
    });

    app.post("/checkout", checkUser, (req: Request<any, any, any>, res: any) => {
        const user_id = (req as any).user.user_id;
        var bookInCart = [];
        for (const cart of cartsStorage.values()) {
            if (cart.user_id === user_id) {
                bookInCart.push(cart);
            }
        }

        const transaction_id = generateRandomId(20);
        const transactionToAdd = {
            transaction_id: transaction_id,
            books: bookInCart,
            user_id: user_id,
            date: new Date()
        }
        transactionsStorage.insert(transaction_id, transactionToAdd);
        
        return res.status(200).json("Transaction Added!");
    });

    app.get("/transaction", checkUser, (req: Request<any, any, any>, res: any) => {
        const user_id = (req as any).user.user_id;
        var transactions = [];
        for (const transaction of transactionsStorage.values()) {
            if (transaction.user_id === user_id) {
                transactions.push(transaction);
            }
        }
        return res.status(200).json(transactions);
    });

    return app.listen();
})