# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

### Register User

!["Register For Account"](https://github.com/sidpatel93/tinyapp/blob/master/docs/create_account.png)

### Home page (Logged in)

!["URL home page"](https://github.com/sidpatel93/tinyapp/blob/master/docs/url_home_page.png)

### Edit the URLs

!["Edit URLs"](https://github.com/sidpatel93/tinyapp/blob/master/docs/create_url.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser (Depreciated. From Express version 4.16 and above body-parser comes inbuilt with the frame work. So we are using that in this application.)
- cookie-session

## Getting Started

- Clone this reposetory and `cd` in to that newly created folder.
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Getting Started

After running the development server using `node express_server.js` command, you can access the application on `localhost:8080/`. If logged in, the home page will show all the short URLs you have created or redirect to Login page if not logged in.  
