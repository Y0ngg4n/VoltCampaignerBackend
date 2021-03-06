const {Pool} = require("pg");
const fs = require('fs')
var path = require('path');

var config = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.join(process.env.CERT_DIR ,'ca.crt')).toString(),
        key: fs.readFileSync(path.join(process.env.CERT_DIR, 'client.volt_campaigner.key')).toString(),
        cert: fs.readFileSync(path.join(process.env.CERT_DIR, 'client.volt_campaigner.crt')).toString(),
    }
};

const pool = new Pool(config);

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
    const tags = ['poster_campaign', "poster_type", "poster_motive", "poster_target_groups", "poster_environment",
        "poster_other"]
    // Poster
    for (let i = 0; i < tags.length; i++) {
        const createCampaignTable =
            "CREATE TABLE IF NOT EXISTS " + tags[i] + " (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description_en STRING, " +
            "description_de STRING, description_es STRING, description_pt STRING, description_fr STRING, description_it STRING, description_nl STRING, " +
            "description_da STRING, description_dv STRING, description_sv STRING, description_nb STRING, description_fi STRING, description_mt STRING, " +
            "description_ru STRING, description_tr STRING, description_ar STRING, active BOOL DEFAULT true, color STRING)";
        await client.query(createCampaignTable, callback);
    }
    const createPosterTable =
        "CREATE TABLE IF NOT EXISTS poster (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, hanging INT DEFAULT 0, " +
        "location GEOGRAPHY, campaign UUID[] DEFAULT ARRAY[], poster_type UUID[] DEFAULT ARRAY[], motive UUID[] DEFAULT ARRAY[], target_groups UUID[] DEFAULT ARRAY[], " +
        "environment UUID[] DEFAULT ARRAY[], other UUID[] DEFAULT ARRAY[], last_update TIMESTAMP DEFAULT now(), account STRING);";
    const createPosterIndex = "CREATE INDEX IF NOT EXISTS poster_location ON poster using GIST(location);"
    await client.query(createPosterTable, callback);
    await client.query(createPosterIndex, callback);

    const createPlacemarkTable =
        "CREATE TABLE IF NOT EXISTS placemark (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, type INT DEFAULT 0, " +
        "location GEOGRAPHY, title STRING, description STRING, last_update TIMESTAMP DEFAULT now(), account STRING);";
    const createPlacemarkIndex = "CREATE INDEX IF NOT EXISTS placemark_location ON placemark using GIST(location);"
    await client.query(createPlacemarkTable, callback);
    await client.query(createPlacemarkIndex, callback);

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
    let connection;
    let n = 0;
    do{
        connection = await pool.connect();
        if(connection instanceof Error|| !connection)
            await new Promise((r) => setTimeout(r, 2 ** n * 1000));
        n++;
    }while((connection instanceof Error || !connection) && n < 20)

    return connection;
}

async function disconnect(client) {
    client.release();
}

module.exports = {
    getConnection,
    disconnect,
    retryTxn,
    initTable,
}
