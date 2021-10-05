const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const poster_db = require('../src/db/poster');

router.post('/create', async (req, res) => {
    try {
        const {latitude, longitude, poster_type, motive, target_groups, environment, other} = req.body;
        const poster = {latitude, longitude, poster_type, motive, target_groups, environment, other};
        await poster_db.createPoster(await db.getConnection(), poster, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(201).send(result.rows[0]);
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.post('/update', async (req, res) => {
    try {
        const {id, hanging, latitude, longitude, poster_type, motive, target_groups, environment, other} = req.body;
        const poster = {id, hanging, latitude, longitude, poster_type, motive, target_groups, environment, other};
        await poster_db.updatePoster(await db.getConnection(), poster, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(201).send(result.rows[0]);
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/distance', async (req, res) => {
    try {
        const {latitude, longitude, distance, hanging, last_update} = req.headers;
        await poster_db.getPosterInMeterRange(await db.getConnection(), latitude, longitude, distance, hanging, last_update, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(200).send(result.rows);
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/all', async (req, res) => {
    try {
        const {hanging} = req.headers;
        await poster_db.getAll(await db.getConnection(), hanging, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(200).send(result.rows);
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

module.exports = router;
