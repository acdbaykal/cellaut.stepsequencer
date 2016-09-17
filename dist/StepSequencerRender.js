"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = StepSequencerRender;

var _octavian = require("octavian");

function StepSequencerRender(audio_context, step_duration) {
  var default_lowest_note = arguments.length <= 2 || arguments[2] === undefined ? new _octavian.Note("A1") : arguments[2];


  function renderSingleRow(row, gains) {
    for (var i = 0, iLimit = row.length; i < iLimit; i++) {
      var cell = row[i];
      gains[i].gain.value = cell ? 1 : 0;
    }
  }

  return function render(cellaut_arr) {
    var _arguments = arguments;

    var _apply = function () {
      //init optional args
      var len = _arguments.length;
      if (len < 2) {
        return [default_lowest_note, function () {}];
      } else if (len === 2) {
        var optional_arg = _arguments[1];
        var arg_type = typeof optional_arg === "undefined" ? "undefined" : _typeof(optional_arg);
        if (arg_type instanceof _octavian.Note) {
          return [optional_arg, function () {}];
        } else if (arg_type === "function") {
          return [default_lowest_note, optional_arg];
        } else {
          return [default_lowest_note, function () {}];
        }
      } else {
        return [_arguments[1], _arguments[2]];
      }
    }.apply(undefined, arguments);

    var _apply2 = _slicedToArray(_apply, 2);

    var lowest_note = _apply2[0];
    var ext_oncomplete = _apply2[1];


    var state = cellaut_arr.getState();
    var row_length = state[0].length;
    var oscillators = [];
    var gains = [];
    var destination = audio_context.destination;


    for (var i = 0, note = lowest_note; i < row_length; i++, note = note.majorSecond()) {
      var osc = audio_context.createOscillator();
      osc.frequency.value = note.frequency;
      var gain = audio_context.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(destination);
      oscillators[i] = osc;
      gains[i] = gain;
      osc.start();
    }

    function onComplete() {
      //cleanup memory and call external oncomplete callback
      for (var _i = 0; _i < row_length; _i++) {
        var _osc = oscillators[_i];
        var _gain = gains[_i];
        _osc.stop();
        _osc.disconnect();
        _gain.disconnect();
      }
      ext_oncomplete(oscillators, gains);
    }

    var row_count = cellaut_arr.getRowCount();
    var current_row_index = 0;
    var interval = function () {
      function onInterval() {
        current_row_index++;
        if (current_row_index === row_count) {
          //eslint-disable-next-line no-undef
          clearInterval(interval);
          onComplete();
        } else {
          var row = state[current_row_index];
          renderSingleRow(row, gains);
        }
      }

      renderSingleRow(state[0], gains);
      //eslint-disable-next-line no-undef
      return setInterval(onInterval, step_duration);
    }();
  };
}