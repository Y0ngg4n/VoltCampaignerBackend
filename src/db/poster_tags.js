async function getTags(client, table_name, callback) {
    const request = "SELECT * from " + table_name + ";"
    await client.query(request,
        [],
        callback,
    );
}

async function importTags(client, table_name, description_en, description_de, active, color, callback) {
    const request = "INSERT INTO " + table_name + "(description_en, description_de, active, color) VALUES ($1, $2, $3, $4) RETURNING id;"
    await client.query(request,
        [
            description_en,
            description_de,
            active,
            color
        ],
        callback,
    );
}

module.exports = {getTags, importTags}
