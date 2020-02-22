const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const fm = require('ffmetadata');
const os = require('os');

const { remote:{dialog:{showSaveDialogSync,showMessageBoxSync}} } = require('electron');

// dialog
//confirm
function show_confirm_message({title,type,message,detail}){

  let msg = showMessageBoxSync(null,{
    title:title ? title : 'title',
    type:type ? type : 'question',
    message:message ? message : 'message title',
    detail:detail ? detail : '',
    buttons:['Cancel','OK'],
    defaultId:0
  })

  if(msg == 0){
    return false;
  }else{
    return true;
  }
}

function show_message({title,type,message,detail}){
  showMessageBoxSync(null,{
    title:title ? title : 'title',
    type:type ? title : 'info',
    message:message ? message : '',
    detail:detail ? detail : '',
    buttons:['OK']
  })

  return true;
}


// save file dialog
function save_cover_dialog(){
  let picture_dir = path.join(os.homedir(),'/Pictures');

  let file = showSaveDialogSync(null,{
    title:'save cover file',
    defaultPath:os.platform() == 'linux'? picture_dir:''
  });
  if(!file) return false;

  return file;
}

/////////////////////
//cover
// remove cover
function remove_cover(file,meta){
  return new Promise((succ,rej)=>{
    fm.write(file,meta,(err)=>{
      if(err) return rej(err);
      succ('success '+file);
    })
  })
}
// save cover
function save_cover(file,picture_data){
  return new Promise((succ,rej)=>{
    fs.writeFile(`${file}.png`,picture_data,(err)=>{
      if(err) return rej(err);
      succ(file);
    });

  })
}

/////////////////////
// metadata
// set metada
function set_meta(file,meta,option){
  return new Promise((succ,rej)=>{
    fm.write(file,meta,option,(err)=>{
      if(err) return rej(err);
      succ('success '+file);
    })
  })
}



// get metada
function get_meta(file){
  return new Promise((succ,rej)=>{
    fm.read(file,(err,meta)=>{
      if(err) return rej(err);
      succ(meta);
    })
  })
}

/////////////////////
// file
function file_tester(file){
  let stat = fs.lstatSync(file);
    if(stat.isFile()){
      let parse = path.parse(file);
      if(/\.mp3$/ig.test(parse.ext)){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
}

function folder_to_files(folder){
  let audio_files = [];

  let files = fs.readdirSync(folder);
  for(let file of files){
    let is_audio = file_tester(`${folder}/${file}`)
    if(is_audio){
      audio_files.push(file);
    }
  }
  return audio_files;
}

// file to metadata
function file_to_metadata(file){

  return new Promise((succ,rej)=>{
    // metadata
    mm.parseFile(file).then(meta =>{
  
      let file_meta = {};
    
      const { common,format } = meta;
      
      file_meta.duration = format.duration;
      // common
      if(common.album){
        file_meta.album = common.album;
      }
      if(common.title){
        file_meta.title = common.title;
      }
      if(common.artist){
        file_meta.artist = common.artist;
      }
      if(common.year){
        file_meta.year = common.year;
      }
      // picture
      if(common.picture){
        file_meta.picture = common.picture[0];
      }
      succ(file_meta);
    }).catch(err => rej(err));

  })
}

// for on file
async function file_to_object(file){
  let parse = path.parse(file);
  
  // let meta = await file_to_metadata(file)

  let file_obj = {
    name:parse.name,
    filename:parse.base,
    ext:parse.ext,
    dir:parse.dir
  }
  return file_obj;
}

// save meta to img
function save_meta_to_img(file,data){
  try {
    fs.writeFileSync(file,data);
    return true;
  } catch (err) {
    return err;
  }

}
////////////////////////
// local storage
// get
function get_storage(key){
  let json = localStorage.getItem(key);
  if(json){
    return JSON.parse(json);
  }else{
    return null;
  }
}
//set
function set_storage(key,value){
  localStorage.setItem(key,JSON.stringify(value));
  return 'success';
}
///////////////////
// dom
function $(data){
  return document.querySelector(data);
}

function on(dom,event,cb){
  dom.addEventListener(event,cb);
}
/////////////////////

module.exports = {
  // message
  show_confirm_message,
  show_message,
  // dialog
  save_cover_dialog,
  // metadata
  set_meta,
  get_meta,
  remove_cover,
  // file
  folder_to_files,
  file_to_object,
  file_tester,
  save_meta_to_img,
  // music metadata
  file_to_metadata,
  // local storage
  set_storage,
  get_storage,
  // dom function
  $,
  on
}