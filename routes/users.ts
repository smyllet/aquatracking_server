import Router from 'express';

import UserModel from "../model/UserModel";
import UserTokenUtil from "../utils/UserTokenUtil";
import UsernameAlreadyExistError from "../errors/UsernameAlreadyExistError";
import EmailAlreadyExistError from "../errors/EmailAlreadyExistError";
import WrongPasswordError from "../errors/WrongPasswordError";
import NotFoundError from "../errors/NotFoundError";
import MailSender from "../agents/MailSender";

const router = Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* Post users registration. */
router.post('/', function (req, res, next) {
    if(process.env.REGISTRATION_ENABLED === 'true') {
        if(!req.body.username || !req.body.email || !req.body.password || req.body.username === '' || req.body.email === '' || req.body.password === '') {
            res.status(400).send('MISSING PARAMETERS');
        } else {
            UserModel.register(req.body.username, req.body.email, req.body.password).then(r => {
                res.send(r);
            }).catch(e => {
                if(e instanceof UsernameAlreadyExistError) {
                    res.status(409).send("USER ALREADY EXISTS");
                } else if(e instanceof EmailAlreadyExistError) {
                    res.status(409).send("EMAIL ALREADY EXISTS");
                } else res.status(500).send();
            })
        }
    } else {
        res.status(403).send("REGISTRATION IS DISABLED");
    }
});

/* Post users login. */
router.post('/login', function (req, res, next) {
    if(!req.body.email || !req.body.password || req.body.email === '' || req.body.password === '') {
        res.status(400).send('MISSING PARAMETERS');
    } else {
        UserModel.login(req.body.email, req.body.password).then(r => {
            res.cookie('access_token', UserTokenUtil.generateAccessToken(r), {maxAge: 1000 * 60 * 30});
            res.cookie('refresh_token', UserTokenUtil.generateRefreshToken(r), {maxAge: 1000 * 60 * 60 * 24 * 7 * 365});
            res.send(r);

            MailSender.send(r.email, `Nouvelle connexion ?? votre compte`, `Bonjour ${r.username},\n\nUne nouvelle connexion a ??t?? effectu??e sur votre compte depuis l'adresse IP ${req.ip}.\n\nCordialement,\nL'??quipe AquaTracking`);
        }).catch(e => {
            if(e instanceof WrongPasswordError) {
                res.status(401).send("WRONG PASSWORD");
                MailSender.send(req.body.email, `Tentative de connexion ?? votre compte`, `Bonjour,\n\nUne tentative de connexion a ??t?? effectu??e sur votre compte depuis l'adresse IP ${req.ip}.\n\nCordialement,\nL'??quipe AquaTracking`);
            } else if (e instanceof NotFoundError) {
                res.status(404).send("USER NOT FOUND");
            } else res.status(500).send();
        });
    }
});

module.exports = router;
