const {assert} = require('chai')
const {users, urlDatabase} = require('../appData')
const helperFunctions = require('../helper')
const {generateRandomString, emailLookUP, getUserId, urlsForUser, getUserByEmail} = helperFunctions(users, urlDatabase)



describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, users[expectedUserID])
  });

  it('should return undefined if the email does not exist', function() {
    const user = getUserByEmail("test@example.com", users)
    const expectedUserID = undefined;
    assert.deepEqual(user, users[expectedUserID])
  });
});

describe('emailLoopUp', () => {
  it('should return true if the email exist in the usersDB', () => {
    const result = emailLookUP("user2@example.com")
    assert.isTrue(result)
  })

  it('should return false if the email does not exist in the usersDB', () => {
    const result = emailLookUP("test@example.com")
    assert.isFalse(result)
  })
})

describe('getUserId', () => {
  it('should return the user id if email exist in userDB',() => {
    const userID = getUserId("user2@example.com")
    const result = "user2RandomID"
    assert.equal(userID, result)
  })

  it('should return undefined if email does not exist in userDB',() => {
    const userID = getUserId("test@example.com")
    const result = undefined
    assert.equal(userID, result)
  })
})

describe('urlsForUser', () => {
  it('should return the object containing authorized url for user ', () => {
    const authorizedURLs = urlsForUser("aJ48lW")
    const expected = {b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
      }}
    assert.deepEqual(authorizedURLs, expected)
  })

  it('should return the empty object if user does not have ny authorized urls', () => {
    const authorizedURLs = urlsForUser("user2RandomID")
    const expected = {}
    assert.deepEqual(authorizedURLs, expected)
  })

})