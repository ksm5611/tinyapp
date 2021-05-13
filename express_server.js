const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));  //middleware
app.use(cookieParser());
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const newString = generateRandomString(6, chars);
  urlDatabase[newString] = req.body.longURL;
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
  let userId = req.cookies['user_id'];
  // console.log('users', users);
  // console.log(users[userId]);
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

// if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...) because Express will think that new is a route parameter.
app.get("/urls/new", (req, res) => {
  let userId = req.cookies['user_id'];
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], user: users[userId] };
  res.render("urls_show", templateVars);
});

app.get('/login', (req, res) => {
  let userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {user: null};
  res.render('register', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const deleteToggle = req.params.shortURL;
  delete urlDatabase[deleteToggle];
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});


const findUserIdByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return null;
};

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserIdByEmail(email);
  if (!userId) {
    res.status(403).send('Not Found');
  }
  if (users[userId] && password === users[userId].password) {
    res.cookie('user_id', userId);
  } else {
    res.status(403).send('Forbidden');
  }

  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


app.post('/register', (req, res) => {
  const userId = newRandomId(6, chars);
  // console.log(users);

  if (req.body.email === '' || req.body.password === '' || findExistingEmail(req.body.email)) {
    const status = 400;
    res
      .status(status)
      .send('error');
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: req.body.password
    };
  }

  res.cookie('user_id', userId);
  res.redirect("/urls");
});

// true, false
const findExistingEmail = function(email) {
  for (let user in users) {
    // console.log('user', users[user])
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

