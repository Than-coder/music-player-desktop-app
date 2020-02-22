// commom
const comm = require('./common');

class Player {
  static Main(){
    //config
    this.audio = null;
    this.volume = 0.5;
    this.files = [];
    this.song_loop = false;
    this.shuffle = false;
    this.index = 0;
    this.current_song_title = null;
    this.is_show_song_list = false;
    this.is_speaker_bar = false;

  }

  static set_config(config){
    
    for(let con in config){
      this[con] = config[con];
    }
    
    // event listener
    this.event_listener();
  }
  // show cover
  static async show_cover(file){
    try {
      let meta = await comm.file_to_metadata(`${file.dir}/${file.filename}`);
      if(meta.picture){
        let base64 = `data:${meta.picture.format};base64,${Buffer.from(meta.picture.data).toString('base64')}`
        this.cover.src = base64;
        this.background.src = base64;
      }else{
        this.cover.src = 'icon/cover.png';
        this.background.src = '';
      }
      
    } catch (err) {
      console.log(err)
    }
  }
  // set cover metadata
  static async set_cover_file(img){
    let file = this.files[this.index];
    let meta = await comm.get_meta(`${file.dir}/${file.filename}`);
    let option = {
      attachments:[img]
    };
    let res = await comm.set_meta(`${file.dir}/${file.filename}`,meta,option);
    // show conver
    this.show_cover(file);
  }
  // remove cover metadata
  static async remove_cover_file(){
    let file = this.files[this.index];
    let meta = await comm.get_meta(`${file.dir}/${file.filename}`);

    await comm.remove_cover(`${file.dir}/${file.filename}`,meta);
    // show conver
    this.show_cover(file);
  }
  // save cover file
  static async save_cover_file(){
    let file_path = await comm.save_cover_dialog();
    if(file_path == false) return false;
    let file = this.files[this.index];
    // music meta
    let meta = await comm.file_to_metadata(`${file.dir}/${file.filename}`);

    if(meta.picture.data){
      let res = comm.save_meta_to_img(file_path,meta.picture.data);
      if(!res) return false;
      comm.show_message({title:'save img',message:'Cover File Save'})
    }
    
  }

  static async set_index(index=0){
    return new Promise((succ,rej)=>{
      this.index = index;
      if(this.files.length > 0){
        let file = this.files[this.index];
        // title
        this.current_song_title = file.name;
        this.title.innerText = file.name;
        // audio
        this.audio.src = `${file.dir}/${file.filename}`;
        // volume
        this.audio.volume = this.volume;
        // conver
        this.show_cover(file);
        
        this.audio.onloadedmetadata = ()=>{
          // set storage
          comm.set_storage('current-song',{name:file.name,index:this.index});
          this.UI();
          succ();
        }
      }
  

    })
    
  }

  static UI(){
    this.show_song_list();
    this.Timer();
    this.ui_play_btn();
    // volume
    this.speaker_bar.style.width = `${this.volume * 100}%`;
    // loop
    if(this.song_loop){
      this.song_loop_btn.src = 'icon/media-loop-active.svg';
    }else{
      this.song_loop_btn.src = 'icon/media-loop.svg';
    }
    //shuffle
    if(this.shuffle){
      this.song_shuffle_btn.src = 'icon/media-shuffle-active.svg';
    }else{
      this.song_shuffle_btn.src = 'icon/media-shuffle.svg';
    }
  }

  static async Init(files){
    this.files = files;
    let current_song = comm.get_storage('current-song');
    if(current_song){
      let is_found = this.files.find(f => f.name == current_song.name);
      
      if(is_found){
        await this.set_index(current_song.index);
      }else{
        localStorage.removeItem('current-song')
        await this.set_index();
      }
    }else{
      await this.set_index();
    }
    
  }

  static Timer(){
    const { duration,currentTime } = this.audio;

    let dur_sec = Math.floor(duration % 60);
    let dur_min = Math.floor(duration / 60);
    // show dur
    this.duration_time.innerText = `${setZero(dur_min)}:${setZero(dur_sec)}`;

    let cur_sec = Math.floor(currentTime % 60);
    let cur_min = Math.floor(currentTime / 60);
    // show cur
    this.current_time.innerText = `${setZero(cur_min)}:${setZero(cur_sec)}`;
    // show progress bar
    this.time_progress.style.width = `${(currentTime / duration) * 100}%`;


    if(!this.audio.paused){
      setTimeout(() => {
        this.Timer();
      },1000);
    }else{
      this.ui_play_btn();
      if(this.audio.ended){
        this.song_ended();
      }
    }

  }

  static next_song(){
    this.index ++;
    if(this.index == this.files.length){
      this.index = 0
    }

    this.set_index(this.index);
    this.audio.play();
    this.ui_play_btn();
  }

  static prev_song(){
    if(this.index == 0){
      this.index = this.files.length;
    }
    this.index --;

    this.set_index(this.index);
    this.audio.play();
    this.ui_play_btn();
  }

  static ui_play_btn(){
    if(this.audio.paused){
      this.play_btn.src = 'icon/media-play.svg';
    }else{
      this.play_btn.src = 'icon/media-pause.svg';
    }
  }

  static async song_ended(){
    // song no loop
    this.index ++;
    if(this.index == this.files.length){
      this.index = 0
    }
    await this.set_index(this.index);
    // shuffle
    if(this.shuffle){
      let ran = Math.floor(Math.random() * this.files.length);
      await this.set_index(ran);
      this.audio.play();
    }else{
      // loop
      if(this.song_loop){
        this.next_song();
      }else{
        if(this.index == this.files.length){
          this.index = 0;
          await this.set_index(this.index);
        }else{
          await this.set_index(this.index);
          this.audio.play();
        }

      }
    }

    this.UI();
  }

  static show_song_list(){
    if(this.is_show_song_list){
      this.cover.style.display = 'none';
      this.music_list.style.display = 'block';
    }else{
      this.cover.style.display = 'block';
      this.music_list.style.display = 'none';
    }

    let li = '';
    for(let file of this.files){
      li += `
        <li 
        onclick="on_click('${file.name}')"
        id="${this.current_song_title == file.name ? 'current-song-title':''}"
        ${this.current_song_title == file.name ? 'style="background:green;"':''}
        >${song_title_filter(file.name)}</li>
      `;
    }
    this.music_list.innerHTML = li;
  }

  static on_click(name){
    this.files.forEach(async (f,i)=>{
      if(f.name == name){
        await this.set_index(i);
        this.audio.play();
        this.ui_play_btn();
        this.UI();
      }
    })
  }

  static event_listener(){
    // song loop btn
    comm.on(this.song_loop_btn,'click',()=>{
      if(this.song_loop){
        this.song_loop = false;
        this.song_loop_btn.src = 'icon/media-loop.svg';
      }else{
        this.song_loop = true;
        this.song_loop_btn.src = 'icon/media-loop-active.svg';
      }
    })
    // song shuffle btn
    comm.on(this.song_shuffle_btn,'click',()=>{
      if(this.shuffle){
        this.shuffle = false;
        this.song_shuffle_btn.src = 'icon/media-shuffle.svg';
      }else{
        this.shuffle = true;
        this.song_shuffle_btn.src = 'icon/media-shuffle-active.svg';
      }
    })
    // play btn
    comm.on(this.play_btn,'click',e =>{
      if(this.audio.paused){
        this.audio.play();
        this.play_btn.src = 'icon/media-pause.svg';
      }else{
        this.audio.pause();
        this.play_btn.src = 'icon/media-play.svg';
      }
      this.Timer();
    })
    // next
    comm.on(this.next_btn,'click',e =>{
      this.next_song();
    })
    // prev
    comm.on(this.prev_btn,'click',e =>{
      this.prev_song();
    })
    // progress bar
    comm.on(this.time_progress_bar,'click',e =>{
      let width = this.time_progress_bar.clientWidth;
      let offset = e.offsetX;
      let duration = this.audio.duration;
      // set
      this.audio.currentTime = (offset / width) * duration;
      this.time_progress.style.width = `${(offset / width) * 100}%`;
    })
    // song list btn
    comm.on(this.song_list_btn,'click',()=>{
      if(this.is_show_song_list){
        this.is_show_song_list = false;
      }else{
        this.is_show_song_list = true;
      }
      this.show_song_list();
    })
    //speaker
    comm.on(this.song_speaker_btn,'click',(e)=>{
      if(this.is_speaker_bar){
        this.is_speaker_bar = false;
      }else{
        this.is_speaker_bar = true;
      }
      if(this.is_speaker_bar){
        this.speaker_progress.style.display = 'block';
      }else{
        this.speaker_progress.style.display = 'none';
      }
    });
    // speaker progress bar
    comm.on(this.speaker_progress,'click',e =>{
      let width = this.speaker_progress.clientWidth;
      let offset = e.offsetX;
      this.speaker_bar.style.width = `${(offset / width) * 100}%`;
      this.volume = `${(offset / width) % 100}`;
      this.audio.volume = `${(offset / width) % 100}`;
    })
    // body event
    comm.on(comm.$('body'),'click',e =>{
      if(e.target != this.song_speaker_btn && e.target != this.speaker_progress && e.target != this.speaker_bar){
        this.speaker_progress.style.display = 'none';
        this.is_speaker_bar = false;
      }
    })

  }

}
// show song title
function song_title_filter(name){
  name = name.trim()
  name = name.replace(/-/igm,'');
  let start = name.substring(0,10);
  let end = name.substring(name.length - 15,name.length);
  name = name.length > 23 ? `${start}...${end}` : name;
  return name;
}

// set zero
function setZero(time){
  return time < 10 ? '0'+time : time;
}


module.exports = Player;

