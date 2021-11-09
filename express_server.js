const express = require("express");
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//app.use (bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// Application Data
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
};

// Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

//======== User Registration route ========

app.get("/register", (req, res) => {
  const user_cookie = req.cookies.user_id;
  const user = users[user_cookie];
  const templateVars = {
    user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  //get the user info from the registration page
  const newUser = req.body;
  //console.log("newUser", newUser)
  
  if(!newUser.email || !newUser.password){
    //console.log("email or password empty")
    res.sendStatus(400)
  }

  else if(emailLookUP(newUser.email)){
    //console.log("email already exist")
    res.sendStatus(400)
  }
  
  else {
  //create the userid
  const userId = generateRandomString();
  // save the info in the users object.
  users[userId] = {
    id: userId,
    email: req.body['email'],
    password: req.body['password']
  };
  //console.log the user object & inspect the cookie to see the change
  //console.log(users);
  // set the userid cookie.
  res.cookie('user_id', userId);
  //redirect to /urls page
  res.redirect('urls');
}

});

//======== URLs routes ========

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user_cookie = req.cookies.user_id;
  const user = users[user_cookie];
  const templateVars = {
    user
  };
  
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user_cookie = req.cookies.user_id;
  const user = users[user_cookie];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_cookie = req.cookies.user_id;
  const user = users[user_cookie];

  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  // generate short url
  const shortURL = generateRandomString();
  const longURL = req.body['longURL'];
  // add the shortURL - longURL paris in the database
  urlDatabase[shortURL] = longURL;
  
  const templateVars = {
    shortURL,
    longURL
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id', (req, res) => {

  console.log(req.body);
  const shortURL = req.params.id;
  const longURL = req.body.newLongURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});


//======== Login and Logout routes ========

app.get('/login', (req, res) => {
  const user_cookie = req.cookies.user_id;
  const user = users[user_cookie];
  const templateVars = {
    user
  }
  res.render('login_page', templateVars)
})



app.post('/login',(req, res) => {
  const user = req.body;
  console.log(user)
  // check if the user exist in the database
  
  if(emailLookUP(user.email)){
    const userID = getUserId(user.email)
    console.log(userID)

    if(users[userID]['password'] !== user.password){
      res.status(403).send('Email and Password does not match')
    }
    else {
    res.cookie("user_id", userID);
    res.redirect('/urls');
    }
  }
  else{
    res.status(403).send('Email Does not Exist')
  }
});

app.get('/logout',(req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});



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


// Helper functions

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function emailLookUP(email){
  for(user in users){
    // console.log(user)
    // console.log(`The user's email is ${users[user].email} and email to compare ${email}`)
    if(users[user].email === email){
      return true
    }
  }
  return false
}

function getUserId(email){
  for(user in users){
    if(users[user].email === email){
      return users[user].id
    }
  }
}