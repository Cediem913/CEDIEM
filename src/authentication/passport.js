const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'id_user'
}, async (email, password, done) => {
    const fields = ['id_user', 'Email', 'Secret'];
    const filter = { id_user: id_user };

    const user = User.findAll({
        attributes: fields,
        where: filter
    });

    if (!user) {
        return done(null, false, { message: 'El suario no existe' });
    } else {
        const match = await User.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Contraseña inválida' });
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.find({ where: { id_usuario: id } }, (err, user) => {
        done(err, user);
    });
});