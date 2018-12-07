import { join } from 'path';
import { format } from 'url';
import { app, BrowserWindow, ipcMain } from 'electron';
import { LogHelper } from './core/common/loghelper';
import { MenuContext } from './core/menu/menucontext';
import { StartUp } from './core/startup/startup';
import { DbContext } from './core/dataaccess/dbcontext';
import { DbMenuEntity } from './core/menu/dbmenuentity';
import { ConnectionConfig, DbType } from './core/common/connectionconfig';
import { ClassEntity } from './core/menu/classentity';
import {EntityClassHelper} from './core/menu/entityclasshelper';
StartUp.init();
let mainWindow: BrowserWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({ width: 1200, height: 600 });
    mainWindow.loadURL(format({
        pathname: join(__dirname, '../static', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //mainWindow.setMenu(null);
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow.destroy();
    });
};
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (mainWindow.isDestroyed) {
        createWindow();
    }
});
ipcMain.on("requestMenu-message", async (event: any) => {
    loadDbMenu(event);
})
async function loadDbMenu(event: any) {
    var result = await new MenuContext().GetDbTreeArray();
    event.sender.send('requestMenu-reply', JSON.stringify(result));
}
ipcMain.on("searchentity-send", async (event: any, param: DbMenuEntity) => {
    var result = await new MenuContext().GetEntityClass(param);
    var ss = result[0].Field;
    event.sender.send('searchentity-reply', JSON.stringify(result));
});
ipcMain.on("exportentityclass-send", async (event: any, param: { type: number, data: Array<ClassEntity>, dbConfig: DbMenuEntity }) => {
    let aa = new EntityClassHelper().ConvertToClass(DbType.mysql,param.data);
    event.sender.send('exportentityclass-reply', aa);
});