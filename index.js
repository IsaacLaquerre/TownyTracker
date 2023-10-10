const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const towns = require("./towns.js");
const players = require("./players.js");

const townsFile = require("./towns.json");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1080,
        height: 1000,
        minWidth: 1080,
        minHeight: 200,
        title: "TownyTracker",
        icon: path.join(__dirname, "icon-256x256.ico"),
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    ipcMain.handle("init_towns", event => {
        if (townsFile.length === 0) {
            return towns.get_towns().then(newTowns => {
                towns.update_town_file(newTowns);
                return newTowns.list;
            });
        } else return townsFile.list;
    });
    ipcMain.handle("update_towns", (event, oldList) => {
        return towns.update(oldList);
    });
    ipcMain.handle("update_players", event => {
        return players.update();
    });

    win.loadFile("public/views/index.html");
    win.setTitle("TownyTracker");
    win.webContents.openDevTools();
    win.setMenu(null);
};

app.whenReady().then(() => {
    createWindow();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
