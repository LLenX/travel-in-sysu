# 起步

在全局安装 electron

```
npm install -g electron
```

安装依赖

```
npm install
```

# 打包

[教程](https://github.com/electron/electron/blob/master/docs/tutorial/application-distribution.md)

下载包模板，然后把代码填进去

# 创建窗口

用BrowserWindow模块

``` js
const BrowserWindow = require('electron').remote.BrowserWindow
     // remote: 使用呈递进程？可以不要

```

# 窗口实例

``` js
let win = new BrowserWindow({
  width: 400,
  height: 225  // , show: false：可用来建立后台网页
});
// 无框架：frame: false
// 透明：transparent: true
win.on('close', function () { win = null }) // 关闭网页
win.loadURL(modalPath)  // 加载网页; 加载本地需要 'file://' + ...
win.show()

```

# 窗口属性

``` js
win.getSize()：size坐标
win.getPosition()：position坐标

```

# 对话框

``` js
const dialog = require('electron').remote.dialog
win.webContents.on('crashed', function () { // crash事件：process.crash()
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.', // 窗体里
      detail: 'details',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if (index === 0) win.reload()
      else win.close()
    })
  })

// 无响应事件 process.hang()
win.on('unresponsive', f)
win.on('responsive', f) // 恢复响应
```

# 菜单栏：template方式

``` js
const Menu = electron.Menu

```

``` js
let template = [{
  label: 'Edit',  // or: type: 'separator'
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    visible: true,
    enabled: true,
    key: '...'    // ?
    role: 'undo'   // ?
  }],
  click: function(item, focusedWindow) {
    
  }
}]

```

## 创建菜单栏

``` js
app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

```

``` js
app：const app = electron.app
平台：process.platform、process.versions.node...
调出开发者工具：win.toggleDevTools()
关闭：app.quit()

```



# 创建右键菜单：MenuItem方式

``` js
const menu = new Menu()
menu.append(new MenuItem({ label: 'Hello' }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Electron', type: 'checkbox', checked: true }))
app.on('browser-window-created', function (event, win) {
  win.webContents.on('context-menu', function (e, params) {
    menu.popup(win, params.x, params.y)
  })
})

```

# ipc事件传输

``` js
// 创建窗口的进程——呈现进程
const ipc = require('electron').ipcRenderer

// Tell main process to show the menu when demo button is clicked
const contextMenuBtn = document.getElementById('context-menu')
contextMenuBtn.addEventListener('click', function () {
  ipc.send('show-context-menu')
})

/* ---------- 拥有菜单的进程 ------------- */
ipc.on('show-context-menu', function (event) {
  const win = BrowserWindow.fromWebContents(event.sender)
  menu.popup(win)
})

```

# 注册全局快捷键

``` js
const globalShortcut = electron.globalShortcut
app.on('ready', function () {
  globalShortcut.register('CommandOrControl+Alt+K', function () {
    dialog.showMessageBox({
      type: 'info',
      message: 'Success!',
      detail: 'You pressed the registered global shortcut keybinding.',
      buttons: ['OK']
    })
  })
})

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})

```

# 打开文件管理器：home目录

``` js
const shell = require('electron').shell
const os = require('os')
shell.showItemInFolder(os.homedir())

```

# 用其他浏览器打开网站：

``` js
shell.openExternal('http://electron.atom.io')
link.addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal(link.href)
})
```

# 对话框

``` js
// 文件选择框
dialog.showOpenDialog({
  properties: ['openFile', 'openDirectory']
}, function (files) {
  // files为文件或文件夹路径
})

// Mac中sheet型对话框：
dialog.showOpenDialog(window, { properties: [ 'openFile' ]}, f)
// window：window类型

// 错误框(message, detail)
dialog.showErrorBox('An Error Message', 'Demonstrating an error message.')

// 保存框
const options = {
  title: 'Save an Image',
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
  ]
}
dialog.showSaveDialog(options, function (filename) {
  
})

```

# 菜单栏图标

``` js
const Tray = electron.Tray;

let appIcon = null;
const iconPath = path.join(__dirname, "haha.png");
appIcon = new Tray(iconPath);

appIcon.setToopTip('鼠标hover时显示');
appIcon.setContextMenu(菜单对象);

app.on('window-all-closed', function() {
  if (appIcon) appIcon.destroy();
});

```

# 进程通信

``` js
// 主进程
const ipc = electron.ipcMain;

ipc.on('message-come', function(event, arg1, arg2) {
  event.sender.send('message-back', 'haha', ...);
});

// 呈现进程
const ipc = electron.ipcRenderer;
ipc.send('message-come', 'heihei', ...);
ipc.on('message-back', function(event, arg1, arg2) {
  // arg1、arg2 就是了
});


// 同步：
// 呈现
const ret = ipc.sendSync('message-come', 'heihei');

// 主
ipc.on('message-back', function(event, arg) {
  event.returnValue = 'ret'
})

```

# 窗口间通信

``` js

// 呈现进程1
const ipc = require('electron').ipcRenderer;
windowId = BrowserWindow.getFocusedWindow().id;
win.webContents.send('do-it', windowId, ...);
ipcRenderer.on('done', function(event, ...) {

});

// 呈现进程2
const ipc = require('electron').ipcRenderer;
ipc.on('do-it', function(event, windowId, ...) {
  BrowserWindow.fromId(windowId).webContents.send('done', ...)
});


```

# 剪贴板

``` js
const clipboard = require('electron').clipboard;

clipboard.writeText('往剪贴板里写入内容');
clipboard.readText();  // 返回内容


```



























