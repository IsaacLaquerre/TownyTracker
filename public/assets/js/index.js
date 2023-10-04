var townList = [];
var playerList = [];
var currentTab = localStorage.getItem("currentTab") || "towns";

function setUp() {
    document.querySelector("div#update").addEventListener("mousedown", e => {
        let activeTab = document.querySelector("#tabs *.selected");
        update(activeTab.id);
    });

    var sections = document.querySelectorAll("div.section");
    var selection = document.querySelector("#selection");
    var tabs = document.querySelector("#tabs");
    var deletedTowns = document.querySelector("#deletedTowns").children[0];

    for (i = 0; i < sections.length; i++) {
        let tab = document.createElement("div");
        tab.classList.add("tab");

        let tabTitle = document.createElement("span");
        tabTitle.classList.add("tabTitle");
        tabTitle.innerHTML = sections[i].id.capitalize();

        tab.appendChild(tabTitle);
        selection.appendChild(tab);

        if (sections[i].id === currentTab) {
            tab.classList.add("selected");
            document
                .querySelector("#" + sections[i].id)
                .classList.add("selected");
        }

        update(sections[i].id);

        tab.addEventListener(
            "mousedown",
            e => {
                for (i = 0; i < selection.children.length; i++) {
                    selection.children[i].classList.remove("selected");
                }

                for (i = 0; i < tabs.children.length; i++) {
                    tabs.children[i].classList.remove("selected");
                }

                tab.classList.add("selected");
                document
                    .querySelector("#" + tabTitle.innerHTML.toLowerCase())
                    .classList.add("selected");
                currentTab = tabTitle.innerHTML.toLowerCase();
                localStorage.setItem("currentTab", currentTab);
            },
            false
        );
    }
}

async function update(type) {
    switch (type) {
        case "towns":
            var response = await window.electronAPI.update_towns(townList);
            var init = false;
            if (townList.length === 0) init = true;
            townList = response.townList;
            if (
                response.mismatch.added.length !== 0 ||
                response.mismatch.deleted.length !== 0 ||
                init
            ) {
                let townListEl =
                    document.querySelector("#townsList").children[0];
                while (
                    townListEl.lastElementChild &&
                    !townListEl.lastElementChild.classList.contains("header")
                )
                    if (
                        !townListEl.lastElementChild.classList.contains(
                            "header"
                        )
                    )
                        townListEl.removeChild(townListEl.lastElementChild);
                render(type, response.townList);
            }
            if (response.mismatch.deleted.length !== 0) {
                for (i = 0; i < response.mismatch.deleted.length; i++) {
                    add_deleted_town(response.mismatch.deleted[i]);
                }
            }
            break;
        case "players":
            var response = await window.electronAPI.update_players();
            playerList = response;
            let playerListEl =
                document.querySelector("#playersList").children[0];
            while (
                playerListEl.lastElementChild &&
                !playerListEl.lastElementChild.classList.contains("header")
            )
                if (!playerListEl.lastElementChild.classList.contains("header"))
                    playerListEl.removeChild(playerListEl.lastElementChild);
            render(type, response);
            break;
        default:
            break;
    }
}

function render(tab, response) {
    let renderTab = document.querySelector("#" + tab + "List").children[0];

    switch (tab) {
        case "towns":
            for (i in response) {
                var town = document.createElement("tr");
                town.classList.add("town");

                var townName = document.createElement("td");
                townName.classList.add("townName");
                townName.innerHTML = response[i].name;

                var townNation = document.createElement("td");
                townNation.classList.add("townNation");
                townNation.innerHTML = response[i].nation;

                var townMayor = document.createElement("td");
                townMayor.classList.add("townMayor");
                townMayor.innerHTML = response[i].mayor;

                var townSpawn = document.createElement("td");
                townSpawn.classList.add("townSpawn");
                townSpawn.innerHTML =
                    "(" +
                    response[i].spawn.x +
                    ", " +
                    response[i].spawn.y +
                    ")";

                town.appendChild(townName);
                town.appendChild(townNation);
                town.appendChild(townMayor);
                town.appendChild(townSpawn);

                renderTab.appendChild(town);
            }
            break;
        case "players":
            for (i in response) {
                var player = document.createElement("tr");
                player.classList.add("player");

                var playerName = document.createElement("td");
                playerName.classList.add("playerName");
                playerName.innerHTML = response[i].username;

                var playerCoords = document.createElement("td");
                playerCoords.classList.add("playerCoords");
                playerCoords.innerHTML =
                    "(" +
                    response[i].coords.x +
                    ", " +
                    response[i].coords.y +
                    ")";

                var playerWorld = document.createElement("td");
                playerWorld.classList.add("playerWorld");
                playerWorld.innerHTML = response[i].world;

                player.appendChild(playerName);
                player.appendChild(playerCoords);
                player.appendChild(playerWorld);

                renderTab.appendChild(player);
            }
            break;
        default:
            break;
    }
}

function add_deleted_town(town) {
    let spawn = town.spawn;
    let name = town.name;

    town = document.createElement("tr");
    town.classList.add("town");

    var townName = document.createElement("td");
    townName.classList.add("townName");
    townName.innerHTML = name;

    var townSpawn = document.createElement("td");
    townSpawn.classList.add("townSpawn");
    townSpawn.innerHTML = "(" + spawn.x + ", " + spawn.y + ")";

    town.appendChild(townName);
    town.appendChild(townSpawn);

    deletedTowns.appendChild(town);
}

Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});
