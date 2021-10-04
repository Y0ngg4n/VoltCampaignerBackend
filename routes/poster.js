const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const poster_db = require('../src/db/poster');

router.post('/create', async (req, res) => {
    try {
        const {latitude, longitude, poster_type, motive, target_groups, environment, other} = req.body;
        const poster = {latitude, longitude, poster_type, motive, target_groups, environment, other};
        await poster_db.createPoster(await db.getConnection(), poster, (value) => {
            if (value instanceof Error) {
                return res.status(401).send({error: value.message});
            } else {
                return res.status(201).send();
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.post('/update', async (req, res) => {
    try {
        const {uuid, latitude, longitude, poster_type, motive, target_groups, environment, other} = req.body;
        const poster = {uuid, latitude, longitude, poster_type, motive, target_groups, environment, other};
        await poster_db.updatePoster(await db.getConnection(), poster, (value) => {
            if (value instanceof Error) {
                return res.status(401).send({error: value.message});
            } else {
                return res.status(201).send();
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/distance', async (req, res) => {
    try {
        const {latitude, longitude, distance, hanging} = req.headers;
        await poster_db.getPosterInMeterRange(await db.getConnection(), latitude, longitude, distance, hanging, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(201).send(result.rows);
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

module.exports = router;
