// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog, MenuItem, Menu} = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const os = require('os');
const fs = require('fs');
const handler = require('serve-handler');
const autoUpdater = require("electron-updater").autoUpdater;
const {filter} = require('lodash')
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
// client.setTimeout(1500)
var serialPort = require("serialport");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow; //mainWindow主窗口
let preLibrary;
let defaultPath=''
let template = [{
    label: '查看',
    submenu: [{
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                // 重载之后, 刷新并关闭所有之前打开的次要窗体
                if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(win => {
                        if (win.id > 1) win.close()
                    })
                }
                focusedWindow.reload()
            }
        }
    }, {
        label: '切换全屏',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
        }
    }, {
        label: '切换开发者工具',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }]
}, {
    label: '窗口',
    role: 'window',
    submenu: [{
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: '重新打开窗口',
        accelerator: 'CmdOrCtrl+Shift+T',
        enabled: false,
        key: 'reopenMenuItem',
        click: () => {
            app.emit('activate')
        }
    }]
}]

function addUpdateMenuItems(items, position) {
    if (process.mas) return

    const version = app.getVersion()
    let updateItems = [{
        label: `版本 ${version}`,
        enabled: false
    }, {
        label: '检查更新',
        key: 'checkForUpdate',
        click: () => {
            console.log('检查更新')
            autoUpdater.checkForUpdates();
        }
    }]

    items.splice.apply(items, [position, 0].concat(updateItems))
}

const helpMenu = template[template.length - 1].submenu
addUpdateMenuItems(helpMenu, 0)

let setting = {}

function createWindow() {
    console.log('ready')
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 1300,
        minHeight: 740,
        icon: './favicon.ico',
        center: true,
        webPreferences: {
            devTools: true, //是否开启 DevTools
            nodeIntegration: true
        },
        show: false
    })
    console.log('isDev', isDev)
    // and load the index.html of the app.

    if (isDev) {
        mainWindow.loadURL("http://localhost:3000/");
        // Open the DevTools.
        mainWindow.webContents.openDevTools()

    } else {
        const http = require('http');
        const server = http.createServer((request, response) => {
            // You pass two more arguments for config and middleware
            // More details here: https://github.com/zeit/serve-handler#options
            return handler(request, response, {
                public: 'resources/app.asar/build',
            });
        })
        server.listen(15326, () => {
            mainWindow.loadURL('http://localhost:15326/index.html')
        });
        // mainWindow.loadURL(url.format({
        //     pathname: path.join(__dirname, './../build/index.html'), // 修改
        //     protocol: 'file:',
        //     slashes: true
        // }))
    }
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.webContents.send('ping', 'whoooooooh!');
        updateHandle() //更新需要在页面显示之后，否则不能打印出相应的内容
        // createMbus()
    })

    ipcMain.on('getPrinterList', (event) => {
        //主线程获取打印机列表
        const list = mainWindow.webContents.getPrinters();

        //通过webContents发送事件到渲染线程，同时将打印机列表也传过去
        mainWindow.webContents.send('getPrinterList', list);
    });



    ipcMain.on('openSNModal', (e, productCodeId,numbers) => {
        let win = new BrowserWindow({
            width: 300,
            height: 150,
            center: true,
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            parent: mainWindow
        })
        win.on('close', () => { win = null })
        win.loadURL(`${isDev?'http://localhost:3000/#/':'http://localhost:15326/#/'}print?productCodeId=${productCodeId}&numbers=${numbers}`);
        win.show()
    });

    //用户获取version
    ipcMain.on('getVersion', (e, set) => {
        const version = app.getVersion();
        mainWindow.webContents.send('getVersionFromMain', version);
    });
    ipcMain.on('getCOMs',(e)=>{
        serialPort.list().then(function (data) {
            console.log(data);
            mainWindow.webContents.send('getCOMsFromMain', data);

        });
    })
    ipcMain.on('selectCOM',(e,COM)=>{
        // open connection to a serial port
        console.log('打开',COM)
        let isOpen=client.isOpen;
        console.log('是否已经打开',isOpen)
        if(isOpen){
            client.close(function (res) {
                console.log(res)
            })
        }else{
            client.connectRTUBuffered(COM,{baudRate: 9600,dataBits: 8,stopBits: 1,parity:'odd'});
            client.setID(1);
        }
    })


    ipcMain.on('resetModbus',(e)=>{
        console.log('恢复默认设置')
        client.setTimeout(4000);
        client.writeCoil(3,true)
        openDialog({
            type: 'info',
            title: 'Success',
            message: '恢复默认设置成功',
        })
    })
    ipcMain.on('rebootModbus',(e)=>{
        console.log('重启Modbus')
        client.setTimeout(4000);
        client.writeCoil(0,true)
        openDialog({
            type: 'info',
            title: 'Success',
            message: '重启Modbus成功',
        })
        mainWindow.webContents.send('rebootSuccess');

    })
    ipcMain.on('eraseFlash',(e)=>{
        console.log('擦除外部Flash')
        client.setTimeout(10000);
        client.writeCoil(4,true)
        openDialog({
            type: 'info',
            title: 'Success',
            message: '擦除外部Flash成功',
        })

    })
    ipcMain.on('exportGet',(e)=>{
        console.log('导出获取值')
        dialog.showSaveDialog({
            title: '导出获取值',
            filters: [
                {name: 'exportGetParams', extensions: ['json']},
            ]
        }, res => {
            console.log('res', res)
            if (res) {
                mainWindow.webContents.send('exportGetFromMain', res);
            }
        })

    })
    ipcMain.on('exportSet',(e)=>{
        console.log('导出设置值')
        dialog.showSaveDialog({
            title: '导出设置值',
            filters: [
                {name: 'exportSetParams', extensions: ['json']},
            ]
        }, res => {
            console.log('res', res)
            if (res) {
                mainWindow.webContents.send('exportSetFromMain', res);
            }
        })

    })

    ipcMain.on('importSet',(e)=>{
        console.log('导入设置值')
        dialog.showOpenDialog({
            title: '导入设置值',
            filters: [
                {name: 'importSetParams', extensions: ['json']},
            ],
        }, res => {
            console.log('res', res)
            if (res.length>0) {
                mainWindow.webContents.send('importSetFromMain', res[0]);
            }
        })

    })

    ipcMain.on('saveBaseInfo',(e,data)=>{
        console.log('保存产品信息',data)
        client.setTimeout(4000);
        client.writeRegisters(0, data)
            .then(function (res) {
                console.log('res',res)
                client.writeCoil(1,true)
                // getBaseInfo()
                openDialog({
                    type: 'info',
                    title: 'Success',
                    message: '设置成功',
                })
            });
    })

    ipcMain.on('saveInfo',(e,data)=>{
        console.log('保存应用配置',data)
        client.setTimeout(4000);
        client.writeRegisters(0x18, data)
            .then(function (res) {
                console.log('res',res)
                client.writeCoil(2,true);
                openDialog({
                    type: 'info',
                    title: 'Success',
                    message: '写入成功',
                })

            });
    })

    ipcMain.on('getBaseInfo',(e)=>{
        getBaseInfo()
    })
    ipcMain.on('getInfo1',(e)=>{
        getInfo()
    })
    function getBaseInfo(){
        client.setTimeout(2000);
        client.readHoldingRegisters(0, 24, function(err, data) {
            if(err){
                console.log('err',err)
                openDialog({
                    type: 'error',
                    title: 'Error',
                    message: err.message,
                })
                return
            }
            console.log('data',data);
            if(data.data){
                mainWindow.webContents.send('getBaseInfoFromMain', data.data);
            }
        });
    }

    function getInfo(){
        client.setTimeout(2000);
        client.readHoldingRegisters(24, 25, function(err, data) {
            if(err){
                console.log('err',err)
                openDialog({
                    type: 'error',
                    title: 'Error',
                    message: err.message,
                })
                return
            }
            console.log('data',data);
            if(data.data){
                mainWindow.webContents.send('getInfo1FromMain', data.data);
            }
        });
    }

    //提示
    ipcMain.on('open-dialog', (e, message) => {
        openDialog(message)
    });




}

function openDialog(message) {
    dialog.showMessageBox(mainWindow, {
        type: message.type,
        title: message.title,
        message: message.message,
    })
}
console.log('before disableHardwareAcceleration')
app.disableHardwareAcceleration()
console.log('after disableHardwareAcceleration')
app.on('ready', createWindow)

app.on('window-all-closed', function () {
    console.log('process.platform', process.platform) //平台
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    console.log('activate')
    if (mainWindow === null) createWindow()
})


function updateHandle() {
    console.log('updateHandle')
    let message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };

    autoUpdater.setFeedURL('http://182.61.56.51:4009/electron/');
    autoUpdater.autoDownload = false //不强制下载
    autoUpdater.on('error', function (error) {
        sendUpdateMessage({
            type: 'error',
            message: message.error
        })
    });
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage({
            type: 'info',
            message: message.checking
        })
    });
    autoUpdater.on('update-available', function (info) {
        sendUpdateMessage({
            type: 'info',
            message: message.updateAva
        })
        autoUpdater.downloadUpdate().then(res => { //下载更新
            sendUpdateMessage({
                type: 'success',
                message: '下载更新'
            })
        });
    });
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage({
            type: 'success',
            message: message.updateNotAva
        })
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        sendUpdateMessage({
            type: 'info',
            message: '检测到新版本，正在下载: ' + Number(progressObj.percent).toFixed(2) + " %"
        })
    })

    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        sendUpdateMessage({
            type: 'success',
            message: '下载完成，开始更新'
        })
        autoUpdater.quitAndInstall();

        // ipcMain.on('isUpdateNow', (e, arg) => { //监听渲染发送过来的消息，比如用户按确定键后再开始跟新
        //   console.log("开始更新");
        //   sendUpdateMessage('开始更新')
        //   //some code here to handle event
        //   autoUpdater.quitAndInstall();
        // });
        // mainWindow.webContents.send('isUpdateNow') //像渲染层发送消息

    });

    ipcMain.on('UpdateNow', (e, arg) => { //ipcMain主进程监听渲染发送过来的消息，比如用户按确定键后再开始更新
        console.log('用户点击查询更新')
        //如果不是手动更新，将checkForUpdates提取到外面直接执行。
        autoUpdater.checkForUpdates(); //向服务端查询现在是否有可用的更新。在调用这个方法之前，必须要先调用 setFeedURL。
    });

}

function sendUpdateMessage(msg) {
    mainWindow.webContents.send('updateMessage', msg)
}

