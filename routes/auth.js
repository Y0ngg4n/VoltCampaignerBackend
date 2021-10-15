const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const auth = require('../middleware/auth')

router.post('/login', async (req, res) => {
    const {auth_token} = req.body;
    const result = await axios({
        method: 'get',
        url: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
        params: {
            access_token: auth_token,
        }
    });

    if (result.status === 200) {
        const token = generateAccessToken({apiSecret: auth_token});
        res.status(200).json({token: token});
    } else {
        res.status(401).send("Invalid access Token");
    }
});

router.post('/volunteer-login', auth, async (req, res) => {
    const token = generateAccessToken({volunteer: "volunteer"});
    res.status(200).json({token: token});
});

router.post('/validate', auth, async (req, res) => {
    res.status(200).send();
});

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '14d'});
}

module.exports = router;
