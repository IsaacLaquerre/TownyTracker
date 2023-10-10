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

        for (var i in this.list) {
            let player = this.list[i];
            let a = coords.x - player.coords.x;
            let b = coords.y - player.coords.y;

            let c = Math.sqrt(a * a + b * b);

            if (c < radius || c === radius) {
                players.push(player);
            }
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
