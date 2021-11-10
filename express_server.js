const express = require("express");
const cookieSession = require('cookie-session');
const {urlDatabase, users} = require('./appData');
const helperFunctions = require('./helper');
const { generateRandomString, emailLookUP, getUserId, urlsForUser } = helperFunctions(users, urlDatabase);

const bcrypt = require('bcryptjs');


const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['4nimal4Life']
}));


// ======= Home route ===========

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//======== User Registration route ========

app.get("/register", (req, res) => {
  
  const userCookie = req.session.user_id;
  const user = users[userCookie];
  const templateVars = {
    user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  //get the user info from the registration page
  const {email, password} = req.body;
  // If email or password field is empty then redirect to error page
  if (!email || !password) {
    const errorMessage = {
      errorTitle: "Invalid values",
      errorDescription: "Email and Password can not be empty, Please try to register again.",
      route: "register"
    };
    res.status(400).render("error_page",errorMessage);
  } else if (emailLookUP(email)) {
    // If email already exist in the data then redirect to error page
    const errorMessage = {
      errorTitle: "Invalid values",
      errorDescription: "Email already exist, please try another valid email address to register or login with existing email.",
      route: "register"
    };
    res.status(400).render("error_page",errorMessage);
  } else {
  //create the userid
    const userId = generateRandomString();
    //hash the password
    const hashedPass = bcrypt.hashSync(password, 10);
    // save the info in the users object.
    users[userId] = {
      id: userId,
      email: email,
      password: hashedPass
    };
    // set the userid cookie.
    req.session.user_id = userId;
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
   
  if (!req.session.user_id) {
    
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render("error_page",errorMessage);
  } else {
    const userCookie = req.session.user_id;
    const user = users[userCookie];
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userCookie = req.session.user_id;
  const user = users[userCookie];
  const shortURL = req.params.shortURL;
  const authorizedURLs = urlsForUser(userCookie);

  // check if the user is logged in.
  if (!userCookie) {
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render("error_page",errorMessage);
  }
  if (shortURL in urlDatabase) {
    if (shortURL in authorizedURLs) {
      const longURL = urlDatabase[shortURL]['longURL'];
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: longURL,
        user
      };
      res.render("urls_show", templateVars);
    } else {
      //User is not authorized to access this url
      const errorMessage = {
        errorTitle: "Unauthorized access",
        errorDescription: "You are not authorized to perform this action, Please login with valid credentials and try again ",
        route: "urls"
      };
      res.status(403).render("error_page",errorMessage);
    }
  } else {
    // URL does not exist
    const errorMessage = {
      errorTitle: "Page does not exist",
      errorDescription: "page you are trying to access does not exist, please use a valid URL",
      route: "urls"
    };
    res.status(404).render("error_page",errorMessage);
  }
});


app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  const user = users[userCookie];

  //Check if the user is logged in
  if (req.session.user_id in users) {
   
    const authorizedURLs = urlsForUser(userCookie);
    const templateVars = {
      urls: authorizedURLs,
      user
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).redirect("/login");
  }
});


app.post("/urls", (req, res) => {
  
  // Add validation to check the user is logged in
  const userCookie = req.session.user_id;
  
  if (!userCookie) {
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render("error_page",errorMessage);
  } else {
    // generate short url
    const shortURL = generateRandomString();
    
    const longURL = req.body['longURL'];

    // add the shortURL - longURL paris in the database
    
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL]['longURL'] = longURL;
    urlDatabase[shortURL]['userID'] = userCookie;
    
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/urls/:id', (req, res) => {
  
  const userCookie = req.session.user_id;
  const authorizedURLs = urlsForUser(userCookie);
  const shortURL = req.params.id;
  const longURL = req.body.newLongURL;

  if (shortURL in authorizedURLs) {
    urlDatabase[shortURL]['longURL'] = longURL;
    res.redirect('/urls');
  } else {
    // redirect to error message showing user is not authorized !
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You are not authorized to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render('error_page', errorMessage);
  }

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL in urlDatabase) {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    const errorMessage = {
      errorTitle: "Page does not exist",
      errorDescription: "page you are trying to access does not exist, please use a valid URL",
      route: "urls"
    };
    res.status(404).render('error_page', errorMessage);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  // check if the user has authorize to delete the url by comparing user cookie with the authorized urls
  const userCookie = req.session.user_id;
  const authorizedURLs = urlsForUser(userCookie);
  const shortURL = req.params.id;
  //check if the user is not logged in
  if (!userCookie) {
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You need to be logged in to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render("error_page",errorMessage);
  }

  if (shortURL in authorizedURLs) {
    if (shortURL in urlDatabase) {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    }
  } else {
    // redirect to error message showing user is not authorized !
    const errorMessage = {
      errorTitle: "Unauthorized access",
      errorDescription: "You are not authorized to perform this action, Please login with valid credentials and try again ",
      route: "login"
    };
    res.status(403).render('error_page', errorMessage);
  }
});


//======== Login and Logout routes ========

app.get('/login', (req, res) => {
  const userCookie = req.session.user_id;
  const user = users[userCookie];
  const templateVars = {
    user
  };
  res.render('login_page', templateVars);
});


app.post('/login',(req, res) => {
  const user = req.body;
  
  // check if the user exist in the database

  if (emailLookUP(user.email)) {
    const userID = getUserId(user.email);
    
    //get compare the hashed password with the password
    const passwordTocompare = user.password;
    const hashedPass = users[userID]['password'];

    if (!bcrypt.compareSync(passwordTocompare,hashedPass)) {
      const errorMessage = {
        errorTitle: "Invalid Credentials",
        errorDescription: "Email and Password does not match, please try login again",
        route: "login"
      };
      res.render('error_page', errorMessage);
    } else {
      req.session.user_id = userID;
      res.redirect('/urls');
    }
  } else {
    const errorMessage = {
      errorTitle: "Invalid Credentials",
      errorDescription: "Email or Password you entered is not valid, please try login again",
      route: "login"
    };
    res.render('error_page', errorMessage);
  }
});

app.get('/logout',(req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

