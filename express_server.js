const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')


const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['4nimal4Life']
}))



//=========== Application Data=========

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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

// ======= Routes ===========
app.get("/", (req, res) => {
  res.send("Hello!");
});

//======== User Registration route ========

app.get("/register", (req, res) => {
  //const user_cookie = req.cookies.user_id;
  const user_cookie = req.session.user_id 
  const user = users[user_cookie];
  const templateVars = {
    user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  //get the user info from the registration page
  const newUser = req.body;
  
  
  if(!newUser.email || !newUser.password){
    
    const errorMessage = {
      errorTitle: "Invalid values",
      errorDescription: "Email and Password can not be empty, Please try to register again.",
      route: "register"
    }
    res.status(400).render("error_page",errorMessage)
    
  }

  else if(emailLookUP(newUser.email)){
    const errorMessage = {
      errorTitle: "Invalid values",
      errorDescription: "Email already exist, please try another valid email address to register or login with existing email.",
      route: "register"
    }
    res.status(400).render("error_page",errorMessage)
  }
  
  else {
  //create the userid
  const userId = generateRandomString();
  
  //hash the password
  const password = req.body['password']
  const hashedPass = bcrypt.hashSync(password, 10)
  // save the info in the users object.
  users[userId] = {
    id: userId,
    email: req.body['email'],
    password: hashedPass
  };
  // set the userid cookie.
  req.session.user_id = userId
  //redirect to /urls page
  res.redirect('urls');
}

});

//======== URLs routes ========

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  // check if the user is logged in or not if not then redirect to login page
   

  if(!req.session.user_id){
    
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    }
    res.status(403).render("error_page",errorMessage)
  } else {
    const user_cookie = req.session.user_id;
    const user = users[user_cookie];
    console.log(user_cookie)
    console.log(user)
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const user_cookie = req.session.user_id;
  const user = users[user_cookie];

  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]['longURL']
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: longURL,
    user
  };
  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  
  //const user_cookie = req.cookies.user_id;
  const user_cookie = req.session.user_id
  const user = users[user_cookie];

  //Check if the user is logged in
  if(req.session.user_id in users){
   
    const authorizedURLs = getAuthorizesURLs(user_cookie)
    
    const templateVars = {
      urls: authorizedURLs,
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).redirect("/login")
  }
});


app.post("/urls", (req, res) => {
  
  // Add validation to check the user is logged in
  const user_cookie = req.session.user_id;
  const user = users[user_cookie];

  if(!user_cookie){
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    }
    res.status(403).render("error_page",errorMessage)
  }
  else {
      // generate short url
    const shortURL = generateRandomString();
    
    const longURL = req.body['longURL'];

    // add the shortURL - longURL paris in the database
    
    urlDatabase[shortURL] = {}
    urlDatabase[shortURL]['longURL'] = longURL;
    urlDatabase[shortURL]['userID'] = user_cookie
    
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/urls/:id', (req, res) => {
  
  const user_cookie = req.session.user_id;
  const authorizedURLs = getAuthorizesURLs(user_cookie)
  const shortURL = req.params.id;
  const longURL = req.body.newLongURL;

  if(shortURL in authorizedURLs){
    urlDatabase[shortURL]['longURL'] = longURL;
    res.redirect('/urls');
  }
  else{
    // redirect to error message showing user is not authorized !
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You are not authorized to perform this action, Please login with valid credentials and try again ",
      route: "login"
    }
    res.status(403).render('error_page', errorMessage)
  }

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  // check if the user has authorize to delete the url by comparing user cookie with the authorized urls
  const user_cookie = req.session.user_id;
  const authorizedURLs = getAuthorizesURLs(user_cookie)
  const shortURL = req.params.id;
  
  if(shortURL in authorizedURLs){
    if (shortURL in urlDatabase) {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    }
  }
  else {
     // redirect to error message showing user is not authorized !
     const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You are not authorized to perform this action, Please login with valid credentials and try again ",
      route: "login"
    }
    res.status(403).render('error_page', errorMessage)
  }
});


//======== Login and Logout routes ========

app.get('/login', (req, res) => {
  const user_cookie = req.session.user_id 
  console.log(user_cookie)
  const user = users[user_cookie];
  const templateVars = {
    user
  }
  res.render('login_page', templateVars)
})


app.post('/login',(req, res) => {
  const user = req.body;
  
  // check if the user exist in the database

  if(emailLookUP(user.email)){
    const userID = getUserId(user.email)
    
    //get compare the hashed password with the password
    const passwordTocompare = user.password
    const hashedPass = users[userID]['password']

    if(!bcrypt.compareSync(passwordTocompare,hashedPass)){
      const errorMessage = {
        errorTitle: "Invalid Credentials",
        errorDescription: "Email and Password does not match, please try login again",
        route: "login"
      }
      res.render('error_page', errorMessage)
    }
    else {
    req.session.user_id = userID
    res.redirect('/urls');
    }
  }
  else{
    const errorMessage = {
      errorTitle: "Invalid Credentials",
      errorDescription: "Email or Password you entered is not valid, please try login again",
      route: "login"
    }
    res.render('error_page', errorMessage)
  }
});

app.get('/logout',(req, res) => {
  req.session = null
  res.redirect('/urls');
});

// ====== Test routes ============

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

function getAuthorizesURLs(userID){
  const authorizedURLs = {}
  for(url in urlDatabase){
    if(urlDatabase[url]['userID'] === userID){
      authorizedURLs[url] = urlDatabase[url]
    }
  }
  return authorizedURLs
}