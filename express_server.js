const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');
// const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));  //middleware
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));
// app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = function(length, arr) {
  let random = '';
  for (let i = length; i > 0; i--) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
};

const newRandomId = function(length, arr) {
  let random = '';
  for (let i = length; i > 0; i--) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
};

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const newString = generateRandomString(6, chars);
  urlDatabase[newString] = {longURL: req.body.longURL, userID: req.session.user_id};
  // res.send("go to a new page");
  res.redirect('/urls');
});


// root path '/'; JSON string representing the entire urlDatabase object can see
// '/sth' --> route
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  // const templateVars = { greeting: 'Hello World!' };
  // res.render("hello_world", templateVars);
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // let userId = req.cookies['user_id'];
  let userId = req.session.user_id;
  // console.log("session", userId);
  // console.log('users', users);
  // console.log(users[userId]);
  const templateVars = {
    urls: urlsForUser(userId),
    user: users[userId],
    error: users[userId] ? null : "Please Login or Register first"
  };
  // console.log("error", userId);
  res.render("urls_index", templateVars);
});

const urlsForUser = function(id) {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
};

// if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter.
app.get("/urls/new", (req, res) => {
  // let userId = req.cookies['user_id'];
  let userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // let userId = req.cookies['user_id'];
  let userId = req.session.user_id;
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

app.get('/login', (req, res) => {
  let userId = req.session.user_id;
  const templateVars = {user: users[userId]};
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {user: null};
  res.render('register', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let userId = req.session.user_id;
  if (!users[userId]) {
    res.status(403).send('Not Found');
  } else {
    const deleteToggle = req.params.shortURL;
    delete urlDatabase[deleteToggle];
    res.redirect("/urls");
  }
});

app.post('/urls/:shortURL', (req, res) => {
  let userId = req.session.user_id;
  if (!users[userId]) {
    res.status(403).send('Not Found');
  } else {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  }
});



app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const userId = user ? user.id : null;
  if (!userId) {
    res.status(403).send('Not Found');
  }
  if (users[userId] && bcrypt.compareSync(password, users[userId].password)) {
    req.session.user_id = userId;
    // res.cookies('user_id', userId);
  } else {
    res.status(403).send('Forbidden');
  }

  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  req.session = null; //
  res.redirect("/urls");
});


app.post('/register', (req, res) => {
  const userId = newRandomId(6, chars);
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(req.body.email, users)) {
    const status = 400;
    res.status(status).send('error');
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

