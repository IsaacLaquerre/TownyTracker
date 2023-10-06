var townList = [];
var playerList = [];
var currentTab = localStorage.getItem("currentTab") || "towns";
var updateTime = 300000;

var updateInterval = setInterval(update_loop, updateTime);

function set_up() {
    document.querySelector("div#update").addEventListener("mousedown", e => {
        let activeTab = document.querySelector("#tabs .selected");
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

                update_scroll_bar();
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
                render(type, response.townList).then(() => {
                    if (currentTab === type) update_scroll_bar();
                });
            }
            /*var testTown = response.townList.find(
                town => town.name === "Riverside"
            );
            response.mismatch.deleted.push(testTown);*/
            if (response.mismatch.deleted.length !== 0) {
                for (i = 0; i < response.mismatch.deleted.length; i++) {
                    add_deleted_town(response.mismatch.deleted[i]);
                }
            }
            break;
        case "players":
            var response = await window.electronAPI.update_players();
            playerList = response;
            render(type, response).then(() => {
                if (currentTab === type) update_scroll_bar();
            });
            break;
        default:
            break;
    }
}

function render(tab, response) {
    let renderTab = document.querySelector("#" + tab + "List").children[0];

    return new Promise(resolve => {
        switch (tab) {
            case "towns":
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

                for (i in response) {
                    var town = document.createElement("tr");
                    town.classList.add("town");
                    town.title = "View info";

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

                    town.setAttribute(
                        "onclick",
                        "showTownInfo(this.children[0].innerHTML)"
                    );

                    town.appendChild(townName);
                    town.appendChild(townNation);
                    town.appendChild(townMayor);
                    town.appendChild(townSpawn);

                    renderTab.appendChild(town);
                }
                break;
            case "players":
                let playerListEl =
                    document.querySelector("#playersList").children[0];
                while (
                    playerListEl.lastElementChild &&
                    !playerListEl.lastElementChild.classList.contains("header")
                )
                    if (
                        !playerListEl.lastElementChild.classList.contains(
                            "header"
                        )
                    )
                        playerListEl.removeChild(playerListEl.lastElementChild);

                for (i in response) {
                    var player = document.createElement("tr");
                    player.classList.add("player");
                    player.title = "View info";

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

                    var playerAfk = document.createElement("td");
                    playerAfk.classList.add("playerAfk");
                    playerAfk.innerHTML = response[i].afk;

                    player.setAttribute(
                        "onclick",
                        "showPlayerInfo(this.children[0].innerHTML)"
                    );

                    player.appendChild(playerName);
                    player.appendChild(playerCoords);
                    player.appendChild(playerWorld);
                    player.appendChild(playerAfk);

                    renderTab.appendChild(player);
                }
                break;
            default:
                break;
        }
        resolve();
    });
}

function infoWindow(el) {
    var infoWrapper = document.createElement("div");
    infoWrapper.id = "infoWrapper";
    infoWrapper.style.opacity = 0;

    var infoWindow = document.createElement("div");
    infoWindow.id = "infoWindow";
    document.body.style.overflow = "hidden";
    document.body.style.filter = "blur(5px)";

    var x = document.createElement("span");
    x.style =
        "color: var(--textColor); position: absolute; top: 25px; left: 91%;";
    x.classList.add("closeWindow");
    x.innerHTML = "X";
    x.onclick = () => {
        fadeOut(infoWrapper).then(() => {
            document.body.style.overflow = "auto";
            document.body.style.filter = "none";
        });
    };

    var blockClicks = document.createElement("div");
    blockClicks.id = "blockClicks";
    blockClicks.onclick = () => {
        fadeOut(infoWrapper).then(() => {
            document.body.style.overflow = "auto";
            document.body.style.filter = "none";
        });
    };

    infoWindow.appendChild(el);
    infoWindow.appendChild(x);

    infoWrapper.appendChild(blockClicks);
    infoWrapper.appendChild(infoWindow);

    document.body.parentNode.appendChild(infoWrapper);

    fadeIn(infoWrapper);
}

function showTownInfo(townName) {
    var town = townList.find(town => town.name === townName);

    var townWrapper = document.createElement("div");
    townWrapper.id = "townWrapper";

    var townInfo = document.createElement("div");
    townInfo.classList.add("townInfo");

    var townName = document.createElement("span");
    townName.classList.add("townName");
    townName.innerHTML = town.name;

    var townNation = document.createElement("span");
    townNation.classList.add("townNation");
    townNation.innerHTML = town.nation;

    var townSpawn = document.createElement("span");
    townSpawn.classList.add("townSpawn");
    townSpawn.innerHTML = "(" + town.spawn.x + ", " + town.spawn.y + ")";

    var townCoords = document.createElement("ul");
    townCoords.classList.add("townCoords");

    for (i in town.claimedCoords) {
        var townCoord = document.createElement("li");
        townCoord.classList.add("townCoord");
        townCoord.innerHTML =
            "- (" +
            town.claimedCoords[i].x +
            ", " +
            town.claimedCoords[i].y +
            ")";

        townCoords.appendChild(townCoord);
    }

    var townMayor = document.createElement("span");
    townMayor.classList.add("townMayor");
    townMayor.innerHTML = town.mayor;

    var membersInfo = document.createElement("div");
    membersInfo.classList.add("membersInfo");

    var townAssistants = document.createElement("ul");
    townAssistants.classList.add("townAssistants");

    for (i in town.assistants) {
        var townAssistant = document.createElement("li");
        townAssistant.classList.add("townAssistant");
        townAssistant.innerHTML = "- " + town.assistants[i];

        townAssistants.appendChild(townAssistant);
    }

    var townResidents = document.createElement("ul");
    townResidents.classList.add("townResidents");

    for (i in town.residents) {
        if (i > 20) break;

        var townResident = document.createElement("li");
        townResident.classList.add("townResident");
        townResident.innerHTML = "- " + town.residents[i];

        townResidents.appendChild(townResident);
    }

    if (town.residents.length > 20) {
        var left = town.residents.length - 20;
        var span = document.createElement("span");
        span.innerHTML = "and " + left + " more...";
        townResidents.appendChild(span);
    }

    var townPvp = document.createElement("span");
    townPvp.classList.add("townPvp");
    townPvp.innerHTML = "<span class=" + town.pvp + ">" + town.pvp + "</span>";

    townInfo.appendChild(townName);
    townInfo.appendChild(townNation);
    townInfo.appendChild(townSpawn);
    if (town.claimedCoords.length !== 0) townInfo.appendChild(townCoords);
    townInfo.appendChild(townMayor);
    if (town.assistants.length !== 0) membersInfo.appendChild(townAssistants);
    if (town.residents.length !== 0) membersInfo.appendChild(townResidents);
    membersInfo.appendChild(townPvp);

    townWrapper.appendChild(townInfo);
    townWrapper.appendChild(membersInfo);

    infoWindow(townWrapper);
}

function showPlayerInfo(playerName) {
    var player = playerList.find(player => player.username === playerName);

    var playerWrapper = document.createElement("div");
    playerWrapper.id = "playerWrapper";

    var playerHead = document.createElement("img");
    playerHead.classList.add("playerHead");
    playerHead.src = "https://mc-heads.net/avatar/" + player.uuid + ".png";
    playerHead.alt = player.username + "'s avatar";

    var playerInfo = document.createElement("div");
    playerInfo.classList.add("playerInfo");

    var playerUsername = document.createElement("span");
    playerUsername.classList.add("playerUsername");
    playerUsername.innerHTML = player.username;

    var playerUUID = document.createElement("span");
    playerUUID.classList.add("playerUUID");
    playerUUID.innerHTML = player.uuid;

    var playerCoords = document.createElement("span");
    playerCoords.classList.add("playerCoords");
    playerCoords.innerHTML =
        "(" + player.coords.x + "," + player.coords.y + ")";

    var playerWorld = document.createElement("span");
    playerWorld.classList.add("playerWorld");
    playerWorld.innerHTML = player.world;

    var playerHealth = document.createElement("div");
    playerHealth.classList.add("playerHealth");
    var hearts = player.health / 2;
    playerHealth.innerHTML = "";
    for (i = 0; i < Math.floor(hearts); i++) {
        playerHealth.innerHTML +=
            "<img src='../assets/images/full_heart.png' title='" +
            player.health +
            "/20' width=20 />";
    }
    if (hearts % 1 !== 0)
        playerHealth.innerHTML +=
            "<img src='../assets/images/half_heart.png' title='" +
            player.health +
            "/20' width=20 />";
    if (Math.ceil(hearts) !== 10) {
        var remaining = 10 - Math.ceil(hearts);
        for (i = 0; i < remaining; i++) {
            playerHealth.innerHTML +=
                "<img src='../assets/images/empty_heart.png' title='" +
                player.health +
                "/20' width=20 />";
        }
    }

    var playerArmor = document.createElement("div");
    playerArmor.classList.add("playerArmor");
    var chestplates = player.armor / 2;
    playerArmor.innerHTML = "";
    for (i = 0; i < Math.floor(chestplates); i++) {
        playerArmor.innerHTML +=
            "<img src='../assets/images/full_armor.png' title='" +
            player.armor +
            "/20' width=20 />";
    }
    if (chestplates % 1 !== 0)
        playerArmor.innerHTML +=
            "<img src='../assets/images/half_armor.png' title='" +
            player.armor +
            "/20' width=20 />";
    if (Math.ceil(chestplates) !== 10) {
        var remaining = 10 - Math.ceil(chestplates);
        for (i = 0; i < remaining; i++) {
            playerArmor.innerHTML +=
                "<img src='../assets/images/empty_armor.png' title='" +
                player.armor +
                "/20' width=20 />";
        }
    }

    var playerAfk = document.createElement("span");
    playerAfk.classList.add("playerAfk");
    playerAfk.innerHTML =
        "<span class=" + player.afk + ">" + player.afk + "</span>";

    playerInfo.appendChild(playerUsername);
    playerInfo.appendChild(playerUUID);
    playerInfo.appendChild(playerCoords);
    playerInfo.appendChild(playerWorld);
    playerInfo.appendChild(playerHealth);
    playerInfo.appendChild(playerArmor);
    playerInfo.appendChild(playerAfk);

    playerWrapper.appendChild(playerHead);
    playerWrapper.appendChild(playerInfo);

    infoWindow(playerWrapper);
}

function fadeIn(el) {
    return new Promise(resolve => {
        var loop = setInterval(() => {
            if (el.style.opacity >= 1) {
                el.style.opacity = 1;
                clearInterval(loop);
                return resolve();
            }
            el.style.opacity = parseFloat(el.style.opacity) + 0.2;
        }, 10);
    });
}

function fadeOut(el) {
    return new Promise(resolve => {
        var loop = setInterval(() => {
            if (el.style.opacity <= 0) {
                el.style.opacity = 0;
                el.remove();
                clearInterval(loop);
                return resolve();
            }
            el.style.opacity = parseFloat(el.style.opacity) - 0.2;
        }, 10);
    });
}

function update_scroll_bar() {
    activeTab = document.querySelector("#" + currentTab);

    if (activeTab.scrollHeight + 25 > window.innerHeight) {
        document.querySelector("#updateWrapper").style.right =
            "calc(2.5vw - 14.25px)";
    } else {
        document.querySelector("#updateWrapper").style.right =
            "calc(2.5vw - 4.25px)";
    }
}

function add_deleted_town(town) {
    let spawn = town.spawn;
    let name = town.name;

    var townEl = document.createElement("tr");
    townEl.classList.add("town");

    var townName = document.createElement("td");
    townName.classList.add("townName");
    townName.innerHTML = name;

    var townSpawn = document.createElement("td");
    townSpawn.classList.add("townSpawn");
    townSpawn.innerHTML = "(" + spawn.x + ", " + spawn.y + ")";

    townEl.setAttribute("onclick", "showTownInfo(this.children[0].innerHTML)");

    townEl.appendChild(townName);
    townEl.appendChild(townSpawn);

    deletedTowns.appendChild(townEl);
}

function change_update_time(value) {
    updateTime = value * 60000;
    clearInterval(updateInterval);
    new_interval(updateTime);
}

function update_loop() {
    update(currentTab);
}

function new_interval(time) {
    updateInterval = setInterval(update_loop, time);
}

function search(query) {
    var townSearch = townList.filter(town =>
        town.name.toLowerCase().includes(query.toLowerCase())
    );
    render("towns", townSearch).then(() => update_scroll_bar());

    var playerSearch = playerList.filter(player =>
        player.username.toLowerCase().includes(query.toLowerCase())
    );
    render("players", playerSearch).then(() => update_scroll_bar());
}

Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});
