const electron = require('electron');
const path = require('path');


const { showMessageBoxSync } = electron.dialog;
const { app,BrowserWindow,Menu} = electron;

let home_window = null;
let main_menu = null;

function Init(){
  home_window = new BrowserWindow({
    icon:path.join(__dirname,'icon/linux/256x256.png'),
    width:400,
    height: 500,
    minWidth:400,
    minHeight: 500,
    webPreferences:{
      nodeIntegration:true
    }
  });
  //load home html
  home_window.loadFile(path.join(__dirname,'home/index.html'));
  // menu
  main_menu = [
    {
      label:'File',
      submenu:[
        {
          label:'Open One Music File',
          click(){
            home_window.webContents.send('choose-file');
          }
        },
        {
          label:'Open One Music Folder',
          click(){
            home_window.webContents.send('choose-folder');
          }
        },
        {
          label:'Exit',
          accelerator:'Ctrl+Q',
          click(){
            app.quit();
          }
        }
      ]
    },
    {
      label:'View',
      submenu:[
        {role:'reload'},
        {role:'toggledevtools'}
      ]
    },
    {
      label:'Help',
      submenu:[
        {
          label:'About',
          click(){
            show_about();
          }
        }
      ]
    }
  ];
  //when home window close
  home_window.on('close',()=> app.quit());
  // dev tools
  // home_window.webContents.openDevTools();
  // menu
  // build menu
  const buildMenu = Menu.buildFromTemplate(main_menu);
  // set menu
  Menu.setApplicationMenu(buildMenu);
  // when main window close all window close
  home_window.on('closed',()=> app.quit());

  
}

// show_help
function show_about(){
  showMessageBoxSync(null,{
    title:'About',
    type:'info',
    buttons:['OK'],
    message:'TZW Music Player',
    detail:`
    Delevoped By Than Developer
    Live in Myanmar`
  })
}

app.on('ready',()=>{
  Init();
});