module.exports = class Town {
    constructor(name, coords, info) {
        this.name = name;
        this.nation = info.nation;
        this.spawn = { x: coords.x, y: coords.y };
        this.claimedCoords = [];
        this.mayor = info.mayor;
        this.assistants = info.assistants;
        this.residents = info.residents;
        this.pvp = info.pvp;
    }
};
