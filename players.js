const fetch = require("fetch").fetchUrl;
const htmlToJson = require("html-to-json");
const fs = require("fs");
const settings = require("./settings.json");
const Players = require("./classes/Players.js");
const Player = require("./classes/Player.js");

module.exports = {
    update: () => {
        return get_players();
    }
};

function get_players() {
    return new Promise((resolve, reject) => {
        let playerList = [];
        fetch(settings.API_ENDPOINT_PLAYERS, async function (err, meta, body) {
            if (err) reject(err);
            try {
                let response = JSON.parse(body.toString());

                for (i in response.players) {
                    let info = {
                        health: response.players[i].health,
                        armor: response.players[i].armor,
                        world: response.players[i].world,
                        yaw: response.players[i].yaw
                    };

                    playerList.push(
                        new Player(
                            response.players[i].name,
                            response.players[i].uuid,
                            {
                                x: response.players[i].x,
                                y: response.players[i].z
                            },
                            info
                        )
                    );
                }

                resolve(playerList);
            } catch (err) {
                reject(err);
            }
        });
    });
}
