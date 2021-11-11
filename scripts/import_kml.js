const dotenv = require('dotenv');
// get config vars
dotenv.config();

const db = require("../src/db/db");
const poster_db = require("../src/db/poster");
const poster_tags_db = require("../src/db/poster_tags");
const randomColor = require('randomcolor');
const fs = require('fs');
const XmlReader = require('xml-reader');
const xmlQuery = require("xml-query");

let args = process.argv.slice(2);
console.log("Trying to import file: " + args[0]);
fs.readFile(args[0], 'utf-8', async function (err, data) {
    if (err)
        console.log("Could not read kml file");
    else {
        const ast = XmlReader.parseSync(data);
        const motives = new Set();
        const campaigns = new Set();
        const environments = new Set();
        const target_groups = new Set();
        const types = new Set();

        const posterList = [];
        xmlQuery(ast).find('Document').children().each(node => {
            const motive = xmlQuery(node).find('name').text();
            if (motive !== 'undefined' && motive && motive != '') {
                motives.add(motive);
            }
            let cdata = xmlQuery(node).find('description').text();
            cdata = cdata.replace(/^<\!\[CDATA\[|\]\]>$/g, '').trim();
            let csv = cdata.split(";");
            let campaign = csv[7];
            let type = csv[8];
            if (campaign && campaign != '')
                campaigns.add(campaign);
            if (type && type != '')
                types.add(type);
            let environment = csv[10].split(",");
            let targetGroup = csv[10].split(",");
            for (const env of environment) {
                if (!env)
                    environments.add(env);
            }
            for (const tg of targetGroup) {
                if (!tg)
                    target_groups.add(tg);
            }
            const point = xmlQuery(node).find('Point').text();
            const poster = {
                latitude: point.split(",")[1],
                longitude: point.split(",")[0],
                campaign: campaign === 'undefined' || campaign === '' ? [] : [campaign],
                poster_type: type === 'undefined' || type === '' ? [] : [type],
                motive: motive === 'undefined' || motive === '' ? [] : [motive],
                target_groups: targetGroup.length === 0 || targetGroup[0] === '' || targetGroup[0] === 'undefined' || targetGroup[0] === undefined ? [] : targetGroup,
                environment: environment.length === 0 || environment[0] === '' || environment[0] === 'undefined' || environment[0] === undefined ? [] : environment,
                other: []
            }
            posterList.push(poster);
        });
        console.log("Getting connection ...");
        const client = await db.getConnection();
        console.log("Connected ...");
        printBars();
        const mapMotiveUuidToName = new Map();
        const mapCampaignUuidToName = new Map();
        const mapEnvironmentUuidToName = new Map();
        const mapTargetGroupsUuidToName = new Map();
        const mapTypesUuidToName = new Map();
        await db.retryTxn(0, 15, client, async (client, callback) => {
            console.log("Starting Poster Tag import");

            for (const motive of motives) {
                await poster_tags_db.importTags(client, "poster_motive", motive, motive, false, randomColor(), (err, result) => {
                    mapMotiveUuidToName.set(motive, result.rows[0].id);
                    console.log("Imported Poster Motives " + (mapMotiveUuidToName.size) + "/" + motives.size + " " + ((mapMotiveUuidToName.size / motives.size) * 100) + "%");
                    callback(err, result);
                });
            }
            for (const campaign of campaigns) {
                await poster_tags_db.importTags(client, "poster_campaign", campaign, campaign, false, randomColor(), (err, result) => {
                    mapCampaignUuidToName.set(campaign, result.rows[0].id);
                    console.log("Imported Poster Campaigns " + (mapCampaignUuidToName.size) + "/" + campaigns.size + " " + ((mapCampaignUuidToName.size / campaigns.size) * 100) + "%");
                    callback(err, result);
                });
            }
            for (const environment of environments) {
                await poster_tags_db.importTags(client, "poster_environment", environment, environment, false, randomColor(), (err, result) => {
                    mapEnvironmentUuidToName.set(environment, result.rows[0].id);
                    console.log("Imported Poster Environments " + (mapEnvironmentUuidToName.size) + "/" + environments.size + " " + ((mapEnvironmentUuidToName.size / environments.size) * 100) + "%");
                    callback(err, result);
                });
            }
            for (const tg of target_groups) {
                await poster_tags_db.importTags(client, "poster_target_groups", tg, tg, false, randomColor(), (err, result) => {
                    mapTargetGroupsUuidToName.set(tg, result.rows[0].id);
                    console.log("Imported Poster Target Groups " + (mapTargetGroupsUuidToName.size) + "/" + target_groups.size + " " + ((mapTargetGroupsUuidToName.size / target_groups.size) * 100) + "%");
                    callback(err, result);
                });
            }
            for (const type of types) {
                await poster_tags_db.importTags(client, "poster_type", type, type, false, randomColor(), (err, result) => {
                    mapTypesUuidToName.set(type, result.rows[0].id);
                    console.log("Imported Poster Type " + (mapTypesUuidToName.size) + "/" + types.size + " " + ((mapTypesUuidToName.size / types.size) * 100) + "%");
                    callback(err, result);
                });
            }
            console.log("Starting Transaction...")
        }, (err, _) => {
            if (err) {
                console.log("Import failed:" + err);
            }
        });
        console.log("Imported Poster Tags");
        printBars();
        printBars();
        printBars();
        await db.retryTxn(0, 15, client, async (client, callback) => {
            const uuidExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

            for (const poster of posterList) {
                for (let i = 0; i < poster.motive.length; i++) {
                    const mapMotive = mapMotiveUuidToName.get(poster.motive[i])
                    if (mapMotive != '' || mapMotive != undefined || mapMotive != 'undefined' || !mapMotive)
                        poster.motive[i] = mapMotive;
                }
                for (let i = 0; i < poster.campaign.length; i++) {
                    const mapCampaign = mapCampaignUuidToName.get(poster.campaign[i])
                    if (mapCampaign != '' || mapCampaign != undefined || mapCampaign != 'undefined' || !mapCampaign)
                        poster.campaign[i] = mapCampaign;
                }
                for (let i = 0; i < poster.environment.length; i++) {
                    const mapEnvironment = mapEnvironmentUuidToName.get(poster.environment[i])
                    if (mapEnvironment != '' || mapEnvironment != undefined || mapEnvironment != 'undefined' || !mapEnvironment)
                        poster.environment[i] = mapEnvironment;
                }
                for (let i = 0; i < poster.target_groups.length; i++) {
                    const mapTargetGroups = mapTargetGroupsUuidToName.get(poster.target_groups[i])
                    if (mapTargetGroups != '' || mapTargetGroups != undefined || mapTargetGroups != 'undefined' || !mapTargetGroups)
                        poster.target_groups[i] = mapTargetGroups;
                }
                for (let i = 0; i < poster.poster_type.length; i++) {
                    const mapType = mapTypesUuidToName.get(poster.poster_type[i])
                    if (mapType != '' || mapType != undefined || mapType != 'undefined' || !mapType)
                        poster.poster_type[i] = mapType;
                }
                poster.motive = poster.motive.filter(e => uuidExp.test(e))
                poster.campaign = poster.campaign.filter(e => uuidExp.test(e))
                poster.environment = poster.environment.filter(e => uuidExp.test(e))
                poster.target_groups = poster.target_groups.filter(e => uuidExp.test(e))
                poster.poster_type = poster.poster_type.filter(e => uuidExp.test(e))
                await poster_db.createPoster(client, poster, callback);
                console.log("Imported Poster " + posterList.indexOf(poster) + "/" + posterList.length + " " + ((posterList.indexOf(poster) / posterList.length) * 100) + "%");
            }
            console.log("Starting Transaction...");
        }, (err, _) => {
            if (err) {
                console.log("Import failed:" + err);
            }
        })
        printBars();
        console.log("Imported Posters");
        await db.disconnect(client);
        printBars();
        console.log("Import finished");
    }
});

function printBars() {
    console.log("################");
}
