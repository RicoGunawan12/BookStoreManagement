# Book Store Management 

Book Store Management is a simple app that manage book in the book store. It powered by blockchain technology

# Endpoints

# For User Management:

/register<br/>
This endpoint is used to register new user<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    username: "test",<br/>
    password: "test"<br/>
}<br/>
<br/><br/>

/register-new-admin<br/>
This endpoint is used to register new admin<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    username: "test",<br/>
    password: "test"<br/>
}<br/>
<br/><br/>

/login<br/>
This endpoint is used to login<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    username: "test",<br/>
    password: "test"<br/>
}<br/>
<br/><br/>

/logout<br/>
This endpoint is used to logout<br/>
Method DELETE<br/>
Middleware: checkUser (token must filled in bearer token)<br/>
<br/><br/>

/tokens<br/>
This endpoint is used to check all tokens in database<br/>
Method GET<br/>
<br/><br/>

/users<br/>
This endpoint is used to check all users in database<br/>
Method GET<br/>
<br/><br/>

# For Category Management:

/insert-category<br/>
This endpoint is used to insert new book category<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    category_name: "Horror"<br/>
}<br/>
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)<br/>
<br/><br/>

/categories<br/>
This endpoint is used to show all category in database<br/>
Method GET<br/>
<br/><br/>

# For Book Management

/books<br/>
This endpoint is used to show all book in database<br/>
Method GET<br/>
<br/><br/>

/book/:id<br/>
This endpoint is used to show book by id<br/>
Method GET<br/>
<br/><br/>

/get-book-by-category/:category<br/>
This endpoint is used to show all book by category<br/>
Method GET<br/>
<br/><br/>

/insert-book<br/>
This endpoint is used to insert new book<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    "category": "Horror",<br/>
    "book_name": "Test",<br/>
    "book_description": "Buku serem",<br/>
    "book_price": 10,<br/>
    "book_stock": 0<br/>
}<br/>
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)<br/>
<br/><br/>

/delete-book/:id<br/>
This endpoint is used to delete book by spesific id<br/>
Method DELETE<br/>
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)<br/>
<br/><br/>

/update-book/:id<br/>
This endpoint is used to update book by spesific id<br/>
Method PUT<br/>
Payload example:<br/>
{<br/>
    "category": "Horror",<br/>
    "book_name": "Test",<br/>
    "book_description": "Buku serem",<br/>
    "book_price": 10,<br/>
    "book_stock": 0<br/>
}<br/>
Middleware: checkUser (token must filled in bearer token), checkAdmin (need admin token)<br/>
<br/><br/>

# For Cart Management

/add-to-cart<br/>
This endpoint is used to add book to cart<br/>
Method POST<br/>
Payload example:<br/>
{<br/>
    "book_id": "045b2f2aa1abbde", (This is the book id)<br/>
    "quantity": 2<br/>
}<br/>
Middleware: checkUser (token must filled in bearer token)<br/>
<br/><br/>

/show-cart<br/>
This endpoint is used to show the logged in user's cart<br/>
Method POST<br/>
Middleware: checkUser (token must filled in bearer token)<br/>
<br/><br/>

# For Transaction Management

/checkout<br/>
This endpoint is used to add book to cart<br/>
Method POST<br/>
Middleware: checkUser (token must filled in bearer token)<br/>
<br/><br/>

/transaction<br/>
This endpoint is used to show all transaction<br/>
Method GET<br/>
Middleware: checkUser (token must filled in bearer token)<br/>
