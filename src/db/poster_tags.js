async function getTags(client, table_name, callback) {
    const request = "SELECT * from " + table_name + ";"
    await client.query(request,
        [],
        callback,
    );
}

module.exports = {getTags}
