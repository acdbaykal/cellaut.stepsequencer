import {Note} from "octavian";

export default function StepSequencerRender(audio_context, step_duration, default_lowest_note = new Note("A1")){

  function renderSingleRow(row, gains){
    for(let i = 0, iLimit = row.length; i < iLimit; i++){
      const cell = row[i];
      gains[i].gain.value = cell ? 1 : 0;
    }
  }

  return function render(cellaut_arr){

    const [lowest_note, ext_oncomplete] = (() => { //init optional args
      const len = arguments.length;
      if(len < 2){
        return [default_lowest_note, () => {}];
      }
      else if(len === 2){
        const optional_arg = arguments[1];
        const arg_type = typeof optional_arg;
        if(arg_type instanceof Note){
          return [optional_arg, () => {}];
        }
        else if(arg_type === "function"){
          return [default_lowest_note, optional_arg];
        }
        else{
          return [default_lowest_note, () => {}];
        }
      }
      else{
        return [arguments[1], arguments[2]];
      }
    }).apply(undefined, arguments);

    const state = cellaut_arr.getState();
    const row_length = state[0].length;
    const oscillators = [];
    const gains = [];
    const {destination} = audio_context;

    for(let i = 0, note = lowest_note; i < row_length; i++, note = note.majorSecond()){
      const osc = audio_context.createOscillator();
      osc.frequency.value = note.frequency;
      const gain = audio_context.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(destination);
      oscillators[i] = osc;
      gains[i] = gain;
      osc.start();
    }

    function onComplete(){//cleanup memory and call external oncomplete callback
      for(let i = 0; i < row_length; i++){
        const osc = oscillators[i];
        const gain = gains[i];
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      }
      ext_oncomplete(oscillators, gains);
    }

    const row_count = cellaut_arr.getRowCount();
    let current_row_index = 0;
    const interval = (()=>{
      function onInterval(){
        current_row_index++;
        if(current_row_index === row_count){
          //eslint-disable-next-line no-undef
          clearInterval(interval);
          onComplete();
        }
        else{
          const row = state[current_row_index];
          renderSingleRow(row, gains);
        }
      }

      renderSingleRow(state[0], gains);
      //eslint-disable-next-line no-undef
      return setInterval(onInterval, step_duration);
    })();
  };
}
