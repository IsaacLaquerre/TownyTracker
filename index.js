const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const towns = require("./towns.js");
const players = require("./players.js");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1080,
        height: 1000,
        minWidth: 1080,
        minHeight: 200,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
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
