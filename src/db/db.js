const {Pool} = require("pg");
const {v4: uuidv4} = require("uuid");

var config = {
    user: 'volt_campaigner',
    host: 'localhost',
    database: 'volt_campaigner',
    port: 26257
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
    const createTypeTable =
        "CREATE TABLE IF NOT EXISTS poster_type (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING)";
    const createMotiveTable =
        "CREATE TABLE IF NOT EXISTS poster_motive (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING)";
    const createTargetGroupsTable =
        "CREATE TABLE IF NOT EXISTS poster_target_groups (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING)";
    const createEnvironmentTable =
        "CREATE TABLE IF NOT EXISTS poster_environment (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING)";
    const createOtherTable =
        "CREATE TABLE IF NOT EXISTS poster_other (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, description STRING)";
    const createPosterTable =
        "CREATE TABLE IF NOT EXISTS poster (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, hanging BOOL DEFAULT true, latitude FLOAT NOT NULL, longitude FLOAT NOT NULL, poster_type UUID[], motive UUID[], target_groups UUID[], environment UUID[], other UUID[])";
    await client.query(createTypeTable, callback);
    await client.query(createMotiveTable, callback);
    await client.query(createTargetGroupsTable, callback);
    await client.query(createEnvironmentTable, callback);
    await client.query(createOtherTable, callback);
    await client.query(createPosterTable, callback);
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
