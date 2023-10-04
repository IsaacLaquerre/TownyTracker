module.exports = class Towns {
    constructor(list) {
        this.list = list;
    }

    get_town_by_name(name) {
        return this.list.find(town => town.name === name);
    }

    get_towns_by_nation(nation) {
        return this.list.filter(town => town.nation === nation);
    }

    get_town_by_mayor(username) {
        return this.list.find(town => town.mayor === username);
    }

    get_user_town(username) {
        return (
            this.list.find(town => town.residents.includes(username)) || "None"
        );
    }

    count() {
        return this.list.length;
    }
};
