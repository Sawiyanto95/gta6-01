export function createAudio(){
  let context=null,master=null,beat=0,elapsed=0;
  function enable(){if(context)return;context=new AudioContext();master=context.createGain();master.gain.value=0.14;master.connect(context.destination);}
  function tone(frequency,duration,wave='sine',volume=0.12,delay=0){if(!context)return;const start=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();osc.type=wave;osc.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+0.012);gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);osc.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+duration+0.025);}
  function effect(name){enable();if(name==='mission'){tone(440,.15,'triangle');tone(659,.2,'triangle',.1,.12);}else if(name==='success'){tone(392,.28,'triangle');tone(523,.28,'triangle',.1,.17);tone(784,.4,'triangle',.1,.35);}else if(name==='crime'){tone(180,.32,'sawtooth',.09);tone(145,.34,'sawtooth',.08,.18);}else if(name==='fail'){tone(260,.28,'triangle');tone(185,.4,'triangle',.08,.2);}else{tone(240,.06,'square',.08);tone(120,.09,'triangle',.07,.05);}}
  function update(dt,active){if(!context||!active)return;elapsed+=dt;if(elapsed>0.56){elapsed=0;const bass=[110,110,146.8,130.8,98,98,130.8,123.5];tone(bass[beat%8],.34,'triangle',.045);if(beat%2===0)tone(beat%4===0?587:493,.16,'sine',.022,.08);beat++;}}
  return {enable,effect,update};
}
