const express = require('express');
const router = express.Router();
const poster_tags_db = require("../src/db/poster_tags");
const db = require("../src/db/db");
const auth = require('../middleware/auth')

router.get('/:posterRoute', auth, async (req, res) => {
    try {

        let tableName;
        switch (req.params.posterRoute) {
            case 'campaign':
                tableName = "poster_campaign";
                break;
            case 'type':
                tableName = "poster_type";
                break;
            case 'motive':
                tableName = 'poster_motive';
                break;
            case 'target-groups':
                tableName = 'poster_target_groups'
                break;
            case 'environment':
                tableName = 'poster_environment'
                break;
            case 'other':
                tableName = 'poster_other';
        }
        if (!tableName) {
            return res.status(401).send({error: "Not a valid route"});
        }
        const client = await db.getConnection();
        await poster_tags_db.getTags(client, tableName, (err, result) => {
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
