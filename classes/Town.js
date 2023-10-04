module.exports = class Town {
    constructor(name, coords, info) {
        this.name = name;
        this.nation = info.nation;
        this.spawn = { x: coords.x, y: coords.y };
        this.claimedCoords = [];
        this.mayor = info.mayor;
        this.assistants =
            info.assistants.length === 1 && info.assistants[0] === "None"
                ? []
                : info.assistants;
        this.residents =
            info.residents.length === 1 && info.residents[0] === "None"
                ? []
                : info.residents;
        this.pvp = info.pvp;
    }
};
