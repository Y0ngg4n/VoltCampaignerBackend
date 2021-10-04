// This function is called within the first transaction. It inserts some initial values into the "accounts" table.
async function createPoster(client, poster, callback) {
    const request =
        "INSERT INTO poster (location, poster_type, motive, target_groups, environment, other) VALUES (CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3, $4, $5, $6, $7)";
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
        "UPDATE poster SET (location, poster_type, motive, target_groups, environment, other) = (CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3, $4, $5, $6, $7) WHERE id=$8";
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

async function getPosterInMeterRange(client, latitude, longitude, distance, hanging, callback) {
    console.log(latitude);
    console.log(longitude);
    console.log(distance);
    console.log(hanging);
    const request = "SELECT id, ST_Y(cast(poster.location as GEOMETRY)) as latitude, ST_X(cast(poster.location as GEOMETRY)) as longitude, hanging, poster_type, motive, target_groups, environment, other FROM poster WHERE ST_DWITHIN(poster.location, CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3) AND poster.hanging=$4;"
    await client.query(request,
        [
            latitude,
            longitude,
            distance,
            hanging
        ],
        callback,
    );
}

module.exports = {createPoster, updatePoster, getPosterInMeterRange}
