window.onload = function () {
  let steps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let notes = {
      'C0': 16.35,
      'C#0': 17.32,
      'Db0': 17.32,
      'D0': 18.35,
      'D#0': 19.45,
      'Eb0': 19.45,
      'E0': 20.60,
      'F0': 21.83,
      'F#0': 23.12,
      'Gb0': 23.12,
      'G0': 24.50,
      'G#0': 25.96,
      'Ab0': 25.96,
      'A0': 27.50,
      'A#0': 29.14,
      'Bb0': 29.14,
      'B0': 30.87,
      'C1': 32.70,
      'C#1': 34.65,
      'Db1': 34.65,
      'D1': 36.71,
      'D#1': 38.89,
      'Eb1': 38.89,
      'E1': 41.20,
      'F1': 43.65,
      'F#1': 46.25,
      'Gb1': 46.25,
      'G1': 49.00,
      'G#1': 51.91,
      'Ab1': 51.91,
      'A1': 55.00,
      'A#1': 58.27,
      'Bb1': 58.27,
      'B1': 61.74,
      'C2': 65.41,
      'C#2': 69.30,
      'Db2': 69.30,
      'D2': 73.42,
      'D#2': 77.78,
      'Eb2': 77.78,
      'E2': 82.41,
      'F2': 87.31,
      'F#2': 92.50,
      'Gb2': 92.50,
      'G2': 98.00,
      'G#2': 103.83,
      'Ab2': 103.83,
      'A2': 110.00,
      'A#2': 116.54,
      'Bb2': 116.54,
      'B2': 123.47,
      'C3': 130.81,
      'C#3': 138.59,
      'Db3': 138.59,
      'D3': 146.83,
      'D#3': 155.56,
      'Eb3': 155.56,
      'E3': 164.81,
      'F3': 174.61,
      'F#3': 185.00,
      'Gb3': 185.00,
      'G3': 196.00,
      'G#3': 207.65,
      'Ab3': 207.65,
      'A3': 220.00,
      'A#3': 233.08,
      'Bb3': 233.08,
      'B3': 246.94,
      'C4': 261.63,
      'C#4': 277.18,
      'Db4': 277.18,
      'D4': 293.66,
      'D#4': 311.13,
      'Eb4': 311.13,
      'E4': 329.63,
      'F4': 349.23,
      'F#4': 369.99,
      'Gb4': 369.99,
      'G4': 392.00,
      'G#4': 415.30,
      'Ab4': 415.30,
      'A4': 440.00,
      'A#4': 466.16,
      'Bb4': 466.16,
      'B4': 493.88,
      'C5': 523.25,
      'C#5': 554.37,
      'Db5': 554.37,
      'D5': 587.33,
      'D#5': 622.25,
      'Eb5': 622.25,
      'E5': 659.26,
      'F5': 698.46,
      'F#5': 739.99,
      'Gb5': 739.99,
      'G5': 783.99,
      'G#5': 830.61,
      'Ab5': 830.61,
      'A5': 880.00,
      'A#5': 932.33,
      'Bb5': 932.33,
      'B5': 987.77,
      'C6': 1046.50,
      'C#6': 1108.73,
      'Db6': 1108.73,
      'D6': 1174.66,
      'D#6': 1244.51,
      'Eb6': 1244.51,
      'E6': 1318.51,
      'F6': 1396.91,
      'F#6': 1479.98,
      'Gb6': 1479.98,
      'G6': 1567.98,
      'G#6': 1661.22,
      'Ab6': 1661.22,
      'A6': 1760.00,
      'A#6': 1864.66,
      'Bb6': 1864.66,
      'B6': 1975.53,
      'C7': 2093.00,
      'C#7': 2217.46,
      'Db7': 2217.46,
      'D7': 2349.32,
      'D#7': 2489.02,
      'Eb7': 2489.02,
      'E7': 2637.02,
      'F7': 2793.83,
      'F#7': 2959.96,
      'Gb7': 2959.96,
      'G7': 3135.96,
      'G#7': 3322.44,
      'Ab7': 3322.44,
      'A7': 3520.00,
      'A#7': 3729.31,
      'Bb7': 3729.31,
      'B7': 3951.07,
      'C8': 4186.01
  }

  let colors = [
    "#9400D3",
    // "#6f00aa",
    "#4B0082",
    // "#2500c0",
    "#0000FF",
    // "#007f7f",
    "#00FF00",
    // "#7fff00",
    "#FFFF00",
    // "#ffbf00",
    "#FF7F00",
    // "#ff3f00",
    "#FF0000",
    "deeppink"
  ];

  const THRESHOLD = 100;

  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let audioctx = new AudioContext();

  // to avoid clipping with a lot of notes, I added a compressor?  It only goes so far though...

  let compressor = audioctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-50, audioctx.currentTime);
  compressor.knee.setValueAtTime(40, audioctx.currentTime);

  // scalesteps are the indexes for each step in the scale, which is converted to strings to lookup the note frequencies

  let scalesteps = [0,3,7,12,15,19,24,27];
  let scale = ["C4", "D#4", "F4", "F#4", "G4", "A#4", "C5", "D#5"];

  // global variables for setting note range

  let octave = 4;
  let sustain = 2;
  let type = 'sine';
  let tonic = 0;

  let octaveselector = document.getElementById("octave");
  let scaleselector = document.getElementById("scale");
  let tonicselector = document.getElementById('tonic');

  let sustainselector = document.getElementById('sustain');
  sustainselector.addEventListener('input', function (e) {
    sustain = parseFloat(this.value);
  });

  let typeselector = document.getElementById('type');
  typeselector.addEventListener('input', function () {
    type = this.value;
  });

  let resetbutton = document.getElementById('reset');
  reset.addEventListener('click', function () {
    for (let i = 0; i < entities.length; i++) {
      entities[i].alive = false;
    }
  });

  let changebutton = document.getElementById('change');
  change.addEventListener('click', function () {
    tonic = parseInt(tonicselector.value);
    scalesteps = JSON.parse(scaleselector.value);
    octave = parseInt(octaveselector.value);
    update_keys();
  });

  let keys = document.getElementsByClassName("key");

  // updates the scale array with currently selected info (also UI)

  function update_keys() {
    scale = scalesteps.map(function (n) {
      return steps[(n + tonic) % steps.length] + "" + (octave + Math.floor(n / steps.length));
    });
    for (let i = 0; i < keys.length; i++) {
      keys[i].text = scale[i];
      keys[i].style.background = colors[i % colors.length];
    }
  }
  update_keys();

  // just some helper functions!

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }
  function clamp(n, min, max) {
    return Math.max(Math.min(n, max), min);
  }
  function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function random_color () {
    let r = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    let g = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    let b = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    return "#" + r + g + b;
  }

  class Ellipse {
    constructor (x, y, radius, key) {
      this.alive = true;
      this.sustain = sustain;//Math.random() * 3 + 1;
      this.key = key;
      this.type = "sine";
      this.opacity = 1;
      this.color = colors[this.key % colors.length]; //random_color();
      this.x = x, this.y = y, this.radius = radius,
      this.velocity = {x: Math.floor(Math.random() * 80) - 40, y: -200};
      this.acceleration = {x: 0, y: 400};
      this.maxvelocity = 640;
      this.angle = Math.random() *  Math.PI * 2;
    }
    shape (ctx, w) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, w, 0, 2 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
    }
    draw (ctx) {
      ctx.globalAlpha = Math.min(this.opacity, 0.9);
      ctx.fillStyle = this.color;
      this.shape(ctx, this.radius);
      ctx.globalAlpha = 1;
    }
    play () {
      let osc = audioctx.createOscillator();
      let gn = audioctx.createGain();
      osc.type = this.type;
      osc.connect(gn);
      gn.connect(compressor);
      compressor.connect(audioctx.destination);
      osc.frequency.value = notes[scale[this.key]];
      keys[this.key].style.opacity = 1;
      this.fadeOut = true;
      osc.start();
      gn.gain.setValueAtTime(this.opacity, audioctx.currentTime);
      gn.gain.exponentialRampToValueAtTime( 0.00001, audioctx.currentTime + this.sustain);
    }
    update (dt) {
      if (this.alive == false) {
        this.opacity = clamp(this.opacity - dt, 0, 1);
      }
      this.velocity.x = clamp(this.velocity.x + this.acceleration.x * dt, -this.maxvelocity, this.maxvelocity);
      this.velocity.y = clamp(this.velocity.y + this.acceleration.y * dt, -this.maxvelocity, this.maxvelocity);

      this.x += this.velocity.x * dt;
      this.y += this.velocity.y * dt;

      if ((this.y > (canvas.height - this.radius)) || (this.y < this.radius)) {
        this.y = Math.min(canvas.height - this.radius, Math.max(this.radius, this.y));
        this.velocity.y *= -1;
        this.play();
        if (Math.abs(this.velocity.y) < THRESHOLD) {
          this.alive = false;
        }
      }
      if ((this.x > canvas.width - this.radius) || (this.x < this.radius)) {
        this.x = clamp(this.x, this.radius, canvas.width - this.radius);
        this.velocity.x *= -1;
      }
      if (this.fadeOut) {
        if (keys[this.key].style.opacity > 0.5) {
          keys[this.key].style.opacity -= 2 * dt;
          console.log('fading out');
        } else {
          this.fadeOut = false;
          this.fadeIn = true;
        }
      } else if (this.fadeIn) {
        if (keys[this.key].style.opacity >= 1) {
          this.fadeIn = false;
          keys[this.key].style.opacity = 1;
        } else {
          // note: without 'parseFloat', javascript combines these as strings, but when using '-', it converts to numbers, since strings can't be subtracted
          keys[this.key].style.opacity = parseFloat(keys[this.key].style.opacity) + 2 * dt;
        }
      }
    }
    overlap (x, y, w = 0) {
      return distance(this.x, this.y, x, y) < (this.radius + w);
    }
  }

  // so... all the other shapes also collide as if they were circles.... just easier that way!
  class Square extends Ellipse {
    constructor (x, y, radius, note, speed = 10) {
      super(x, y, radius, note, speed);
      this.type = 'square';
    }
    shape (ctx, w) {
      ctx.fillRect(this.x - w, this.y - w, 2 * w, 2 * w);
    }
  }

  class Triangle extends Ellipse {
    constructor (x, y, radius, note, speed = 10) {
      super(x, y, radius, note, speed);
      this.type = 'triangle';
    }
    shape (ctx, w) {
      ctx.beginPath();
      ctx.moveTo(this.x - w, this.y + w);
      ctx.lineTo(this.x + w, this.y + w);
      ctx.lineTo(this.x, this.y - w);
      ctx.closePath();
      ctx.fill();
    }
  }

  class Saw extends Ellipse {
    constructor (x, y, radius, note, speed = 10) {
      super(x, y, radius, note, speed);
      this.type = 'sawtooth';
    }
    shape (ctx, w) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - w);
      ctx.lineTo(this.x - w / 2, this.y + 2 * w / 3);
      ctx.lineTo(this.x + w, this.y - w / 3);
      ctx.lineTo(this.x - w, this.y - w / 3);
      ctx.lineTo(this.x + w / 2, this.y + 2 * w / 3);
      ctx.closePath();
      ctx.fill();
    }
  }

  let entities = [];

  let entity = undefined;

  let keydown = -1;
  let keystrength = 0;
  let keycodes = [65, 83, 68, 70, 71, 72, 74, 75];

  document.addEventListener('keydown', function (e) {
    if (keydown == -1) {
      keydown = keycodes.indexOf(e.keyCode);
      if (keydown != -1) {
        let x = Math.floor(canvas.width * (keydown + 0.5) / keycodes.length);
        if (type == "sine") {
          entity = new Ellipse(x, canvas.height - 18, 16, keydown, 0);
        } else if (type == "square") {
          entity = new Square(x, canvas.height - 18, 16, keydown, 0);
        } else if (type == "triangle") {
          entity = new Triangle(x, canvas.height - 18, 16, keydown, 0);
        } else if (type == "sawtooth") {
          entity = new Saw(x, canvas.height - 18, 16, keydown, 0);
        }
      }
    }
  });

  document.addEventListener('keyup', function (e) {
    if (keycodes.indexOf(e.keyCode) == keydown) {
      if (entity) {
        entity.velocity.y = -1 * keystrength;
        entities.push(entity);
        keystrength = 0;
        keydown = -1;
        entity = undefined;
      }
    }
  });

  let st = new Date();
  function step() {
    let nt = new Date();
    let dt = (nt - st) / 1000;
    st = nt;

    if (keydown != -1) {
      keystrength = clamp(keystrength + 1000 * dt, 0, 560);
    }

    for (let i = 0; i < entities.length; i++) {
      entities[i].update(dt);
    }

    // clear screen (with BG image), but with 0.1 opacity to leave trail

    ctx.globalAlpha = 0.1;
    for (let i = 0; i <= canvas.width; i += 68) {
      for (let j = 0; j <= canvas.height; j += 34) {
          ctx.drawImage(fabric, i, j);
      }
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < entities.length; i++) {
      entities[i].draw(ctx);
    }

    // drawing the indicator when you are pressing down a key:

    let h = keystrength / 2;
    ctx.fillStyle = colors[keydown % colors.length];
    ctx.strokeStyle = colors[keydown % colors.length];
    let x = Math.floor(canvas.width * (keydown + 0.5) / keycodes.length);
    ctx.beginPath();
    ctx.moveTo(x, canvas.height);
    ctx.lineTo(x, canvas.height - h);
    ctx.lineTo(x + 16, canvas.height - h);
    ctx.lineTo(x, canvas.height - h - 16);
    ctx.lineTo(x - 16, canvas.height - h);
    ctx.lineTo(x, canvas.height - h);
    ctx.closePath();
    ctx.stroke();

    for (let i = entities.length - 1; i >= 0; i--) {
      if (entities[i].alive == false && entities[i].opacity <= 0) {
        entities.splice(i, 1);
      }
    }

    window.requestAnimationFrame(step);
  }

  let fabric = new Image();
  fabric.src = "./fabric_dark.png";

  // wait for image to be loaded to start!

  fabric.onload = function () {
    step();
  };

};
