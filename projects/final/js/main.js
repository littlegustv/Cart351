/*

Attribution:

'jingle.wav': https://freesound.org/people/Robinhood76/sounds/63272/
'chirp.wav': https://freesound.org/people/Mattix/sounds/441312/


*/


let resources = [
  'step.wav',
  'collect.wav',
  'jingle.wav',
  'chirp.wav',
  'frame.png',
  'feather.png',
  'footprint.png',
  'bird.png',
  'birdprint.png',
  'reigndeer.png',
  'reigndeer-footprint.png',
  'snowman.png',
  'snowmansmall.png',
  'gingerbread.png',
  'gift.png',
  'pinecone.png',
  'bell.png',
  'ornament.png',
  'wall.png',
  'tree.png',
  'decoratedtree.png',
  'tree-dead.png',
  'cobblestone.png',
  'snowflake.png',
];


let scavenger = ['pinecone', 'feather', 'bell', 'gingerbread', 'gift'];

let paths = [];
let solids = [];
let entities = [];
let items = [];

let ui = {};
let points = 0;

let player;

let assets = {};

let global_footprints = [];

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function modulo(n, p) {
  return (n % p + p) % p;
}

function short_angle(a1, a2) {
  var MAX = Math.PI * 2;
  var da = (a2 - a1) % MAX;
  return 2 * da % MAX - da;
}

function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function sign (n) {
  if (n > 0) return 1;
  else if (n < 0) return -1;
  else return 0;
}

class Circle {
  constructor (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = "#444";
  }
  draw (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = this.color;
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
  push (x, y) {
    let theta = angle(this.x, this.y, x, y);
    return {x: this.x + this.radius * Math.cos(theta), y: this.y + this.radius * Math.sin(theta)};
  }
}

class Tree extends Circle {
  constructor(x, y, radius, image, entities) {
    super(x, y, radius);
    this.image = image;
    this.entities = entities;
  }
  draw (ctx) {
    ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius);
  }
}

class Text {
  constructor (x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
  }
  update (dt) {}
  draw (ctx) {
    ctx.fillStyle = "black";
    ctx.fillText(this.text, this.x, this.y);
  }
}

class Rectangle {
  constructor (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = "#eee";
  }
  draw (ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
  }
  update (dt) {}
  overlap (x, y) {
    if ((x > (this.x - this.w / 2)) && (x < (this.x + this.w / 2))) {
      //console.log('width', this.x - this.w / 2, x);
      if ((y > (this.y - this.h / 2)) && (y < (this.y + this.h / 2))) {
        //console.log('height', this.y - this.h / 2, this.y + this.h / 2, y);
        return true;
      }
    }
    return false;
  }
  push (x, y) {
    let dx = (x - this.x) / (this.w / 2);
    let dy = (y - this.y) / (this.h / 2);
    if (Math.abs(dx) > Math.abs(dy)) {
      return {x: this.x + sign(dx) * this.w / 2, y: y};
    } else {
      return {x: x, y: this.y + sign(dy) * this.h / 2};
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
    this.deep = false;
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
    this.x = x;
    this.y =  y;
    this.angle = 0;
    this.image = image;
  }
  draw (ctx) {
    ctx.drawImage(this.image, this.x - this.image.width / 2, this.y - this.image.height / 2, 32, 32);
  }
  update (dt) {
    this.x += this.speed * Math.cos(this.angle) * dt;
    this.y += this.speed * Math.sin(this.angle) * dt;
  }
}

class Walker extends Mobile {
  constructor (x, y, image) {
    super(x, y, image);
    this.distance = 0;
    this.interval = 16;
    this.direction = 0;
    this.step = 0;
    this.w = 16;
    this.h = 16;
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
      // var footprint = {x: this.x, y: this.y, angle: this.angle, step: this.step};
      // console.log('adding footprint', this.x, this.angle, this.step);
      var footprint = new Footprint(this.x - Math.cos(this.angle) * this.w, this.y - Math.sin(this.angle) * this.h, this.angle, this.step, this.image);
      if (this.speed > 24) {
        footprint.opacity = 0.5;
      } else {
        footprint.opacity = 0.9;
      }
      this.footprints.push(footprint);
      this.save(footprint);
    }
  }
  save (footprint) {}
}

class Player extends Walker {
  save (footprint) {
  	assets['step'].play();
    $.post('save.php', { data: footprint.data() }, function (result) {
      //console.log(result);
    });
  }
}

class Snowflake extends Mobile {
  constructor (x, y, image) {
    super(x, y, image);
    this.angle = Math.PI / 4;
    this.time = 0;
    this.speed = random(24,48);
  }
  update (dt) {
    super.update(dt);
    this.time += dt;
    this.opacity = 2.1 - this.time;
    if (this.time > 2) {
      this.alive = false;
    }
  }
  draw (ctx) {
    ctx.globalAlpha = this.opacity;
    // ctx.fillStyle = "#f5f5f5";
    // ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
    ctx.drawImage(this.image, this.x - this.image.width / 2, this.y - this.image.height / 2);
    ctx.globalAlpha = 1;
  }
}

class Sprite extends Circle {
  constructor (x, y, image, radius) {
    super(x, y, radius);
    this.image = image;
  }
  update (dt) {}
  draw (ctx) {
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
    // ctx.fillStyle = "red";
    // ctx.fill();
    ctx.drawImage(this.image, this.x - this.image.width / 2, this.y - this.image.height / 2);
  }
  interact (entities) {
  }
}

class TiledBackground extends Rectangle {
  constructor (x, y, w, h, image) {
    super(x, y, w, h);
    this.image = image;
    this.image_w = image.width;
    this.image_h = image.height;
  }
  draw (ctx) {
    if (!this.pattern) {
  		this.pattern = ctx.createPattern(this.image,"repeat");
    }
    ctx.fillStyle = this.pattern;
    ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
  }
}

class Bird extends Walker {
  constructor (x, y, image, sprite, global_footprints) {
    super(x, y, image);
    this.startx = x;
    this.starty = y;
    this.sprite = sprite;
    this.w = this.sprite.width;
    this.h = this.sprite.height;
    this.interval = 12;
    this.speed = 24;
    this.global_footprints = global_footprints;
    this.detection_radius = 80;
    this.object = assets['feather'];
    this.sound = assets['chirp'];
    this.chance = 5;
  }
  update (dt) {
    if (this.distance <= this.speed * dt) {
      let theta = 0;
      let count = 0;
      for (let i = 0; i < this.global_footprints.length; i++) {
        if (distance(this.global_footprints[i].x, this.global_footprints[i].y, this.x, this.y) < this.detection_radius && this.global_footprints[i].deep) {
          theta += modulo(angle(this.x, this.y, this.global_footprints[i].x, this.global_footprints[i].y), 2 * Math.PI);
          count += 1;
        }
      }
      // feather
      if (Math.random() * 1000 < this.chance) {
        let e = new Sprite(this.x, this.y, this.object, 16);
        entities.push(e);
        items.push(e);
      }

      if (count > 0) {
        theta = Math.PI + theta / count;
      } else { // return home otherwise
        theta = angle(this.x, this.y, this.startx, this.starty) + (Math.random() - 0.5) * Math.PI;
      }
      this.angle = this.angle + short_angle(this.angle, theta) / 8;
      //console.log('angle set!', theta, count, this.angle);

      if (this.footprints.length > 50) {
      	this.footprints.shift();
      }
    }
    if (Math.random() * 1000 < 4) {
		this.sound.volume = Math.max(0, 640 - distance(this.x, this.y, player.x, player.y)) / 640;
		this.sound.play();
	}
    super.update(dt);
  }
  draw (ctx) {
    super.draw(ctx);
    ctx.drawImage(this.sprite, this.x - 8, this.y - 12);
    // ctx.beginPath();
    // ctx.moveTo(this.x, this.y);
    // ctx.lineTo(this.x + 64 * Math.cos(this.angle), this.y + 64 * Math.sin(this.angle));
    // ctx.stroke();
  }
}

class Reigndeer extends Bird {
  constructor (x, y, image, sprite, global_footprints) {
    super(x, y, image, sprite, global_footprints);
    this.interval = 16;
    this.speed = 48;
    this.object = assets['bell'];
    this.sound = assets['jingle'];
    this.time = 0;
    this.chance = 5;
  }
  update (dt) {
    super.update(dt);
    this.time += dt;
    this.speed = 48 + 32 * Math.sin(this.time);
  }
  draw (ctx) {
    //super.draw(ctx);
    for (let i = 0; i < this.footprints.length; i++) {
      this.footprints[i].draw(ctx);
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.sprite, 0, 0);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

class Snowman extends Sprite {
  constructor (x, y, sprite, radius) {
    super(x, y, sprite, radius);
    this.color = "rgba(0,0,0,0.1)";
    this.endx = this.x + (2 * random(0, 2) - 1) * (5 * this.radius);
    this.endy = this.y;
  }
  draw (ctx) {
    ctx.beginPath();
    let offset = 0;
    if (this.radius >= 16) {
    	offset = 16;
    }
    ctx.arc(this.x, this.y + offset, this.radius / 2, 0,Math.PI , true);
    //ctx.moveTo(this.x - this.radius / 2, this.y - this.radius / 2);
    if (this.endx < this.x) {
	    ctx.quadraticCurveTo((this.x + this.endx) / 2, this.y + 48, this.endx, this.endy);
	    ctx.quadraticCurveTo((this.x + this.endx) / 2, this.y + 48 + this.radius, this.x + this.radius / 2, this.y + offset);
    } else {
    	ctx.quadraticCurveTo((this.x + this.endx) / 2, this.y + 48 + this.radius, this.endx, this.endy);
	    ctx.quadraticCurveTo((this.x + this.endx) / 2, this.y + 48, this.x + this.radius / 2, this.y + offset);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    super.draw(ctx);
  }
}

class Camera extends Mobile {
  draw (ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}

$(document).ready(function () {
  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  ctx.font = "8px monospace";

  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  canvas.style.imageRendering = "optimizeSpeed";
  canvas.style.imageRendering = "-moz-crisp-edges";
  canvas.style.imageRendering = "-webkit-optimize-contrast";
  canvas.style.imageRendering = "-o-crisp-edges";
  canvas.style.imageRendering = "pixelated";
  canvas.style.msInterpolationMode = "nearest-neighbor";

  let loaded = 0;

  let start = function () {
    canvas.removeEventListener('click', start);
    load();
  };

  let resourceloaded = function (arg) {
    loaded += 1;
    if (loaded > (resources.length - 1)) {
      ctx.fillText('click anywhere to start', 16, canvas.height / 2);
      canvas.addEventListener('click', start);
    }
  }

  for (let i = 0; i < resources.length; i++) {
    if (resources[i].indexOf('png') != -1) {
      let image = new Image();
      image.src = 'images/' + resources[i];
      image.dataset.name = resources[i].split('.')[0];
      image.onload = resourceloaded;
      assets[image.dataset.name] = image;
    } else if (resources[i].indexOf('wav') != -1) {
      let sound = new Audio('sounds/' + resources[i]);
      sound.dataset.name = resources[i].split('.')[0];
      resourceloaded();
      // console.log('sound', sound);
      assets[sound.dataset.name] = sound;
    }
  }

  let grd=ctx.createRadialGradient(160,160,80,160,160,160);
  grd.addColorStop(0,"transparent");
  grd.addColorStop(1,"white");


  let st;
  let camera;

  let started = false;

  let load = function () {

    // paths
    let northsouth = new TiledBackground(0, 0, 80, 2560, assets["cobblestone"]);
    entities.push(northsouth);
    paths.push(northsouth);

    let eastwest = new TiledBackground(0, 0, 2560, 80, assets["cobblestone"]);
    entities.push(eastwest);
    paths.push(eastwest);

    // circular
    let east = new TiledBackground(-1280, 0, 80, 2624, assets['cobblestone']);
    entities.push(east);
    paths.push(east);

    let west = new TiledBackground(1280, 0, 80, 2624, assets['cobblestone']);
    entities.push(west);
    paths.push(west);

    let north = new TiledBackground(0, -1280, 2624, 80, assets['cobblestone']);
    entities.push(north);
    paths.push(north);

    let south = new TiledBackground(0, 1280, 2624, 80, assets['cobblestone']);
    entities.push(south);
    paths.push(south);

    // intermediary
    let m1 = new TiledBackground(640, 0, 32, 2560, assets['cobblestone']);
    entities.push(m1);
    paths.push(m1);

    let m2 = new TiledBackground(-640, 0, 32, 2560, assets['cobblestone']);
    entities.push(m2);
    paths.push(m2);

    let m3 = new TiledBackground(0, 640, 2560, 32, assets['cobblestone']);
    entities.push(m3);
    paths.push(m3);

    let m4 = new TiledBackground(0, -640, 2560, 32, assets['cobblestone']);
    entities.push(m4);
    paths.push(m4);


    // outer walls
    let wall1 = new TiledBackground(-1312, 0, 16, 2624, assets['wall']);
    solids.push(wall1);
    entities.push(wall1);

    let wall2 = new TiledBackground(1312, 0, 16, 2624, assets['wall']);
    solids.push(wall2);
    entities.push(wall2);

    let wall3 = new TiledBackground(0, 1312, 2624, 16, assets['wall']);
    solids.push(wall3);
    entities.push(wall3);

    let wall4 = new TiledBackground(0, -1312, 2624, 16, assets['wall']);
    solids.push(wall4);
    entities.push(wall4);

    // outer trees
    for (let i = 0; i < 400; i++) {
    	let t = new Sprite(1344 + random(0, 64), -1400 + 7 * i, assets['tree'], 16);
    	entities.push(t);
    }

    for (let i = 0; i < 400; i++) {
    	let t = new Sprite(-1344 - random(0, 64), -1400 + 7 * i, assets['tree'], 16);
    	entities.push(t);
    }

    // birds

    for (let i = 0; i < 10; i++) {
	    let bird = new Bird(random(-1000, 1000), random(-1000, 1000), assets['birdprint'], assets['bird'], global_footprints);
	    entities.push(bird);
    }

    // reigndeer herd
    let rx = random(-1000, 1000);
    let ry = random(-1000, 1000);
    for (let i = 0; i < 10; i++) {
	    let reigndeer = new Reigndeer(rx + random(32, 64) * i, ry + random(12,48) * i, assets['reigndeer-footprint'], assets['reigndeer'], global_footprints, 32);
	    reigndeer.time = Math.random() * Math.PI;
	    entities.push(reigndeer);
    }

    $.get('save.php').done(function (result) {
      // console.log('got a result');
      let data = JSON.parse(result);
      let sessions = Array.from(new Set(data.map((d) => d.session_time).sort().reverse()));

      for (let i = 0; i < data.length; i++) {
        let f = new Footprint(data[i].x, data[i].y, data[i].angle, data[i].step, assets['footprint']);
        let deep = true;

        for (let i = 0; i < paths.length; i++) {
          if (paths[i].overlap(f.x, f.y)) {
            deep = false;
          }
        }

        f.deep = deep;
        if (deep) {
          f.opacity = Math.max(15 - sessions.indexOf(data[i].session_time), 1) / 15;
        } else {
          f.opacity = Math.max(20 - sessions.indexOf(data[i].session_time), 1) / 24;
        }
        entities.push(f);
        global_footprints.push(f);
      }
      // console.log(data);
      setup();
    });
  };

  let setup = function () {

    // weird fix to prevent double 'get' query returns triggering this twice...
    if (started) return;
    started = true;

    // ... create named objects
    player = new Player(0, 0, assets['footprint']);
    player.angle = Math.random() * 2 *  Math.PI;
    player.velocity = {x: 0, y: 0};
    player.speed = 48;
    entities.push(player);
    // console.log('adding player');

    // snowmen
    for (let i = 0; i < 15; i++) {
      let test = new Circle(960 + random(-320,320), 320 + random(-160,160), 64);
      let count = 0;
      for (let j = 0; j < global_footprints.length; j++) {
        if (test.overlap(global_footprints[j].x, global_footprints[j].y) && global_footprints[j].deep) {
          count += 1;
        }
      }
      if (count > 10) {
        let snowman = new Snowman(test.x, test.y, assets['snowmansmall'], 4);
        entities.push(snowman);
      }
      else {
        let snowman = new Snowman(test.x, test.y, assets['snowman'], 16);
        entities.push(snowman);
        solids.push(snowman);

        if (Math.random() * 100 < 60) {
          let cookie = new Sprite(test.x + random(-64,64) * 2, test.y + random(-64, 64) * 2, assets['gingerbread'], 16);
          entities.push(cookie);
          items.push(cookie);
        }
      }
    }

    let forests = [{x: -1200, y: -1200}, {x: 64, y: -608}, {x: 64, y: 64}];
    for (let j = 0; j < forests.length; j++) {
	    for (let i = 0; i < 32; i++) {
	    	for (let k = 0; k < 32; k++) {
	    	  if (Math.random() < 0.1) {
			      let test = new Circle(forests[j].x + 16 * i, forests[j].y + 16 * k, 64);
			      let count = 0;
			      for (let j = 0; j < global_footprints.length; j++) {
			        if (test.overlap(global_footprints[j].x, global_footprints[j].y) && global_footprints[j].deep) {
			          count += 1;
			        }
			      }
			      if (count > 10) {
			        let tree = new Tree(test.x, test.y, 16, assets['tree-dead']);
			        entities.push(tree);
			        let c = new Circle(test.x, test.y + 16, 16);
			        solids.push(c);
			      } else {
			        let tree = new Tree(test.x, test.y, 16, assets['tree']);
			        entities.push(tree);
			        let c = new Circle(test.x, test.y + 16, 16);
			        solids.push(c);
			        // on-tree pine-cones
			        for (let j = 0; j < 2; j++) {
			          let e = new Sprite(tree.x + random(-12, 12), tree.y + random(0, 24), assets['pinecone'], 8);
			          entities.push(e);
			          items.push(e);
			        }
			        // 'loose' pine-cones
			        if (Math.random() < 0.6) {
			          let e = new Sprite(tree.x + random(-80, 80), tree.y + random(0, 64), assets['pinecone'], 8);
			          entities.push(e);
			          items.push(e);
			        }
			      }
	    	  }
	    	}
	    }
    }

    // decorated trees
    for (let i = 0; i < 16; i++) {
    	for (let j = 0; j < 16; j++) {
			if (Math.random() < 0.1) {
		      let test = new Circle(-608 + i * 32, -608 + j * 32, 64);
		      let count = 0;
		      for (let j = 0; j < global_footprints.length; j++) {
		        if (test.overlap(global_footprints[j].x, global_footprints[j].y) && global_footprints[j].deep) {
		          count += 1;
		        }
		      }
		      if (count > 10) {
		        let tree = new Tree(test.x, test.y, 16, assets['tree-dead']);
		        entities.push(tree);
		        let c = new Circle(test.x, test.y + 16, 16);
		        solids.push(c);
		        // fix me create ornament pieces
		      } else {
		        let tree = new Tree(test.x, test.y, 16, assets['decoratedtree']);
		        entities.push(tree);
		        let c = new Circle(test.x, test.y + 16, 16);
		        solids.push(c);

		        if (Math.random() < 0.6) {
		          let e = new Sprite(tree.x + random(-80, 80), tree.y + random(-64, 64), assets['gift'], 8);
		          entities.push(e);
		          items.push(e);
		        }
		      }
			}
    	}
    }

    ui['instructions'] = new Text(12, 10, "Scavenger Hunt!");
    for (let i = 0; i < scavenger.length; i++) {
      let text = new Text(32, 26 + i * 17, scavenger[i]);
      ui[scavenger[i] + "-text"] = text;
      let icon = new Sprite(16, 26 + i * 16, assets[scavenger[i]], 8);
      ui[scavenger[i] + "-icon"] = icon;
    }

    camera = new Camera(320, 320);

    window.addEventListener('focus', function (e) {
      st = new Date();
    });

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

    st = new Date();
    step();
  }

  let step = function () {
    let nt = new Date();
    let dt = (nt - st) / 1000;
    st = nt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let deep = true;

    for (let i = 0; i < paths.length; i++) {
      if (paths[i].overlap(player.x, player.y)) {
        deep = false;
      }
    }

    for (let i = 0; i < solids.length; i++) {
      if (solids[i].overlap(player.x, player.y)) {
        let point = solids[i].push(player.x, player.y);
        player.x = point.x;
        player.y = point.y;
      }
    }

    // pickup items
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].overlap(player.x, player.y)) {
        let completed = items[i].image.getAttribute('data-name');
	    assets['collect'].play();
        if (ui[completed + "-text"].text.indexOf("DONE") === -1) {
          ui[completed + "-text"].text = "[DONE] " + ui[completed + "-text"].text;
          points += 1;
          if (points >= 5) {
            // fix me: END STATE
            ui['end1'] = new Text(12, 160, 'Y Y OOO U U   DDD I DDD   I TTT !!!');
            ui['end2'] = new Text(12, 166, ' Y  O O U U   D D I D D   I  T  !!!');
            ui['end3'] = new Text(12, 172, ' Y  OOO UUU   DDD I DDD   I  T  !!!');
            ui['end4'] = new Text(12, 200, 'click to see the world as you left it');
            canvas.addEventListener('click', function () {
              window.location.reload()
            });
          }
        }
        let index = entities.indexOf(items[i]);
        entities.splice(index, 1);
        items.splice(i, 1);
      }
    }

    if (deep) {
      player.speed = 24;
    } else {
      player.speed = 48;
    }

    // create snowflakes
    for (let i = 0; i < 10; i++) {
      let s = new Snowflake(player.x + random(-240, 240), player.y + random(-240, 240), assets['snowflake']);
      entities.push(s);
    }

    for (let i = 0; i < entities.length; i++) {
      entities[i].update(dt);
    }

    for (let i = entities.length - 1; i >= 0; i--) {
      if (entities[i].alive == false) {
        entities.splice(i, 1);
      }
    }

    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    ctx.save();
    camera.draw(ctx);
    for (let i = 0; i < entities.length; i++) {
      entities[i].draw(ctx);
    }



    ctx.restore();

    ctx.drawImage(assets['frame'], 0, 0);

    // draw UI (fixed position)
    for (let key in ui) {
      ui[key].update(dt);
      ui[key].draw(ctx);
    }

    window.requestAnimationFrame(step);
  }
});
