// const urlsForUser = function(id) {
//   let result = {};
//   for (let shortURL in urlDatabase) {
//     if (urlDatabase[shortURL].userID === id) {
//       result[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return result;
// };

const getUserByEmail = function(email, database) {
  let user = null;
  for (let userId in database) {
    if (database[userId].email === email) {
      user = database[userId];
    }
  }
  return user;
};

module.exports = { getUserByEmail };