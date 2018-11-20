/*

Todo:

1. asset loading
  DONE: - images
  - sounds
    - footprint (shallow, deep?)
    - birds, water
DONE: 2. game loop
DONE: 3. 'mobile' class
  DONE: - implement rotation
  DONE: - periodic footprint effect (and array)
DONE: 3.A - create session
DONE: 4. save to database
DONE: 5. load data from database
8. persistent world:
  - layout file or new database table
  - editor
  - 'start' locations for events/environment
7. 'events' & environment
  DONE- snow depth
    DONE- collisions
  - birds
    - animations
    - simple movement algorithm
  - trees (grow, die, etc.)
    - simple propagation algorithm
6. visuals (limited UI, graphics)

*/
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

class Circle {
  constructor (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  draw (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = "#fff";
    ctx.closePath();
    ctx.fill();
  }
  update (dt) {}
  overlap (x, y) {
    if (distance(x, y, this.x, this.y) < this.radius) {
      return true;
    } else {
      return false;
    }
  }
}

class Footprint {
  constructor (x, y, angle, step, image) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.step = step;
    this.image = image;
    this.opacity = 1;
  }
  draw (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);
    if (this.step == 1) {
      ctx.scale(-1, 1)
    }
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.image, 0, 0);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  update (dt) {

  }
  data () {
    return {x: this.x, y: this.y, angle: this.angle, step: this.step};
  }
}

class Mobile {
  constructor (x, y, image) {
    this.speed = 32;
    this.position = {x: x, y: y};
    this.angle = 0;
    this.image = image;
  }
  draw (ctx) {
    ctx.drawImage(this.image, this.position.x, this.position.y, 32, 32);
  }
  update (dt) {
    this.position.x += this.speed * Math.cos(this.angle) * dt;
    this.position.y += this.speed * Math.sin(this.angle) * dt;
  }
}

class Walker extends Mobile {
  constructor (x, y, image) {
    super(x, y, image);
    this.distance = 0;
    this.interval = 32;
    this.direction = 0;
    this.step = 0;
    this.footprints = [];
  }
  draw (ctx) {
    for (let i = 0; i < this.footprints.length; i++) {
      this.footprints[i].draw(ctx);
      // ctx.fillStyle = "red";
      // ctx.fillRect(this.footprints[i].x - 2, this.footprints[i].y, 4, 4);
    }
  }
  update (dt) {
    super.update(dt);
    this.angle += this.direction * dt;
    this.distance -= this.speed * dt;
    // console.log(this.distance, this.velocity);
    if (this.distance <= 0) {
      this.step = (this.step + 1) % 2;
      this.distance = this.interval;
      // var footprint = {x: this.position.x, y: this.position.y, angle: this.angle, step: this.step};
      var footprint = new Footprint(this.position.x, this.position.y, this.angle, this.step, this.image);
      this.footprints.push(footprint);
      $.post('save.php', { data: footprint.data() }, function (result) {
        //console.log(result);
      });
    }
  }
}

class Camera extends Mobile {
  draw (ctx) {
    ctx.translate(-this.position.x, -this.position.y);
  }
}

let images = [
  'footprint.png'
];

$(document).ready(function () {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let assets = {};

  let loaded = 0;
  let imageloaded = function (arg) {
    loaded += 1;
    if (loaded >= (images.length - 1)) {
      load();
    }
  }
  for (let i = 0; i < images.length; i++) {
    let image = new Image();
    image.src = 'images/' + images[i];
    image.dataset.name = images[i].split('.')[0];
    image.onload = imageloaded;
    assets[image.dataset.name] = image;
  }

  let drifts = [];
  let entities = [];
  let st;
  let camera;
  let player;

  let load = function () {
    for (let i = 0; i < 10; i++) {
      let c = new Circle(random(-640, 640), random(-640, 640), random(120, 240));
      entities.push(c);
      drifts.push(c);
    }

    $.get('save.php', function (result) {

      let data = JSON.parse(result);
      let sessions = Array.from(new Set(data.map((d) => d.session_time).sort().reverse()));

      for (let i = 0; i < data.length; i++) {
        let f = new Footprint(data[i].x, data[i].y, data[i].angle, data[i].step, assets['footprint']);
        let deep = false;
        for (let i = 0; i < drifts.length; i++) {
          if (drifts[i].overlap(f.x, f.y)) {
            deep = true;
          }
        }
        if (deep) {
          f.opacity = Math.max(10 - sessions.indexOf(data[i].session_time), 1) / 10;
        } else {
          f.opacity = Math.max(10 - sessions.indexOf(data[i].session_time), 1) / 20;
        }
        entities.push(f);
      }
      console.log(data);
      setup();
    });
  };

  let setup = function () {
    // ... create named objects
    player = new Walker(320 + Math.random() * 40 - 20, 320 + Math.random() * 40 - 20, assets['footprint']);
    player.velocity = {x: 0, y: 0};
    player.speed = 48;
    entities.push(player);
    st = new Date();

    camera = new Camera(320, 320);

    document.addEventListener('keydown', function (e) {
      if (e.keyCode == 37) {
        player.direction = -1;
      } else if (e.keyCode == 39) {
        player.direction = 1;
      }
    });

    document.addEventListener('keyup', function (e) {
      player.direction = 0;
    });

    step();
  }

  let step = function () {
    let nt = new Date();
    let dt = (nt - st) / 1000;
    st = nt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let deep = false;
    for (let i = 0; i < drifts.length; i++) {
      if (drifts[i].overlap(player.position.x, player.position.y)) {
        deep = true;
      }
    }
    if (deep) {
      player.speed = 24;
    } else {
      player.speed = 48;
    }

    for (let i = 0; i < entities.length; i++) {
      entities[i].update(dt);
    }
    camera.position = {x: player.position.x - 320, y: player.position.y - 320};

    ctx.save();
    camera.draw(ctx);
    for (let i = 0; i < entities.length; i++) {
      entities[i].draw(ctx);
    }
    ctx.restore();
    window.requestAnimationFrame(step);
  }
});
