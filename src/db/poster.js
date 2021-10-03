// This function is called within the first transaction. It inserts some initial values into the "accounts" table.
async function createPoster(client, poster, callback) {
    const request =
        "INSERT INTO poster (latitude, longitude, poster_type, motive, target_groups, environment, other) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    await client.query(request,
        [
            poster.latitude,
            poster.longitude,
            poster.poster_type,
            poster.motive,
            poster.target_groups,
            poster.environment,
            poster.other
        ],
        callback);
}

async function updatePoster(client, poster, callback) {
    const request =
        "UPDATE poster SET (latitude, longitude, poster_type, motive, target_groups, environment, other) = ($1, $2, $3, $4, $5, $6, $7) WHERE id=$8";
    await client.query(request,
        [
            poster.latitude,
            poster.longitude,
            poster.poster_type,
            poster.motive,
            poster.target_groups,
            poster.environment,
            poster.other,
            poster.uuid
        ],
        callback);
}

module.exports = {createPoster, updatePoster}
