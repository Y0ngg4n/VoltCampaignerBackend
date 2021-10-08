const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const {api_secret} = req.body;
    if (api_secret === process.env.API_SECRET) {
        const token = generateAccessToken({clientId: api_secret});
        res.status(201).json({token: token});
    } else {
        res.status(403).send("Wrong Secrets");
    }
});

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn: '24h'});
}

module.exports = router;
