const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport) {
  const authenticateUser = async () => {
    
    
        return done(null, user)
      
  }

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser))
//   passport.serializeUser((user, done) => done(null, user.id))
//   passport.deserializeUser((id, done) => {
//     return done(null, getUserById(id))
//   })
}

module.exports = initialize