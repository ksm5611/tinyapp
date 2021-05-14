const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { getUserByEmail, randomValue, urlsForUser } = require('./helpers');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const newString = randomValue(6);
  urlDatabase[newString] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId],
    error: users[userId] ? null : "Please Login or Register first"
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
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
    // eslint-disable-next-line
    req.session.user_id = userId;
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
  const userId = randomValue(6);
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
  // eslint-disable-next-line
  req.session.user_id = userId;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

