const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const placemark_db = require('../src/db/placemark');
const auth = require('../middleware/auth')

router.post('/create', auth, async (req, res) => {
    try {
        const {latitude, longitude, title, description, type} = req.body;
        const placemark = {latitude, longitude, title, description, type};
        const client = await db.getConnection();
        await placemark_db.createPlacemark(client, placemark, (err, result) => {
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

router.post('/update', auth, async (req, res) => {
    try {
        const {
            id, latitude, longitude, title, description, type
        } = req.body;
        const placemark = {
            id, latitude, longitude, title, description, type
        };
        const client = await db.getConnection();
        await placemark_db.updatePlacemark(client, placemark, (err, result) => {
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

router.post('/delete', auth, async (req, res) => {
    try {
        const {id} = req.body;
        const client = await db.getConnection();
        await placemark_db.deletePlacemark(client, id, (err, result) => {
            db.disconnect(client);
            if (err) {
                return res.status(401).send({error: err.message});
            } else {
                return res.status(201).send();
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/distance', auth, async (req, res) => {
    try {
        const {latitude, longitude, distance} = req.headers;
        const client = await db.getConnection();
        await placemark_db.getPlacemarkInMeterRange(client, latitude, longitude, distance, (err, result) => {
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

router.get('/all', auth, async (req, res) => {
    try {
        const client = await db.getConnection();
        await placemark_db.getAll(client, (err, result) => {
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

module.exports = router;
