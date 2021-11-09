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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'] 
  }
  res.render("urls_show", templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'] 
  }
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