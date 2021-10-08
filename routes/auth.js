const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const https = require('https');

router.post('/login', (req, res) => {
    const {auth_token} = req.body;
    https.get({
        host: "www.googleapis.com",
        path: "/oauth2/v1/tokeninfo",
        headers: {access_token: auth_token}
    }, function (result) {
        if(result.statusCode === 200){
            const token = generateAccessToken({apiSecret: auth_token});
            res.status(200).json({token: token});
        }else{
            res.status(401).send("Invalid access Token");
        }
    });
});

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '24h'});
}

module.exports = router;
