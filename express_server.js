const express = require("express");
const cookieParser = require('cookie-parser');
const { application } = require("express");
//const bodyParser = require('body-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")
//app.use (bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const user_cookie = req.cookies.user_id
  const user = users[user_cookie]
  const templateVars = {
    user
  }
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  //get the user info from the registration page
  const newUser = req.body;
  //console.log(req.body)
  
  //create the userid
  const userId = generateRandomString();
  // save the info in the users object.
  users[userId] = {
    id: userId,
    email: req.body['email'],
    password: req.body['password']
  }
  //console.log the user object & inspect the cookie to see the change
  console.log(users)
  // set the userid cookie.
  res.cookie('user_id', userId)
  //redirect to /urls page
  res.redirect('urls')

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user_cookie = req.cookies.user_id
  const user = users[user_cookie]
  const templateVars = {
    user
  }
  
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user_cookie = req.cookies.user_id
  const user = users[user_cookie]

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  }
  res.render("urls_show", templateVars)
});

app.get("/urls", (req, res) => {
  const user_cookie = req.cookies.user_id
  const user = users[user_cookie]

  const templateVars = {
    urls: urlDatabase,
    user
  }
  console.log()
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  
  // generate short url
  const shortURL = generateRandomString();
  const longURL = req.body['longURL']
  // add the shortURL - longURL paris in the database
  urlDatabase[shortURL] = longURL
  
  const templateVars = {
    shortURL,
    longURL 
  }
  res.redirect(`/urls/${shortURL}`)
});

app.post('/urls/:id', (req, res) => {

  console.log(req.body)
  const shortURL = req.params.id
  const longURL = req.body.newLongURL
  urlDatabase[shortURL] = longURL
  res.redirect('/urls')
})



app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if(shortURL in urlDatabase){
    const longURL = urlDatabase[shortURL]
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  if(shortURL in urlDatabase){
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  }
})

app.post('/login',(req, res) => {
  const userName = req.body.username
  //console.log(userName)
  res.cookie("username", userName)
  res.redirect('/urls')
})

app.post('/logout',(req, res) => {
  //const userName = req.body.username
  //console.log(userName)
  res.clearCookie("user_id")
  res.redirect('/urls')
})





app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}