
import { H as Hls } from './hls-vendor-dru42stk.js';
const boxes=document.querySelectorAll('.player-box');
boxes.forEach(box=>{
  const video=box.querySelector('video');
  const button=box.querySelector('.play-layer');
  let ready=false;
  function bind(){
    if(ready)return;
    ready=true;
    const src=box.getAttribute('data-src');
    if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src;}
    else if(Hls&&Hls.isSupported()){
      const hls=new Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
    }else{video.src=src;}
  }
  function play(){bind();box.classList.add('is-playing');video.play().catch(()=>{});}
  if(button)button.addEventListener('click',play);
  video.addEventListener('click',()=>{if(video.paused)play();});
});
