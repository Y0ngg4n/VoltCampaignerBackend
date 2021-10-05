async function createPoster(client, poster, callback) {
    const request =
        "INSERT INTO poster (location, campaign, poster_type, motive, target_groups, environment, other) " +
        "VALUES (CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3, $4, $5, $6, $7, $8) RETURNING id, ST_Y(cast(poster.location as GEOMETRY)) " +
        "as latitude, ST_X(cast(poster.location as GEOMETRY)) as longitude, hanging, campaign, poster_type, motive, " +
        "target_groups, environment, other, last_update, account";
    await client.query(request,
        [
            poster.longitude,
            poster.latitude,
            poster.campaign,
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
        "UPDATE poster SET (hanging, location, campaign, poster_type, motive, target_groups, environment, other, last_update) " +
        "= ($1, CAST(ST_Makepoint($2,$3) as GEOGRAPHY), $4, $5, $6, $7, $8, $9, now()) " +
        "WHERE id=$9 RETURNING id, ST_Y(cast(poster.location as GEOMETRY)) as latitude, " +
        "ST_X(cast(poster.location as GEOMETRY)) as longitude, hanging, campaign, poster_type, " +
        "motive, target_groups, environment, other, last_update, account";
    await client.query(request,
        [
            poster.hanging,
            poster.longitude,
            poster.latitude,
            poster.campaign,
            poster.poster_type,
            poster.motive,
            poster.target_groups,
            poster.environment,
            poster.other,
            poster.id
        ],
        callback);
}

async function getPosterInMeterRange(client, latitude, longitude, distance, hanging, last_update, callback) {
    const request = "SELECT id, ST_Y(cast(poster.location as GEOMETRY)) as latitude, ST_X(cast(poster.location as GEOMETRY)) as longitude, " +
        "hanging, campaign, poster_type, motive, target_groups, environment, other, account FROM poster " +
        "WHERE ST_DWITHIN(poster.location, CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3) AND poster.hanging=$4 AND last_update > $5;"
    await client.query(request,
        [
            latitude,
            longitude,
            distance,
            hanging,
            last_update
        ],
        callback,
    );
}

async function getAll(client, hanging, callback) {
    const request = "SELECT id, ST_Y(cast(poster.location as GEOMETRY)) as latitude, ST_X(cast(poster.location as GEOMETRY)) as longitude, " +
        "hanging, campaign, poster_type, motive, target_groups, environment, other, account FROM poster WHERE poster.hanging=$1;"
    await client.query(request,
        [
            hanging
        ],
        callback,
    );
}

module.exports = {createPoster, updatePoster, getPosterInMeterRange, getAll}
