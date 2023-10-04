module.exports = class Players {
    constructor(list) {
        this.list = list;
    }

    get_player_by_username(username) {
        return this.list.find(player => player.username === username);
    }

    get_player_by_uuid(uuid) {
        return this.list.find(player => player.uuid === uuid);
    }

    get_players_in(world) {
        return this.list.filter(player => player.world === world);
    }

    get_players_around(coords, radius) {
        let players = [];

        console.log({ x: coords.x, y: coords.y }, radius);

        for (var i in this.list) {
            let player = this.list[i];
            let dLat = degToRad(coords.x - player.coords.x);
            let dLon = degToRad(coords.y - player.coords.y);
            let a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) *
                    Math.sin(dLon / 2) *
                    Math.cos(degToRad(player.coords.x)) *
                    Math.cos(degToRad(coords.x));
            let c =
                2 *
                Math.atan2(Math.sqrt(Math.abs(a)), Math.sqrt(Math.abs(1 - a))) *
                radius;

            if (c < radius || c === radius) {
                players.push(player);
            }

            console.log(
                player.username,
                { x: player.coords.x, y: player.coords.y },
                "dLat: " + dLat,
                "dLon: " + dLon,
                "a: " + a,
                "c: " + c
            );
        }

        return players;
    }

    count() {
        return this.list.length;
    }
};

function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}
