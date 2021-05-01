const core = require('elementary-core');
const el = require('@nick-thompson/elementary');

// A simple FM Synthesis example where the carrier is a sine wave at the given
// frequency, and the modulator is a slightly saturated sine wave at the same
// frequency.
//
// The FM amount ratio oscillates between [1, 3] at 0.1Hz.
function voice(fq) {
  return el.cycle(
    el.add(
      fq,
      el.mul(
        el.mul(el.add(2, el.cycle(0.1)), fq),
        el.tanh(el.cycle(fq)),
      ),
    ),
  );
}

// Slightly detuned voices in the left and right channel give a cool binaural
// beating pattern.
// core.on('load', function() {
//   core.render(
//     voice(220),
//     voice(221),
//   );
// });

// Or we can use the seq node with hold: true to generate an arpeggio, here
// with still slightly detuned voices in the left and right channel.
const e4 = 329.63;
const b4 = 493.88;
const e5 = 659.26;
const g5 = 783.99;

const s1 = [e4, b4, e5, e4, g5].map(x => x * 0.5);
const s2 = [e4, b4, g5, b4, e5].map(x => x * 0.499); // Slightly detuned

core.on('load', function() {
  let gate = el.train(5);
  let env = el.adsr(0.004, 0.01, 0.2, 0.5, gate);
  let left = el.mul(env, voice(el.sm(el.seq({seq: s1, hold: true}, gate))));
  let right = el.mul(env, voice(el.sm(el.seq({seq: s2, hold: true}, gate))));

  core.render(
    el.add(left, el.delay({size: 44100}, el.ms2samps(400), -0.49, el.mul(0.3, left))),
    el.add(right, el.delay({size: 44100}, el.ms2samps(300), -0.49, el.mul(0.3, right))),
  );
});
