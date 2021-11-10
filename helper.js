// ======== Helper functions ===========
const helperFunctions = (usersDB, urlDB) => {

  function getUserByEmail(email) {
    for(user in usersDB){
      if(usersDB[user].email === email){
        return usersDB[user]
      }
    }
  }

  function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
  }
  
  function emailLookUP(email){
    for(user in usersDB){
      
      if(usersDB[user].email === email){
        return true
      }
    }
    return false
  }
  
  function getUserId(email){
    for(user in usersDB){
      if(usersDB[user].email === email){
        return usersDB[user].id
      }
    }
  }
  
  function urlsForUser(userID){
    const authorizedURLs = {}
    for(url in urlDB){
      if(urlDB[url]['userID'] === userID){
        authorizedURLs[url] = urlDB[url]
      }
    }
    return authorizedURLs
  }

  return {generateRandomString, emailLookUP, getUserId, urlsForUser, getUserByEmail}

}

module.exports = helperFunctions
