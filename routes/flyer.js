const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const flyer_db = require('../src/db/flyer');
const auth = require('../middleware/auth')

router.post('/route/upsert', auth, async (req, res) => {
    try {
        const {id, polyline} = req.body;
        const client = await db.getConnection();
        await flyer_db.createFlyerRoute(client, id, polyline, (err, result) => {
            db.disconnect(client);
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

router.get('/route/distance', auth, async (req, res) => {
    try {
        const {latitude, longitude, distance, lastUpdate} = req.headers;
        const client = await db.getConnection();
        await flyer_db.getRoutesRange(client, latitude, longitude, distance, lastUpdate, (err, result) => {
            db.disconnect(client);
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

router.get('/route/all', auth, async (req, res) => {
    try {
        const client = await db.getConnection();
        await flyer_db.getAllRoutes(client,(err, result) => {
            db.disconnect(client);
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
