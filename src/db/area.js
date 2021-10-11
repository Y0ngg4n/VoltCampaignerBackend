async function createArea(client, area, callback) {
    let values = ""
    for (let i = 0; i < area.points.length; i++) {
        let point = area.points[i];
        if (isNaN(point.latitude) || isNaN(point.latitude)) {
            callback(new Error("Not a valid number"));
            return;
        } else {
            values += point.longitude + " " + point.latitude + ",";
        }
    }

    values = values.slice(0, -1);
    const request =
        "UPSERT INTO area (id, name, points, max_poster, last_update) VALUES ($1, $2, CAST(ST_MakePolygon('LINESTRING(" + values + ")') as GEOGRAPHY), $3, now()) RETURNING id;";
    await client.query(request, [area.id, area.name, area.max_poster],
        callback);
}

async function getAreasRange(client, latitude, longitude, distance, last_update, callback) {
    const request = "SELECT id, st_asgeojson(CAST(points as GEOMETRY)) as points, name, last_update, max_poster FROM area WHERE ST_DWITHIN(area.points, CAST(ST_Makepoint($1,$2) as GEOGRAPHY), $3) AND last_update > $4;"
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

async function getAreaContains(client, latitude, longitude, last_update, callback) {
    if (isNaN(latitude) || isNaN(latitude)) {
        callback(new Error("Not a valid number"));
        return;
    }
    let point = "POINT(" + longitude + " " + latitude + ")"
    const request = "SELECT id, st_asgeojson(CAST(points as GEOMETRY)) as points, name, last_update, max_poster FROM area WHERE ST_Contains(cast(area.points as geometry), ST_Transform(ST_GeomFromText('" + point + "', 4326), 4326)) AND last_update > $1"
    await client.query(request,
        [
            last_update
        ],
        callback,
    );
}

async function deleteArea(client, id, callback) {
    const request = "DELETE FROM AREA WHERE id=$1"
    await client.query(request,
        [
            id
        ],
        callback,
    );
}

module.exports = {createArea, getAreasRange, getAreaContains, deleteArea}
