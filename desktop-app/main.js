const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let backendProcess;

function findBackendExe() {
  // packaged
  const packaged = path.join(process.resourcesPath, "start_app.exe");
  if (fs.existsSync(packaged)) return packaged;

  // local copy (dev)
  const local = path.join(__dirname, "start_app.exe");
  if (fs.existsSync(local)) return local;

  // very dev: run from real backend folder
  const dev = path.join(__dirname, "../backend/dist/start_app.exe");
  if (fs.existsSync(dev)) return dev;

  return null;
}

function startBackend() {
  const exe = findBackendExe();
  if (!exe) {
    console.error("❌ start_app.exe not found");
    return;
  }
  console.log("✅ starting backend:", exe);
  backendProcess = spawn(exe);
  backendProcess.stdout.on("data", d => console.log("[backend]", d.toString()));
  backendProcess.stderr.on("data", d => console.error("[backend err]", d.toString()));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  const indexPath = path.join(__dirname, "app-frontend", "index.html");
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});
