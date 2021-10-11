async function createFlyerRoute(client, id, polyline, callback) {
    let values = ""
    for (let i = 0; i < polyline.length; i++) {
        let point = polyline[i];
        if(isNaN(point.latitude) || isNaN(point.latitude)) {
            callback(new Error("Not a valid number"));
            return;
        }else {
            values += point.longitude + " " + point.latitude + ",";
        }
    }

    values = values.slice(0, -1);
    const request =
        "UPSERT INTO flyer_route (id, points, last_update) VALUES ($1, 'LINESTRING(" + values + ")', now()) RETURNING id;";
    await client.query(request, [id],
        callback);
}

async function getRoutesRange(client, latitude, longitude, distance, last_update, callback) {
    const request = "SELECT id, st_asgeojson(CAST(points as GEOMETRY)) as points, last_update, template, account FROM flyer_route WHERE ST_DWITHIN(flyer_route.points, CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3) AND last_update > $4;"
    await client.query(request,
        [
            longitude,
            latitude,
            distance,
            last_update
        ],
        callback,
    );
}

module.exports = {createFlyerRoute, getRoutesRange}
