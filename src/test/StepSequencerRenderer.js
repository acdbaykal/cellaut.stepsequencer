import {expect} from "chai";
import "web-audio-test-api";
import {CellAutArray, RuleMap} from "cellaut";
import StepSeqRender from "../StepSequencerRender";

/*eslint-disable no-undef*/
describe("StepSequencerRender", function(){
  const init_row = [true, false, true, false, false];
  let render;
  let cell_aut_array;
  let audio_context;

  beforeEach(function(){
    audio_context = new AudioContext();
    render = StepSeqRender(audio_context, 0);

    cell_aut_array = CellAutArray(RuleMap(0), init_row);
  });

  after(function(){
    WebAudioTestAPI.unuse();
  });

  it("should render", function(done){
    cell_aut_array.generate(2);
    render(cell_aut_array, (oscillators, gains) => {
      expect(oscillators.length).to.be.equal(init_row.length);
      expect(gains.length).to.be.equal(init_row.length);
      done();
    });
  });
});
