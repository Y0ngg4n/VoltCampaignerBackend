const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const area_db = require('../src/db/area');
const auth = require("../middleware/auth");

router.post('/create', auth, async (req, res) => {
    try {
        const {id, name, points, max_poster} = req.body;
        const area = {id, name, points, max_poster};
        const client = await db.getConnection();
        await area_db.createArea(client, area, (err, result) => {
            db.disconnect(client)
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
        const client = await db.getConnection();
        await area_db.getAreasRange(client, latitude, longitude, distance, last_update, (err, result) => {
            db.disconnect(client)
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

router.get('/all', auth, async (req, res) => {
    try {
        const {} = req.headers;
        const client = await db.getConnection();
        await area_db.getAreasAll(client, (err, result) => {
            db.disconnect(client)
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
        const client = await db.getConnection();
        await area_db.getAreaContains(client, latitude, longitude, last_update, (err, result) => {
            db.disconnect(client)
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

router.get('/contains-limits', auth, async (req, res) => {
    try {
        const {latitude, longitude, last_update} = req.headers;
        const client = await db.getConnection();
        await area_db.getAreaContains(client, latitude, longitude, last_update, async (err, result) => {
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                let areas = []
                for (let i = 0; i < result.rows.length; i++) {
                    await area_db.getAreaContainsLimits(client, result.rows[i], last_update, (err2, result2) => {
                        let merged = {
                            hanging: result2.rows.length,
                            id: result.rows[i].id,
                            name: result.rows[i].name,
                            max_poster: result.rows[i].max_poster
                        };
                        areas.push(merged);
                        if (i === result.rows.length - 1) {
                            db.disconnect(client)
                            return res.status(200).send(areas);
                        }
                    })
                }
                if(result.rows.length <= 0){
                    db.disconnect(client);
                    return res.status(200).send(areas);
                }
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
        const client = await db.getConnection();
        await area_db.deleteArea(client, id, (err, result) => {
            db.disconnect(client)
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
