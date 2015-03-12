//== load all the thing we need
var localStategy = require('passport-local').Strategy;

//== load up the user model
var userM = require('../models/users');

//== load the auth variables

module.exports = function(passport){
    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    })

    //used to deserialize the user
    passport.deserializeUser(function (id, done) {
        userM.findById(id, function (err, user) {
            done(err, user);
        });
    })

    //=== local login
    passport.use('local-login', new localStategy({
        //by default, local strategy uses username and password, we will override with email.
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req form our route( lets us check if the user is logged in or not)
    }, function (req, email, password, done) {

    }));

//=== local signup
    passport.use('local-signUp', new localStategy({
        // by default local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, next) {
        if(email)
            email = email.toLowerCase();

        //asynchronous
        process.nextTick(function () {
            //validate user's input
            if(email !== '' && validateEmail(email));
            else{
                return next(null, false, req.flash('signUpMessage', 'that email is invalid'));
            }

            if(password !== '');
            else{
                return next(null, false, req.flash('signUpMessage', 'that password is invalid'));
            }

            //if the user is not already logged in
            if(!req.user){
                userM.findOne({'local.email': email}, function (err, user) {
                    if(err) next(err);
                    //check to see if there is already a user with that email
                    if(user){
                        return next(null, false, req.flash('signUpMessage','That email is already taken.'));
                    }else{
                        var newUser = new userM();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.name = req.body.name;
                        newUser.birthday = req.body.birthday;
                        newUser.birthplace = req.body.birthplace;
                        newUser.dateOfRegistration = Date();

                        newUser.save(function (err) {
                            if(err) return next(err);
                            return next(null, newUser);
                        });
                    }
                });
            }else if(!req.user.local.email){ //if the user is logged but has no local account
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                userM.findOne({'local.email': email}, function (err, user) {
                    if(err) next(err);
                    if(user){
                        return next(null, false, req.flash('signInMessage', 'that email is already taken'));
                    }else{
                        var newUser = new userM();
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.name = req.body.name;
                        newUser.birthday = req.body.birthday;
                        newUser.birthplace = req.body.birthplace;
                        newUser.dateOfRegistration = Date();

                        newUser.save(function (err) {
                            if(err) return next(err);
                            return next(null, newUser);
                        });
                    }
                });
            }else{
                //user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return next(null, req.user);
            }
        });
    }));

    //=== local signIn
    passport.use('local-signIn', new localStategy({
        // by default local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, next) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        if(email !== '' && validateEmail(email));
        else{
            return next(null, false, req.flash('signUpMessage', 'that email is invalid'));
        }

        process.nextTick(function(){
            userM.findOne({'local.email': email}, function (err, user) {
                if(err) next(err);
                if(!user){
                    console.log('no user found');
                    return next(null, false, req.flash('signInMessage', 'No user found.'));
                }
                if(!user.validPassword(password))
                    return next(null, false, req.flash('signInMessage', 'Oops! wrong password.'));

                //all is well, return the user
                next(null, user);
            });
        });

    }));
};

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePassword(pwd){
    /*
     This regex will enforce these rules:
     At least one upper case english letter
     At least one lower case english letter
     At least one digit
     At least one special character
     Minimum 8 in length
     */
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(pwd);
}

function validateDate(date){
    //This code will validate date format DD/MM/YY
    //return /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{2}$/.test(date);


    //This is working for me for MM/dd/yyyy.
    return /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/.test(date);
}

































