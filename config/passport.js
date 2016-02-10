var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy(
    function (username, password, done)
    {
        User.findOne({ username: username }, function(err, user)
        {
            if(err) {return done(err); }
            if(!user)
            {
                return done(null, false, { message: 'Incorrect username.' });
            }//end if
            if(!user.validPassword(password))
            {
                return done(null, false, { message: 'Incorrect password.' });
            }//end if
            return done(null, user);
        });//end User.findOne
    }
));//end passport.use
