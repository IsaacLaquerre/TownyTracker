var townList = [];
var playerList = [];
var currentTab = localStorage.getItem("currentTab") || "towns";
var updateTime = localStorage.getItem("updateTime") || 300000;
var tabs = [];

var updateInterval = setInterval(update_loop, updateTime);

function set_up() {
    tabs = document.querySelector("#tabs");

    document.querySelector("div#update").addEventListener("mousedown", e => {
        for (i = 0; i < tabs.children.length; i++) {
            update(tabs.children[i].id);
        }
    });

    document.querySelector("select#updateTime").value = updateTime / 60 / 1000;

    var sections = document.querySelectorAll("div.section");
    var advancedSearches = document.querySelector("#advancedSearch");
    var selection = document.querySelector("#selection");
    var deletedTowns = document.querySelector("#deletedTowns").children[0];

    for (i = 0; i < sections.length; i++) {
        let section = sections[i];

        let tab = document.createElement("div");
        tab.classList.add("tab");

        let tabTitle = document.createElement("span");
        tabTitle.classList.add("tabTitle");
        tabTitle.innerHTML = section.id.capitalize();

        tab.appendChild(tabTitle);
        selection.appendChild(tab);

        if (section.id === currentTab) {
            tab.classList.add("selected");
            document.querySelector("#" + section.id).classList.add("selected");
            document
                .querySelector("#" + section.id + "Search")
                .classList.add("selected");
        }

        init(section.id).then(() => {
            update(section.id);
            //render(section.id, section.id === "towns" ? townList : playerList);
        });

        tab.addEventListener(
            "mousedown",
            e => {
                for (i = 0; i < selection.children.length; i++) {
                    selection.children[i].classList.remove("selected");
                }

                for (i = 0; i < tabs.children.length; i++) {
                    tabs.children[i].classList.remove("selected");
                }

                for (i = 0; i < advancedSearch.children.length; i++) {
                    advancedSearch.children[i].classList.remove("selected");
                }

                tab.classList.add("selected");
                document
                    .querySelector("#" + tabTitle.innerHTML.toLowerCase())
                    .classList.add("selected");
                document
                    .querySelector(
                        "#" + tabTitle.innerHTML.toLowerCase() + "Search"
                    )
                    .classList.add("selected");
                currentTab = tabTitle.innerHTML.toLowerCase();
                localStorage.setItem("currentTab", currentTab);

                update_scroll_bar();
            },
            false
        );
    }
}

async function init(type) {
    return new Promise(async resolve => {
        switch (type) {
            case "towns":
                var response = await window.electronAPI.init_towns();
                townList = response;
                break;
            case "players":
                var response = await window.electronAPI.update_players();
                playerList = response;
                break;
            case "default":
                break;
        }
        resolve();
    });
}

async function update(type) {
    switch (type) {
        case "towns":
            var response = await window.electronAPI.update_towns(townList);

            var testTown = response.townList.find(
                town => town.name === "Riverside"
            );

            //response.mismatch.deleted.push(testTown);
            if (response.mismatch.deleted.length !== 0) {
                for (i in response.mismatch.deleted) {
                    add_deleted_town(response.mismatch.deleted[i]);
                }
            }
            if (response.mismatch.added.length !== 0) {
                for (i in response.mismatch.added) {
                    add_new_town(response.mismatch.added[i]);
                }
            }
            render(type, response.townList).then(() => {
                if (currentTab === type) update_scroll_bar();
            });
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
    search();
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
                    if (response[i].deleted) town.classList.add("deleted");
                    town.title = "View info";
                    town.id =
                        response[i].name.substring(0, 1).toUpperCase() +
                        response[i].spawn.x.toString().replace("-", "neg");

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
        update_scroll_bar();
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
    document.body.style.filter = "blur(3px)";
    document.querySelector("#updateWrapper").style.transform =
        currentTab === "towns"
            ? "translate(-10px, -2.5vw)"
            : "translate(0, -2.5vw)";
    update_scroll_bar();

    var x = document.createElement("span");
    x.style =
        "color: var(--textColor); position: absolute; top: 25px; left: 91%;";
    x.classList.add("closeWindow");
    x.innerHTML = "X";
    x.onclick = () => {
        fadeOut(infoWrapper).then(() => {
            document.body.style.overflow = "";
            document.body.style.filter = "";
            document.querySelector("#updateWrapper").style.transform = "";
            update_scroll_bar();
        });
    };

    var blockClicks = document.createElement("div");
    blockClicks.id = "blockClicks";
    blockClicks.onclick = () => {
        fadeOut(infoWrapper).then(() => {
            document.body.style.overflow = "";
            document.body.style.filter = "";
            document.querySelector("#updateWrapper").style.transform = "";
            update_scroll_bar();
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

    for (i in deletedTowns.children) {
        if (deletedTowns.children[i].tagName === "TR") {
            if (deletedTowns.children[i].children[0].innerHTML === name) return;
        }
    }

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

    townList.find(town => town.name === name).deleted = true;
}

function add_new_town(town) {
    townList.push(town);
}

function change_update_time(value) {
    updateTime = value * 60000;
    localStorage.setItem("updateTime", updateTime);
    clearInterval(updateInterval);
    new_interval(updateTime);
}

function update_loop() {
    for (i = 0; i < tabs.children.length; i++) {
        update(tabs.children[i].id);
    }
}

function new_interval(time) {
    updateInterval = setInterval(update_loop, time);
}

function search() {
    var townSearch = townList;

    var query = document.querySelector("#searchBar").value;
    if (query !== "") {
        townSearch = townSearch.filter(town =>
            town.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    var searchNation = document.querySelector("#searchNation").value;
    if (searchNation !== "") {
        townSearch = townSearch.filter(town =>
            town.nation.toLowerCase().includes(searchNation.toLowerCase())
        );
    }

    var searchMayor = document.querySelector("#searchMayor").value;
    if (searchMayor !== "") {
        townSearch = townSearch.filter(town =>
            town.mayor.toLowerCase().includes(searchMayor.toLowerCase())
        );
    }

    var searchMember = document.querySelector("#searchMember").value;
    if (searchMember !== "") {
        var townNames = [];
        for (i in townSearch) {
            for (j in townSearch[i].residents) {
                if (townSearch[i] === undefined) continue;
                if (
                    townSearch[i].residents[j]
                        .toLowerCase()
                        .includes(searchMember.toLowerCase())
                ) {
                    townNames.push(townSearch[i].name);
                }
            }
        }
        townSearch = townSearch.filter(town => townNames.includes(town.name));
    }

    var searchPvp = document.querySelector("#searchPvp").value;
    if (searchPvp !== "all") {
        townSearch = townSearch.filter(
            town => town.pvp == (searchPvp === "true")
        );
    }

    var searchCoordsX = parseFloat(
        document.querySelector("#searchCoordsTownX").value
    );
    var searchCoordsY = parseFloat(
        document.querySelector("#searchCoordsTownY").value
    );
    var searchCoordsRad = parseFloat(
        document.querySelector("#searchCoordsTownRad").value
    );
    if (
        searchCoordsX !== "" &&
        searchCoordsY !== "" &&
        searchCoordsRad !== "" &&
        searchCoordsX <= 25000 &&
        searchCoordsX >= -25000 &&
        searchCoordsY <= 25000 &&
        searchCoordsY >= -25000 &&
        searchCoordsRad <= 50000 &&
        searchCoordsRad >= 10 &&
        !isNaN(searchCoordsX) &&
        !isNaN(searchCoordsY) &&
        !isNaN(searchCoordsRad)
    ) {
        let townNames = [];
        for (i in townSearch) {
            let town = townSearch[i];
            town.claimedCoords.push(town.spawn);
            for (j in town.claimedCoords) {
                let a = searchCoordsX - town.claimedCoords[j].x;
                let b = searchCoordsY - town.claimedCoords[j].y;
                let c = Math.sqrt(a * a + b * b);

                if (c < searchCoordsRad || c === searchCoordsRad) {
                    townNames.push(town.name);
                }
            }
        }
        townSearch = townSearch.filter(town => townNames.includes(town.name));
    }

    render("towns", townSearch).then(() => update_scroll_bar());

    var playerSearch = playerList.filter(player =>
        player.username.toLowerCase().includes(query.toLowerCase())
    );

    var searchWorld = document.querySelector("#searchWorld").value;
    if (searchWorld !== "all") {
        playerSearch = playerSearch.filter(
            player =>
                player.world === searchWorld ||
                (player.world.startsWith("minecraft_coven") &&
                    searchWorld.startsWith("minecraft_coven"))
        );
    }

    var searchAfk = document.querySelector("#searchAfk").value;
    if (searchAfk !== "all") {
        playerSearch = playerSearch.filter(
            player => player.afk == (searchAfk === "true")
        );
    }

    var searchHealthInput = document.querySelector("#searchHealthInput").value;
    if (searchHealthInput !== "") {
        var searchHealthType =
            document.querySelector("#searchHealthType").value;
        playerSearch = playerSearch.filter(player =>
            searchHealthType === "equals"
                ? player.health == searchHealthInput
                : searchHealthType === "above"
                ? player.health > searchHealthInput
                : player.health < searchHealthInput
        );
    }

    var searchArmorInput = document.querySelector("#searchArmorInput").value;
    if (searchArmorInput !== "") {
        var searchArmorType = document.querySelector("#searchArmorType").value;
        playerSearch = playerSearch.filter(player =>
            searchArmorType === "equals"
                ? player.armor == searchArmorInput
                : searchArmorType === "above"
                ? player.armor > searchArmorInput
                : player.armor < searchArmorInput
        );
    }

    searchCoordsX = parseFloat(
        document.querySelector("#searchCoordsPlayerX").value
    );
    searchCoordsY = parseFloat(
        document.querySelector("#searchCoordsPlayerY").value
    );
    searchCoordsRad = parseFloat(
        document.querySelector("#searchCoordsPlayerRad").value
    );

    if (
        searchCoordsX !== "" &&
        searchCoordsY !== "" &&
        searchCoordsRad !== "" &&
        searchCoordsX <= 25000 &&
        searchCoordsX >= -25000 &&
        searchCoordsY <= 25000 &&
        searchCoordsY >= -25000 &&
        searchCoordsRad <= 50000 &&
        searchCoordsRad >= 10 &&
        !isNaN(searchCoordsX) &&
        !isNaN(searchCoordsY) &&
        !isNaN(searchCoordsRad)
    ) {
        let playerNames = [];
        for (i in playerSearch) {
            let player = playerSearch[i];
            let a = searchCoordsX - player.coords.x;
            let b = searchCoordsY - player.coords.y;
            let c = Math.sqrt(a * a + b * b);

            if (c < searchCoordsRad || c === searchCoordsRad) {
                playerNames.push(player.username);
            }
        }
        playerSearch = playerSearch.filter(player =>
            playerNames.includes(player.username)
        );
    }
    render("players", playerSearch).then(() => update_scroll_bar());
}

function clear_search_fields(type) {
    switch (type) {
        case "towns":
            var fields = document.querySelector("#townsSearch").children;
            for (i in fields) {
                if (fields[i].tagName === "DIV") {
                    Array.from(fields[i].children).forEach(child => {
                        if (child.tagName === "INPUT") child.value = "";
                        else if (child.tagName === "SELECT")
                            child.value = child.dataset.default;
                    });
                }
            }
            break;
        case "players":
            var fields = document.querySelector("#playersSearch").children;
            for (i in fields) {
                if (fields[i].tagName === "DIV") {
                    Array.from(fields[i].children).forEach(child => {
                        if (child.tagName === "INPUT") child.value = "";
                        else if (child.tagName === "SELECT")
                            child.value = child.dataset.default;
                    });
                }
            }
            break;
        default:
            break;
    }
    search();
}

function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}

Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});
