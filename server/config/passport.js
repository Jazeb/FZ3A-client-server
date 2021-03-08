const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local");
const passport = require("passport");
const bcrypt = require("bcrypt");
const _ = require("lodash");

const { Users } = require("../model/index");
const config = require("./keys");

const userLogin = new LocalStrategy({ usernameField: "email", passwordField: "email", passReqToCallback: true }, async (req, email, password, done) => {

    try {

        let { from_social, email, password } = req.body; // Boolean, is social media login?
        if (_.isEmpty(email))
            return done('email or password is missing', null);

        let users = await Users.findAll({ where: { email } });
        if (_.isEmpty(users))
            return done({ data: [], error: true, show: true, message: 'user does not exist' }, null);

        user = users[0];

        if (user.user_type == 'customer' && user.isSocial_login && !_.isEmpty(user.access_token)) {

            if (email && password && user.reset_password && !bcrypt.compareSync(password, user.password)) {
                return done({ data: [], error: true, message: 'invalid credentials', status: 401, show: true }, null);
            }
            else {
                return done(null, user)
            }
        } else {
            if (!bcrypt.compareSync(password, user.password))
                return done({ data: [], error: true, message: 'invalid credentials', status: 401, show: true }, null);
            else {
                delete user.password
                done(null, user);
            }
        }

        // let loggedIn = await GET(`session_id_${users[0].id}`);
        // if(!_.isEmpty(loggedIn) && loggedIn == users[0].email)
        //     return done({ data:[], error:true, show: true, message: 'You are already logged in' }, null);

        // set(`session_id_${users[0].id}`, users[0].email);
    } catch (err) {
        console.error(err)
        return done(err, null)
    }
});

const jwtLogin = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwtSecret,
    }, (payload, done) => {
        if (_.isEmpty(payload)) return done({ message: "Invalid api token {payload}" }, false);
        else done(null, payload);
    }
);

passport.use("user", userLogin);
passport.use(jwtLogin);

module.exports = passport;
