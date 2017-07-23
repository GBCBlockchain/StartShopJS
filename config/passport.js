const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((user, done) => {
   User.findById(id, (err, user) => {
      done(err, user);
   });
});

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    req.checkBody('email', 'Invalid email!').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password!').notEmpty().isLength({min: 8});

    const errors = req.validationErrors();

    if (errors) {
        const messages = [];

        errors.forEach((error) => {
           messages.push(error.msg);
        });

        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use!'});
        }

        const newUser = new User();
          newUser.email = email;
          newUser.password = newUser.encryptPassword(password);
          newUser.save((err, result) => {
             if (err) {
                 return done(err);
             }
             return done(null, newUser);
          });
    })
}));