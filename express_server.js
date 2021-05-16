const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser"); //middleware
const cookieSession = require('cookie-session');
const { getUserByEmail, randomValue, urlsForUser } = require('./helpers');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['userId'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

// example of users' url database
const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

/**
*  store users
*   user =  {
*     userID: string,
*     eamil: string,
*     password: string
* }
*/
const users = {};

// main Login page
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//if user logged in should go to make a new url
app.post("/urls", (req, res) => {
  let userId = req.session.userId;
  if (!userId) {
    res.status(400).send("Please logged in first");
  } else {
    const newString = randomValue(6);
    urlDatabase[newString] = {longURL: req.body.longURL, userID: req.session.userId};
    res.redirect(`/urls/${newString}`);
  }
});

// Display urls JSON on client
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// displays "Hello World" message
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// to display urls index page
app.get("/urls", (req, res) => {
  let userId = req.session.userId;
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId],
    error: users[userId] ? null : "Please Login or Register first"
  };
  res.render("urls_index", templateVars);
});

// to redirect to long URL
app.get('/u/:id', (req, res) => {
  const longUrl = urlDatabase[req.params.id].longURL;
  res.redirect(longUrl);
});

// Displays creating new Url for users
app.get("/urls/new", (req, res) => {
  let userId = req.session.userId;
  const templateVars = { user: users[userId] };
  if (users[userId]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/urls');
  }
});

// Redirects to the responding long URL
app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session.userId;
  const shortURL = req.params.shortURL;

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
    error: users[userId] ? null : "Please Login or Register first" };
  if (userId) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// to show login page
app.get('/login', (req, res) => {
  let userId = req.session.userId;
  const templateVars = {user: users[userId], error: null};
  res.render('login', templateVars);
});

// to show register page
app.get("/register", (req, res) => {
  const templateVars = {user: null, error: null};
  res.render('register', templateVars);
});

// deleting urls
app.post('/urls/:shortURL/delete', (req, res) => {
  let userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!users[userId] || !userUrls[shortURL]) {
    res.status(401).send('Not Authroized');
  } else {
    const deleteToggle = req.params.shortURL;
    delete urlDatabase[deleteToggle];
    res.redirect("/urls");
  }
});

//if user logged in it should update long Url and redirect to my urls page
app.post('/urls/:shortURL', (req, res) => {
  let userId = req.session.userId;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userId, urlDatabase);
  if (!users[userId] || !userUrls[shortURL]) {
    res.status(401).send('Not Authroized');
  } else {
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  }
});

// Login user and stored user Id in session
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const userId = user ? user.id : null;
  if (users[userId] && bcrypt.compareSync(password, users[userId].password)) {
    req.session.userId = userId;
    res.redirect("/urls");
  } else {
    res.status(403);
    const templateVars = {
      user: null,
      error: 'Please check your email or password'
    };
    res.render('login', templateVars);
  }
});

//when user logged out, cookie session deletes immediately
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// checking users' duplication of email and password
app.post('/register', (req, res) => {
  const userId = randomValue(6);
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(req.body.email, users)) {
    res.status(403);
    const templateVars = {
      user: null,
      error: 'Register failed!'};
    res.render('register', templateVars);
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    // eslint-disable-next-line
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

//port page
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

