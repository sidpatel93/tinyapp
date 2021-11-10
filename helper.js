// ======== Helper functions ===========
const helperFunctions = (usersDB, urlDB) => {

  const getUserByEmail = (email) => {
    for (let user in usersDB) {
      if (usersDB[user].email === email) {
        return usersDB[user];
      }
    }
  };

  const generateRandomString = () => {
    return Math.random().toString(36).substr(2, 6);
  };
  
  const emailLookUP = (email) => {
    for (let user in usersDB) {
      
      if (usersDB[user].email === email) {
        return true;
      }
    }
    return false;
  };
  
  const getUserId = (email) => {
    for (let user in usersDB) {
      if (usersDB[user].email === email) {
        return usersDB[user].id;
      }
    }
  };
  
  const urlsForUser = (userID) => {
    const authorizedURLs = {};
    for (let url in urlDB) {
      if (urlDB[url]['userID'] === userID) {
        authorizedURLs[url] = urlDB[url];
      }
    }
    return authorizedURLs;
  };

  return {generateRandomString, emailLookUP, getUserId, urlsForUser, getUserByEmail};

};

module.exports = helperFunctions;
