const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

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


// local storage
function get_storage(key){
  let json = localStorage.getItem(key);
  if(json){
    return JSON.parse(json);
  }else{
    return null;
  }
}

function set_storage(key,value){
  localStorage.setItem(key,JSON.stringify(value));
  return 'success';
}

// dom
function $(data){
  return document.querySelector(data);
}

function on(dom,event,cb){
  dom.addEventListener(event,cb);
}

module.exports = {
  folder_to_files,
  file_to_object,
  file_tester,
  // music metadata
  file_to_metadata,
  // local storage
  set_storage,
  get_storage,
  // dom function
  $,
  on
}