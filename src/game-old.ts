import logoIconFile from '../favicon.svg';

import { Engine, Render, Bodies, Composite, Runner, Mouse, MouseConstraint, Constraint, Events, Body } from 'matter-js';

const game = document.querySelector<HTMLCanvasElement>('#game')!;

const engine = Engine.create();

// engine.gravity.y = 0;

const width = window.innerWidth;
const height = window.innerHeight;

// create a renderer
var render = Render.create({
  //   element: document.body,
  canvas: game,
  engine: engine,
  options: {
    width,
    height,
    background: '#fff',
    wireframes: false,
    pixelRatio: window.devicePixelRatio,
    // showStats: true,
    // showPerformance: true,
    // showAngleIndicator: true,
  },
});

// create two boxes and a ground
// var boxA = Bodies.rectangle(game.width / 2, 200, 85, 80, { render: { fillStyle: 'red', strokeStyle: 'blue', lineWidth: 3 } });
// var boxB = Bodies.rectangle(game.width / 2 + 50, 50, 80, 80);
// var ground = Bodies.rectangle(game.width / 2, game.height - 30, game.width, 60, { isStatic: true });

const logoIconPosition: Matter.Vector = { x: width / 2, y: height / 2 };

console.log(logoIconPosition, { width, height }, { gw: game.width, gh: game.height });

// setTimeout(() => {
//   t1.angularVelocity = 0;
//   t1.angularSpeed = 0;
//   t1.angle = 0;
// }, 3000);

function createLogoIcon(): any {
  const b = Bodies.circle(logoIconPosition.x, logoIconPosition.y, 25, {
    label: 'logoIcon',
    density: 0.004,
    //   frictionAir: 0.06,
    //   restitution: 0.3,
    //   friction: 0.01,
    render: {
      sprite: {
        texture: logoIconFile,
        xScale: 1,
        yScale: 1,
      },
    },
  });
  Body.setInertia(b, Infinity);
  return b;
}

let currentLogoIcon = createLogoIcon();

console.log(currentLogoIcon.position.x, currentLogoIcon.position.y);
const elastic = Constraint.create({
  pointA: logoIconPosition,
  bodyB: currentLogoIcon,
  stiffness: 0.05,
  render: {
    strokeStyle: '#ccc',
    lineWidth: 2,
    anchors: false,
    visible: false,
    type: 'spring',
  },
});

// Events.on(engine, 'afterUpdate', function () {
//   const moveDiff = 15;
//   const a1 = Math.abs(t1.position.x - logoIconPosition.x) > moveDiff;
//   const a2 = Math.abs(t1.position.y - logoIconPosition.y) > moveDiff;
//   if (mouseConstraint.mouse.button === -1 && (a1 || a2)) {
//     t1 = createLogoIcon();
//     Composite.add(engine.world, t1);
//     elastic.bodyB = t1;
//   }
// });

var bodyA = Bodies.rectangle(width / 5, 0, 50, 50);

// add all of the bodies to the world
// Composite.add(engine.world, [boxA, boxB, ground, currentLogoIcon, elastic]);
Composite.add(engine.world, [currentLogoIcon, elastic, bodyA]);

// add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  // @ts-ignore
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

function isClose(body: any, point: Matter.Vector, diff: number): boolean {
  return Math.abs(body.position.x - point.x) < diff && Math.abs(body.position.y - point.y) < diff;
}

let shouldFire = false;
Events.on(mouseConstraint, 'enddrag', (e) => {
  if (e.body === currentLogoIcon && !isClose(currentLogoIcon, logoIconPosition, 15)) {
    shouldFire = true;
  }
});

Events.on(mouseConstraint, 'startdrag', (e) => {
  if (e.body === currentLogoIcon) {
    elastic.render.visible = true;
  }
});

Events.on(engine, 'afterUpdate', function () {
  if (shouldFire && isClose(currentLogoIcon, logoIconPosition, 15)) {
    currentLogoIcon = createLogoIcon();
    Composite.add(engine.world, currentLogoIcon);
    elastic.bodyB = currentLogoIcon;
    elastic.render.visible = false;
    shouldFire = false;
  }
});

Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

let counter = 0;
let counter2 = 0;
Events.on(runner, 'afterTick', function () {
  counter += 1;
  counter2 += 1;

  // every 1.5 sec
  if (counter >= 60 * 1) {
    Body.setVelocity(bodyA, { x: 0, y: -10 });
    // Body.setAngle(bodyC, -Math.PI * 0.26);
    // Body.setAngularVelocity(bodyD, 0.2);

    // reset counter
    counter = 0;
  }

  if (counter2 > 60 * 5) {
    Body.setPosition(bodyA, { x: width / 5, y: height / 2 });
    counter2 = 0;
  }
});

// run the engine
Runner.run(runner, engine);

window.addEventListener('resize', function () {
  game.width = window.innerWidth;
  game.height = window.innerHeight;
});
