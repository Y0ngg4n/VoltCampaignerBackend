const {Pool} = require("pg");
const fs = require('fs')

var config = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync('/run/secrets/ca.crt').toString(),
        key: fs.readFileSync('/run/secrets/node.key').toString(),
        cert: fs.readFileSync('/run/secrets/node.crt').toString(),
    }
};

const pool = new Pool(config);
let client;

// Wrapper for a transaction.  This automatically re-calls the operation with
// the client as an argument as long as the database server asks for
// the transaction to be retried.
async function retryTxn(n, max, client, operation, callback) {
    await client.query("BEGIN;");
    while (true) {
        n++;
        if (n === max) {
            throw new Error("Max retry count reached.");
        }
        try {
            await operation(client, callback);
            await client.query("COMMIT;");
            return;
        } catch (err) {
            if (err.code !== "40001") {
                return callback(err);
            } else {
                console.log("Transaction failed. Retrying transaction.");
                console.log(err.message);
                await client.query("ROLLBACK;", () => {
                    console.log("Rolling back transaction.");
                });
                await new Promise((r) => setTimeout(r, 2 ** n * 1000));
            }
        }
    }
}

// This function is called within the first transaction. It inserts some initial values into the "accounts" table.
async function initTable(client, callback) {
    console.log("Creating Tables ...")
    // Poster
    const createCampaignTable =
        "CREATE TABLE IF NOT EXISTS poster_campaign (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createTypeTable =
        "CREATE TABLE IF NOT EXISTS poster_type (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createMotiveTable =
        "CREATE TABLE IF NOT EXISTS poster_motive (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createTargetGroupsTable =
        "CREATE TABLE IF NOT EXISTS poster_target_groups (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createEnvironmentTable =
        "CREATE TABLE IF NOT EXISTS poster_environment (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createOtherTable =
        "CREATE TABLE IF NOT EXISTS poster_other (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING, active BOOL DEFAULT true)";
    const createPosterTable =
        "CREATE TABLE IF NOT EXISTS poster (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, hanging INT DEFAULT 0, " +
        "location GEOGRAPHY, campaign UUID[] DEFAULT ARRAY[], poster_type UUID[] DEFAULT ARRAY[], motive UUID[] DEFAULT ARRAY[], target_groups UUID[] DEFAULT ARRAY[], " +
        "environment UUID[] DEFAULT ARRAY[], other UUID[] DEFAULT ARRAY[], last_update TIMESTAMP DEFAULT now(), account STRING);";

    const createPosterIndex = "CREATE INDEX IF NOT EXISTS poster_location ON poster using GIST(location);"
    await client.query(createCampaignTable, callback);
    await client.query(createTypeTable, callback);
    await client.query(createMotiveTable, callback);
    await client.query(createTargetGroupsTable, callback);
    await client.query(createEnvironmentTable, callback);
    await client.query(createOtherTable, callback);
    await client.query(createPosterTable, callback);
    await client.query(createPosterIndex, callback);

    const createFlyerRouteTable =
        "CREATE TABLE IF NOT EXISTS flyer_route (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, points GEOGRAPHY, " +
        "template BOOL DEFAULT false, last_update TIMESTAMP DEFAULT now(), account STRING);";
    const createFlyerRouteIndex = "CREATE INDEX IF NOT EXISTS flyer_route_points ON flyer_route using GIST(points);"
    await client.query(createFlyerRouteTable, callback);
    await client.query(createFlyerRouteIndex, callback);

    const createAreaTable =
        "CREATE TABLE IF NOT EXISTS area (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name STRING, points GEOGRAPHY, max_poster INT, last_update TIMESTAMP DEFAULT now());";
    const createAreaIndex = "CREATE INDEX IF NOT EXISTS area_points ON area using GIST(points);"
    await client.query(createAreaTable, callback);
    await client.query(createAreaIndex, callback);
    console.log("After Init Tables")
}

async function getConnection() {
    // Connect to database
    if (!client)
        client = await pool.connect();
    return client;
}

module.exports = {
    getConnection,
    retryTxn,
    initTable,
}
