module.exports = class Player {
    constructor(username, uuid, coords, info) {
        this.username = username;
        this.uuid = uuid;
        this.coords = { x: coords.x, y: coords.y };
        this.world = info.world;
        this.afk =
            coords.x === 522 &&
            coords.y === -1080 &&
            info.world === "minecraft_pvpworld";
        this.health = info.health;
        this.armor = info.armor;
        this.yaw = info.yaw;
    }
};
