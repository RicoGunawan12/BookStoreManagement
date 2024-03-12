# Book Store Management 

Book Store Management is a simple app that manage book in the book store. It powered by blockchain technology

# Endpoints

# For User Management:

/register
This endpoint is used to register new user
Method POST
Payload example:
{
    username: "test",
    password: "test"
}


/register-new-admin
This endpoint is used to register new admin
Method POST
Payload example:
{
    username: "test",
    password: "test"
}


/login
This endpoint is used to login
Method POST
Payload example:
{
    username: "test",
    password: "test"
}


/logout
This endpoint is used to logout
Method DELETE
Middleware: checkUser (token must filled in bearer token)


/tokens
This endpoint is used to check all tokens in database
Method GET


/users
This endpoint is used to check all users in database
Method GET


# For Category Management:

/insert-category
This endpoint is used to insert new book category
Method POST
Payload example:
{
    category_name: "Horror"
}
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)


/categories
This endpoint is used to show all category in database
Method GET


# For Book Management

/books
This endpoint is used to show all book in database
Method GET


/book/:id
This endpoint is used to show book by id
Method GET


/get-book-by-category/:category
This endpoint is used to show all book by category
Method GET


/insert-book
This endpoint is used to insert new book
Method POST
Payload example:
{
    "category": "Horror",
    "book_name": "Test",
    "book_description": "Buku serem",
    "book_price": 10,
    "book_stock": 0
}
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)


/delete-book/:id
This endpoint is used to delete book by spesific id
Method DELETE
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)


/update-book/:id
This endpoint is used to update book by spesific id
Method PUT
Payload example:
{
    "category": "Horror",
    "book_name": "Test",
    "book_description": "Buku serem",
    "book_price": 10,
    "book_stock": 0
}
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)


# For Cart Management

/add-to-cart
This endpoint is used to add book to cart
Method POST
Payload example:
{
    "book_id": "045b2f2aa1abbde", (This is the book id)
    "quantity": 2
}
Middleware: checkUser (token must filled in bearer token)


/show-cart
This endpoint is used to show the logged in user's cart
Method POST
Middleware: checkUser (token must filled in bearer token)


# For Transaction Management

/checkout
This endpoint is used to add book to cart
Method POST
Middleware: checkUser (token must filled in bearer token)


/transaction
This endpoint is used to show all transaction
Method GET
Middleware: checkUser (token must filled in bearer token)