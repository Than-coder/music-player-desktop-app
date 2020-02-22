const electron = require('electron');

// commom
const comm = require('./js/common');
// player
const Music_Player = require('./js/Player');

const player_config = {
  audio:new Audio(),
  title:comm.$('.song-title'),
  cover:comm.$('.music-cover img'),
  background:comm.$('.background'),
  music_list:comm.$('.music-list'),
  // UI
  time_progress_bar:comm.$('.progress-bar'),
  time_progress:comm.$('.progress'),
  current_time:comm.$('.cur-time'),
  duration_time:comm.$('.dur-time'),
  // speaker
  speaker_progress:comm.$('.speaker-progress '),
  speaker_bar:comm.$('.speaker-progress .bar'),
  // Button
  song_loop_btn:comm.$('.song-loop img'),
  song_shuffle_btn:comm.$('.song-shuffle img'),
  song_list_btn:comm.$('.song-list img'),
  song_speaker_btn:comm.$('.song-speaker img'),
  play_btn:comm.$('.play img'),
  next_btn:comm.$('.next img'),
  prev_btn:comm.$('.prev img'),
}

const { remote:{dialog:{showOpenDialogSync}},ipcRenderer } = electron;

class Home {
  static Main(){
    this.files = [];
    // player init
    Music_Player.Main();
    // set config
    Music_Player.set_config(player_config);
  }

  static Init(){
    
    // get storage
    if(this.files.length == 0){
      let files = comm.get_storage('song_files');
      if(files){
        this.files = files;
      }
    }
    // music player
    Music_Player.Init(this.files);
    
  }

  static set_files(files){
    this.files = files;
    // localStorage.removeItem('song_files');
    // set storage
    comm.set_storage('song_files',files);
    this.Init();
  }
}

Home.Main();

// dom event listener
function on_click(name){
  Music_Player.on_click(name);
}


// open cover file
function open_cover_file(){
  comm.$('.right-click').style.display = 'none';
  let dia = showOpenDialogSync({
    properties:['multiSelections'],
    filters:[
      {extensions:['png','jpg'],name:'music cover file'}
    ]
  })
  if(!dia) return false;
  // set cover
  Music_Player.set_cover_file(dia[0]);
}

// remove cover file
function remove_cover_file(){
  let res = comm.show_confirm_message({title:'Cover Remove',type:'warning',message:'Are Your Sure?'});
  if(!res) return false;
  Music_Player.remove_cover_file();
}
// save cover file
function save_cover_file(){
  Music_Player.save_cover_file();
}


// javascrpt enventlistener

// body event
comm.on(comm.$('body'),'click',e =>{
  if(e.target != comm.$('.music-cover') && e.target != comm.$('.right-click') && e.target != comm.$('.music-cover img') && e.target != comm.$('.music-list')){
    comm.$('.right-click').style.display = 'none';
  }
})

// cover mouse right click
comm.on(comm.$('.music-cover'),'mousedown',e =>{
  if(e.which == 3){
    let width = comm.$('.music-cover').clientWidth;
    let height = comm.$('.music-cover').clientHeight;
    let x = e.offsetX;
    let y = e.offsetY;
    let mouse_option_box = {
      top:(y / height) * 100,
      left: (x / width ) * 100
    }
    comm.$('.right-click').style.display = 'block';
    comm.$('.right-click').style.top = `${mouse_option_box.top}%`;
    comm.$('.right-click').style.left = `${mouse_option_box.left}%`;
    // open_cover_file();
  }
})


// electron listener
// open file
ipcRenderer.on('choose-file',async ()=> {
  let dia = showOpenDialogSync({
    properties:['multiSelections'],
    filters:[
      {extensions:['mp3'],name:'Audio'},
      {extensions:['*'],name:'All Files'}
    ]
  })
  if(!dia) return false;
  let audio_files = [];
  for(let file of dia){
    let is_audio = comm.file_tester(file);
    if(is_audio){
      let object = await comm.file_to_object(file);
      audio_files.push(object);
    }
  }


  Home.set_files(audio_files);
})

// open folder
ipcRenderer.on('choose-folder',async ()=> {
  let dia = showOpenDialogSync({
    properties:['createDirectory','openDirectory']
  });
  if(!dia) return false;

  let mp3_files = [];
  let files = comm.folder_to_files(dia[0]);
  for(let file of files){
    let obj = await comm.file_to_object(`${dia[0]}/${file}`);
    mp3_files.push(obj);
  };

  Home.set_files(mp3_files);
})



Home.Init()