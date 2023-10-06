const fetch = require("fetch").fetchUrl;
const htmlToJson = require("html-to-json");
const fs = require("fs");
const settings = require("./settings.json");
const Towns = require("./classes/Towns.js");
const Town = require("./classes/Town.js");

const UPDATE_TIME = 1000 * 60 * 15;
const TOWNSFILE_PATH = "./towns.json";
const LOG_PATH = "./deletedLog.json";

const townsFile = require(TOWNSFILE_PATH);
const logFile = require(LOG_PATH);

module.exports = {
    update: oldTowns => {
        return new Promise(resolve => {
            get_towns().then(towns => {
                compare_town_lists(oldTowns, towns.list).then(mismatch => {
                    resolve({
                        townList: towns.list,
                        mismatch: mismatch
                    });
                });
            });
        });
    }
};

function get_towns() {
    return new Promise((resolve, reject) => {
        let towns = [];
        let claimedCoords = [];
        fetch(settings.API_ENDPOINT_TOWNS, async function (err, meta, body) {
            if (err) reject(err);
            try {
                let markers = JSON.parse(body.toString())[0].markers;
                for (i in markers) {
                    let townRaw = markers[i];
                    let townCoords = townRaw.points
                        ? {
                              x: townRaw.points[0][0][0].x,
                              y: townRaw.points[0][0][0].z
                          }
                        : { x: townRaw.point.x, y: townRaw.point.z };
                    await htmlToJson
                        .parse(townRaw.tooltip, {
                            text: function ($doc) {
                                return $doc.find("div").text();
                            }
                        })
                        .then(async name => {
                            let townName = name.text.trim().split(" (")[0];
                            let townNation =
                                name.text.trim().slice(0, -1).split(" (")[1] ||
                                "None";
                            await htmlToJson
                                .parse(townRaw.popup, {
                                    text: function ($doc) {
                                        return $doc.find("div").text();
                                    }
                                })
                                .then(popup => {
                                    let townPopup = popup.text
                                        .split("\n")
                                        .filter(field => field !== "    ");
                                    let townInfo = {
                                        mayor: townPopup[3].substring(
                                            4,
                                            townPopup[3].length
                                        ),
                                        assistants: townPopup[5]
                                            .substring(4, townPopup[5].length)
                                            .split(", "),
                                        residents: townPopup
                                            .find(field =>
                                                field.includes("Residents: ")
                                            )
                                            .split(": ")[1]
                                            .split(", "),
                                        pvp:
                                            townPopup[7].substring(
                                                4,
                                                townPopup[7].length
                                            ) === "true",
                                        nation: townNation
                                    };

                                    let town = new Town(
                                        townName,
                                        townCoords,
                                        townInfo
                                    );

                                    if (townRaw.points) {
                                        claimedCoords.push({
                                            name: townName,
                                            points: townRaw.points
                                        });
                                    } else if (
                                        townRaw.icon &&
                                        !townRaw.icon.includes("outpost")
                                    ) {
                                        towns.push(town);
                                    }
                                })
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                }

                for (i in claimedCoords) {
                    let currentTown = towns.find(
                        town => town.name === claimedCoords[i].name
                    );

                    for (j in claimedCoords[i].points) {
                        currentTown.claimedCoords.push({
                            x: claimedCoords[i].points[j][0][0].x,
                            y: claimedCoords[i].points[j][0][0].z
                        });
                    }
                }

                resolve(new Towns(towns));
            } catch (err) {
                reject(err);
            }
        });
    });
}

function compare_town_lists(oldTowns, newTowns) {
    return new Promise(resolve => {
        let mismatch = { added: [], deleted: [] };

        if (oldTowns.length === 0) resolve(mismatch);
        else {
            let oldNames = [];
            let newNames = [];
            for (i in oldTowns) oldNames.push(oldTowns[i].name);
            for (i in newTowns) newNames.push(newTowns[i].name);

            for (i in oldNames) {
                if (!newNames.includes(oldNames[i]))
                    mismatch.deleted.push(oldTowns[i]);
            }
            for (i in newNames) {
                if (!oldNames.includes(newNames[i]))
                    mismatch.added.push(newTowns[i]);
            }

            resolve(mismatch);
        }
    });
}

function update_towns(newTowns) {
    fs.writeFile(TOWNSFILE_PATH, JSON.stringify(newTowns), "utf8", () => {});
}

function clear_towns() {
    fs.writeFile(TOWNSFILE_PATH, JSON.stringify({}), "utf8", () => {});
}

function add_to_log(town) {
    let log = logFile;
    log.deletedTowns.push({
        name: town.name,
        coords: { x: town.spawn.x, y: town.spawn.y },
        claimedCoords: town.claimedCoords,
        mayor: town.mayor
    });

    fs.writeFile(LOG_PATH, JSON.stringify(log), "utf8", () => {});
}

function clear_log() {
    fs.writeFile(
        LOG_PATH,
        JSON.stringify({ deletedTowns: [] }),
        "utf8",
        () => {}
    );
}
