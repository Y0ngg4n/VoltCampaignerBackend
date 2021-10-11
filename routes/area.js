const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const area_db = require('../src/db/area');
const auth = require("../middleware/auth");

router.post('/create', auth, async (req, res) => {
    try {
        const {id, name, points, max_poster} = req.body;
        const area = {id, name, points, max_poster};
        await area_db.createArea(await db.getConnection(), area, (err, result) => {
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

router.get('/distance', auth, async (req, res) => {
    try {
        const {latitude, longitude, distance, last_update} = req.headers;
        await area_db.getAreasRange(await db.getConnection(), latitude, longitude, distance, last_update, (err, result) => {
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

router.get('/contains', auth, async (req, res) => {
    try {
        const {latitude, longitude, last_update} = req.headers;
        await area_db.getAreaContains(await db.getConnection(), latitude, longitude, last_update, (err, result) => {
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

router.get('/delete', auth, async (req, res) => {
    try {
        const {id} = req.headers;
        await area_db.deleteArea(await db.getConnection(), id, (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(200).send();
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

module.exports = router
