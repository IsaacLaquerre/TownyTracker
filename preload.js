const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    init_towns: () => ipcRenderer.invoke("init_towns"),
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
