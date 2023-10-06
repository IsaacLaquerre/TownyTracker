const { contextBridge, ipcRenderer } = require("electron");
/*const fs = require("fs");
window.path = __dirname;*/

contextBridge.exposeInMainWorld("electronAPI", {
    update_towns: oldTowns => ipcRenderer.invoke("update_towns", oldTowns),
    update_players: () => ipcRenderer.invoke("update_players")
});

window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
