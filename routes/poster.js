const express = require('express');
const router = express.Router();
const db = require('../src/db/db')
const poster_db = require('../src/db/poster');
const auth = require('../middleware/auth')

router.post('/create', auth, async (req, res) => {
    try {
        const {latitude, longitude, campaign, poster_type, motive, target_groups, environment, other} = req.body;
        const poster = {latitude, longitude, campaign, poster_type, motive, target_groups, environment, other};
        const client = await db.getConnection();
        await poster_db.createPoster(client, poster, (err, result) => {
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
            id,
            hanging,
            latitude,
            longitude,
            campaign,
            poster_type,
            motive,
            target_groups,
            environment,
            other
        } = req.body;
        const poster = {
            id,
            hanging,
            latitude,
            longitude,
            campaign,
            poster_type,
            motive,
            target_groups,
            environment,
            other
        };
        const client = await db.getConnection();
        await poster_db.updatePoster(client, poster, (err, result) => {
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

router.get('/distance', auth, async (req, res) => {
    try {
        const {latitude, longitude, distance, hanging, last_update} = req.headers;
        console.log("Get Poster for:")
        console.log("Latitude: "+ latitude)
        console.log("Longitude: "+ longitude)
        console.log("distance: "+ distance)
        console.log("hanging: "+ hanging)
        console.log("last_update: "+ last_update)
        const client = await db.getConnection();
        await poster_db.getPosterInMeterRange(client, latitude, longitude, distance, hanging, last_update, (err, result) => {
            db.disconnect(client);
            console.log(result);
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
        const {hanging} = req.headers;
        const client = await db.getConnection();
        await poster_db.getAll(client, hanging, (err, result) => {
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

router.post('/import', auth, async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

module.exports = router;
