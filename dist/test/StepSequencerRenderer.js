"use strict";

var _chai = require("chai");

require("web-audio-test-api");

var _cellaut = require("cellaut");

var _StepSequencerRender = require("../StepSequencerRender");

var _StepSequencerRender2 = _interopRequireDefault(_StepSequencerRender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*eslint-disable no-undef*/
describe("StepSequencerRender", function () {
  var init_row = [true, false, true, false, false];
  var render = void 0;
  var cell_aut_array = void 0;
  var audio_context = void 0;

  beforeEach(function () {
    audio_context = new AudioContext();
    render = (0, _StepSequencerRender2.default)(audio_context, 0);

    cell_aut_array = (0, _cellaut.CellAutArray)((0, _cellaut.RuleMap)(0), init_row);
  });

  after(function () {
    WebAudioTestAPI.unuse();
  });

  it("should render", function (done) {
    cell_aut_array.generate(2);
    render(cell_aut_array, function (oscillators, gains) {
      (0, _chai.expect)(oscillators.length).to.be.equal(init_row.length);
      (0, _chai.expect)(gains.length).to.be.equal(init_row.length);
      done();
    });
  });
});