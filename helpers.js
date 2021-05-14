const urlsForUser = function(id, database) {
  let result = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      result[shortURL] = database[shortURL];
    }
  }
  return result;
};

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomValue = function(length, arr = chars) {
  let random = '';
  for (let i = length; i > 0; i--) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
};


const getUserByEmail = function(email, database) {
  let user = undefined;
  for (let userId in database) {
    if (database[userId].email === email) {
      user = database[userId];
    }
  }
  return user;
};

module.exports = { getUserByEmail, randomValue, urlsForUser };