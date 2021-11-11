async function createPlacemark(client, placemark, callback) {
    const request =
        "INSERT INTO placemark (location, title, description, type) " +
        "VALUES (CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3, $4, $5) RETURNING id, ST_Y(cast(placemark.location as GEOMETRY)) " +
        "as latitude, ST_X(cast(placemark.location as GEOMETRY)) as longitude, title, description, type" +
        " last_update, account";
    await client.query(request,
        [
            placemark.longitude,
            placemark.latitude,
            placemark.title,
            placemark.description,
            placemark.type,
        ],
        callback);
}

async function updatePlacemark(client, placemark, callback) {
    const request =
        "UPDATE placemark SET (location, title, description, type, last_update) " +
        "= (CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3, $4, $5, now()) " +
        "WHERE id=$6 RETURNING id, ST_Y(cast(placemark.location as GEOMETRY)) as latitude, " +
        "ST_X(cast(placemark.location as GEOMETRY)) as longitude, title, description, type, last_update, account";
    await client.query(request,
        [
            placemark.longitude,
            placemark.latitude,
            placemark.title,
            placemark.description,
            placemark.type,
            placemark.id
        ],
        callback);
}

async function deletePlacemark(client, id, callback) {
    const request =
        "DELETE FROM placemark WHERE id=$1";
    await client.query(request,
        [
            id
        ],
        callback);
}

async function getPlacemarkInMeterRange(client, latitude, longitude, distance, callback) {
    const request = "SELECT id, ST_Y(cast(placemark.location as GEOMETRY)) as latitude, ST_X(cast(placemark.location as GEOMETRY)) as longitude, " +
        "title, description, type, account FROM placemark " +
        "WHERE ST_DWITHIN(placemark.location, CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3);"
    await client.query(request,
        [
            longitude,
            latitude,
            distance,
        ],
        callback,
    );
}

async function getAll(client, callback) {
    const request = "SELECT id, ST_Y(cast(placemark.location as GEOMETRY)) as latitude, ST_X(cast(placemark.location as GEOMETRY)) as longitude, " +
        "title, description, type, account FROM placemark;"
    await client.query(request,
        [],
        callback,
    );
}

module.exports = {createPlacemark, updatePlacemark, deletePlacemark, getPlacemarkInMeterRange, getAll}
