// need the variables to be global...ideally we refactor this at some point...
var started = false;
var paused;
var tweening_rot;
var tweening_tran;
var trackball;
var current_target;
var scene = new THREE.Scene();
var hermes;

function onTweeningRotComplete() {
  trackball.enabled = true;
  if (current_target.name == 'h') {
    trackball.target = current_target.center;
  } else {
    trackball.target = current_target.group.position;  
  }
  tweening_rot = false;
}

function onTweeningTranComplete() {
  tweening_tran = false;
}

class SolarSystem {
  constructor() {
    // initializing node
    this.node = document.getElementById("house");
    this.node.width = window.innerWidth;
    this.node.height = window.innerHeight;
    this.nodeWidth = window.innerWidth;
    this.nodeHeight = window.innerHeight;

    // body population info
    this.data = data;

    paused = false;
    tweening_rot = false;
    tweening_tran = false;

    // time and text tracking
    this.frame_count = 0;
    this.last_update_time = 0;
    this.update_dt = DEFAULT_UPDATE_TIME;

    // set the time object
    this.date_holder = document.getElementById('date_holder');
    this.current_date = new Date(this.data.sun.time);
    this.current_time = this.data.sun.time;
    this.date_holder.innerHTML = 'Date: ' + this.current_date.toString();

    // set the time info object
    this.time_info_holder = document.getElementById('time_info_holder');
    frame_rate = 0;
    this.time_per_frame = 0;
    this.time_factor = 0;
    this.updateTime();

    // populate all the bodies
    this.bodies = createOrbitalBodies();

    // get the sun glow
    this.sun_glow = createGlow(this.bodies.sun);
    this.bodies.sun.group.add(this.sun_glow)

    // world elements
    this.renderer = createRenderer(this.node);
    this.hermes = undefined;

    var loader = new THREE.TDSLoader( );
    loader.load( 'library/Hermes.3ds', function ( object ) {
          var obj = data.earth;
          var pos = new THREE.Vector3(obj.position[0]*1.5, obj.position[1], obj.position[2]);
          var v = new THREE.Vector3(obj.velocity[0], obj.velocity[1], obj.velocity[2]);
          object.scale.set(0.03, 0.03, 0.03);
          var bb = new THREE.Box3().setFromObject(object);
          var mn = bb.min;
          var mx = bb.max;
          var sep = mx.clone().add(mn).multiplyScalar(-0.5);
          var gp = new THREE.Group();
          object.position.set(sep.x , sep.y / 2, sep.z / 2);
          gp.add(object);
          hermes = new SpaceShip(gp, pos, v);
          scene.add( hermes.group );
          loaded_bodies.push(hermes);
    });
    this.scene = scene;

    // viewing
    this.camera = createCamera(this.node, this.bodies.sun.radius);
    this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(0xfafafa, 0.3));  // ambient light
    // NOTE: if want to adjust scale might need to change this, like back to real for spaceship
    this.scene.add(new THREE.PointLight(0xffffff, 1, 11000, 1));  // point light decays to 0 when past pluto

    // for planet tracking and camera and spotlight updating
    current_target = this.bodies.sun.group.position;
    
     // additional setups
    trackball = setUpControls(this.camera, this.renderer);
    trackball.target = this.bodies.sun.group.position;
    this.axes = new ThreeAxes(this.node, this.camera);

    // now add everything to the scene
    for (var i in this.bodies) {
      this.scene.add(this.bodies[i].group);
      loaded_bodies.push(this.bodies[i].name);
    }

    // add in the stars
    this.stars = createStars();
    for (let i in this.stars) {
      this.scene.add(this.stars[i]);
    }

    this.add_event_listeners();

     // set up the persepctive update
    this.perspective_holder = document.getElementById('perspective_info');
    this.viewer_distance = 0;
    this.updatePerspective();

    // CREATING GUI SLIDERS
    this.gui = setupGui();  // defined in setup

    this.tweening = false;
    this.dummy_body = new THREE.Object3D();

    console.log(this);
    this.run();
  }

  onAllLoaded() {
    this.hermes = loaded_bodies[loaded_bodies.length - 1];
    this.bodies['hermes'] = this.hermes;
    tweening_tran = true;
    var pos2 = new THREE.Vector3(1, 1, 1).multiplyScalar(this.bodies.sun.radius * 0.75 / PLANET_SCALE);
    var tween_tran = new TWEEN.Tween(this.camera.position).to({x: pos2.x, y: pos2.y, z: pos2.z}, 5000)
    .easing(TWEEN.Easing.Quadratic.In).onComplete(onTweeningTranComplete).start();
  }

  updateAxCam() {
    this.axes.camera.position.subVectors(this.camera.position, trackball.target);
    this.axes.camera.position.setLength(SCENE_DEFAULTS.cam_distance);
    this.axes.camera.lookAt(this.axes.scene.position);
  }

  updateSunGlow() {
    this.sun_glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(this.camera.position, this.sun_glow.position);
  }

  updateControls() {
    if (current_target || paused) {
      trackball.noPan = true;
    } else {
      trackball.noPan = false;
    }
    trackball.update();
  }

  updateBodies() {
    // perform updating with delegated number of calculations per frame
    for (var k = 0; k < numberOfCalculationsPerFrame; k++) {
      // first need to reset the accelerations of all of the bodies
      for (var key in this.bodies) {
        this.bodies[key].acceleration.set(0, 0, 0);
      }
      // resolve all the accelerations
      var tracking = [];
      for (var key1 in this.bodies) {
        tracking.push(key1);
        for (var key2 in this.bodies) {
          if (isInside(key2, tracking) == false) {
            get_acceleration_contribution(this.bodies[key1], this.bodies[key2]);
          } 
        }
      }
      // add any user input accelerations to the hermes
      // can only do burns when the time is at real time or slower
      if (this.time_factor <= 2.0) {
        this.bodies.hermes.update_thrusters(deltaT);
      }

      // now update all the telemetry of all the bodies
      for (var key in this.bodies) {
        this.bodies[key].update_kinematics(deltaT);
      }
    }
    // now move the actual bodies on the screen
    for (var key in this.bodies) {
      this.bodies[key].move_body();
    }
  }

  updateDate() {
    // DOUBLE CHECK THIS IS NOT OVER COUNTING BY ONE FRAME
    this.current_time += numberOfCalculationsPerFrame * deltaT * Math.pow(10, 3);
  }

  showDate() {
    this.current_date = new Date(this.current_time);
    this.date_holder.innerHTML = 'Date: ' + this.current_date.toString();
  }

  updateTime() {
    this.time_per_frame = numberOfCalculationsPerFrame * deltaT;  // in seconds, going to need to scale this later
    this.time_factor = this.time_per_frame * frame_rate;
    this.time_info_holder.innerHTML = 'Time Step(s): ' + deltaT.toFixed(4).toString() + '<br />Steps per frame: ' + 
      numberOfCalculationsPerFrame.toString() + '<br />Time Per Frame: ' + getTimeString(this.time_per_frame) + 
      '<br />FPS: ' + frame_rate.toString() + '<br />Time Factor: ' + this.time_factor.toString() +
      '<br />1 sec = ' + getTimeString(this.time_factor);
  }

  updatePerspective() {
    this.viewer_distance = new THREE.Vector3().subVectors(this.camera.position.clone().multiplyScalar(DISTANCE_SCALE), 
      this.bodies.sun.position).length();
    this.perspective_holder.innerHTML = 'Viewer Distance from Sun:<br />' + getDistanceString(this.viewer_distance);
  }
  
  // turn this on and off for when i click the hermes button, for real here
  updateHermesInfo() {
    var hf = document.getElementById('hermes_info');
    var pointer = this.bodies.hermes.pointer;
    var boosting = false;
    for (var item in burn) {
      if (burn[item] && this.time_factor <= 2.0){
        boosting = true;
        break;
      }
    }
    hf.innerHTML = 'Hermes Info:' + 
    '<br />Velocity (km/s): ' + this.bodies.hermes.velocity.length().toFixed(4).toString() + 
    '<br />Boosting: ' + boosting.toString() + 
    '<br />System Orientation:<br />X: ' + pointer.x.toFixed(5).toString() + 
    '<br />Y: ' + pointer.y.toFixed(5).toString() + 
    '<br />Z: ' + pointer.z.toFixed(5).toString() + 
    '<br />Vx: ' + this.bodies.hermes.velocity.x.toFixed(4).toString() + 
    '<br />Vy: ' + this.bodies.hermes.velocity.y.toFixed(4).toString() +
    '<br />Vz: ' + this.bodies.hermes.velocity.z.toFixed(4).toString() + 
    '<br />Roll Alpha: ' + (this.bodies.hermes.alpha.x * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Roll Rate: ' + (this.bodies.hermes.omega.x * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Roll: ' + (this.bodies.hermes.theta.x * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Yaw Rate: ' + (this.bodies.hermes.omega.y * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Yaw: ' + (this.bodies.hermes.theta.y * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Pitch Rate: ' + (this.bodies.hermes.omega.z * 180 / Math.PI).toFixed(6).toString() + 
    '<br />Pitch: ' + (this.bodies.hermes.theta.z * 180 / Math.PI).toFixed(6).toString();
  }

  makeToTween(pos2, rot2) {
    tweening_rot = true;
    tweening_tran = true;
    trackball.enabled = false;
    var tween_rot = new TWEEN.Tween(this.camera.rotation).to({x: rot2.x, y: rot2.y, z: rot2.z}, 500)
    .easing(TWEEN.Easing.Linear.None).onComplete(onTweeningRotComplete);
    var tween_tran = new TWEEN.Tween(this.camera.position).to({x: pos2.x, y: pos2.y, z: pos2.z}, 2000)
    .easing(TWEEN.Easing.Linear.None).onComplete(onTweeningTranComplete);

    tween_rot.chain(tween_tran);
    tween_rot.start();
  }

  setPlanetDeltaT(body) {
    if (body.host) {
      deltaT = 2 * Math.PI / current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
    } else {
      if (body.name == 'mercury') {
        deltaT = 2 * Math.PI / current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE / 60;
      } else if (body.name == 'venus') {
        deltaT = 2 * Math.PI / current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE / 25;
      } else if (body.name == 'hermes') {
        deltaT = 1 / FRAMES_TO_ROTATE / numberOfCalculationsPerFrame;
      } else {
        deltaT = 2 * Math.PI / current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
      }
    }
  }

  bodyView() {
    // now need to define the tween parameters, use a dummy copy camera to get the final position we want
    var dummy = this.camera.clone();
    if (current_target.name == 'h') {
      dummy.lookAt(current_target.center.clone());
    } else {
      dummy.lookAt(current_target.group.position.clone());
    }
    
    this.makeToTween(getCameraOffsetDestination(current_target, this.bodies.sun), dummy.rotation.clone());
    this.setPlanetDeltaT(current_target);
    trackball.enabled = true;
  }

  // button interaction functions
  toEarthView() {
    current_target = this.bodies.earth;
    this.bodyView();
  }

  toMoonView() {
    current_target = this.bodies.moon;
    this.bodyView();
  }

  toMercuryView() {
    current_target = this.bodies.mercury;
    this.bodyView();
  }

  toVenusView() {
    current_target = this.bodies.venus;
    this.bodyView();
  }

  toMarsView() {
    current_target = this.bodies.mars;
    this.bodyView();
  }

  toJupiterView() {
    current_target = this.bodies.jupiter;
    this.bodyView();
  }

  toIoView() {
    current_target = this.bodies.io;
    this.bodyView();
  }

  toEuropaView() {
    current_target = this.bodies.europa;
    this.bodyView();
  }

  toGanymedeView() {
    current_target = this.bodies.ganymede;
    this.bodyView();
  }

  toCallistoView() {
    current_target = this.bodies.callisto;
    this.bodyView();
  }

  toSaturnView() {
    current_target = this.bodies.saturn;
    this.bodyView();
  }

  toTitanView() {
    current_target = this.bodies.titan;
    this.bodyView();
  }

  toUranusView() {
    current_target = this.bodies.uranus;
    this.bodyView();
  }

  toNeptuneView() {
    current_target = this.bodies.neptune;
    this.bodyView();
  }

  toTritonView() {
    current_target = this.bodies.triton;
    this.bodyView();
  }

  toPlutoView() {
    current_target = this.bodies.pluto;
    this.bodyView();
  }

  toHermesView() {
    current_target = this.bodies.hermes;
    this.bodyView();
  }

  updateCamera() {
    // NOTE: getting some bugs with trying to manipulate the hermes
    let p = this.bodies.hermes.group.position.clone();
    let pointer = this.bodies.hermes.pointer.clone();  // local x-axis of ship
    this.camera.position.set(p.x, p.y, p.z);
    this.camera.updateProjectionMatrix();
    // now need to make the camera offset point to look at
    let off = p.add(pointer.multiplyScalar(2));
    this.camera.lookAt(off);
    this.camera.updateProjectionMatrix();
  }

  onResetView() {
    current_target = this.bodies.sun;
    this.bodyView();
    deltaT = DEFAULT_dT;
  }

  toRealTime() {
    deltaT = 1 / FRAMES_TO_ROTATE / numberOfCalculationsPerFrame;
  }

  onPause() {
    if (paused) {
      paused = false;
    } else {
      this.updateDate();
      paused = true;
    }
  }

  onWindowResize() {
    this.node.width = window.innerWidth;
    this.node.height = window.innerHeight;
    this.nodeWidth = window.innerWidth;
    this.nodeHeight = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.nodeWidth, this.nodeHeight);
    this.axes.renderer.setSize(this.nodeWidth / SCENE_DEFAULTS.axes_shrink_factor, this.nodeHeight /
     SCENE_DEFAULTS.axes_shrink_factor);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  add_event_listeners() {

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);

    this.onResetView = this.onResetView.bind(this);
    document.getElementById('sun_view').onclick = this.onResetView;

    this.toEarthView = this.toEarthView.bind(this);
    document.getElementById('earth_view').onclick = this.toEarthView;

    this.toMoonView = this.toMoonView.bind(this);
    document.getElementById('moon_view').onclick = this.toMoonView;

    this.toMercuryView = this.toMercuryView.bind(this);
    document.getElementById('mercury_view').onclick = this.toMercuryView;

    this.toVenusView = this.toVenusView.bind(this);
    document.getElementById('venus_view').onclick = this.toVenusView;

    this.toMarsView = this.toMarsView.bind(this);
    document.getElementById('mars_view').onclick = this.toMarsView;

    this.toJupiterView = this.toJupiterView.bind(this);
    document.getElementById('jupiter_view').onclick = this.toJupiterView;

    this.toIoView = this.toIoView.bind(this);
    document.getElementById('io_view').onclick = this.toIoView;

    this.toGanymedeView = this.toGanymedeView.bind(this);
    document.getElementById('ganymede_view').onclick = this.toGanymedeView;

    this.toEuropaView = this.toEuropaView.bind(this);
    document.getElementById('europa_view').onclick = this.toEuropaView;

    this.toCallistoView = this.toCallistoView.bind(this);
    document.getElementById('callisto_view').onclick = this.toCallistoView;

    this.toSaturnView = this.toSaturnView.bind(this);
    document.getElementById('saturn_view').onclick = this.toSaturnView;

    this.toTitanView = this.toTitanView.bind(this);
    document.getElementById('titan_view').onclick = this.toTitanView;

    this.toUranusView = this.toUranusView.bind(this);
    document.getElementById('uranus_view').onclick = this.toUranusView;

    this.toNeptuneView = this.toNeptuneView.bind(this);
    document.getElementById('neptune_view').onclick = this.toNeptuneView;

    this.toTritonView = this.toTritonView.bind(this);
    document.getElementById('triton_view').onclick = this.toTritonView;

    this.toPlutoView = this.toPlutoView.bind(this);
    document.getElementById('pluto_view').onclick = this.toPlutoView;

    document.getElementById('reset_view').onclick = this.onResetView;

    this.onPause = this.onPause.bind(this);
    document.getElementById('pause').onclick = this.onPause;

    this.toRealTime = this.toRealTime.bind(this);
    document.getElementById('real_time').onclick = this.toRealTime;

    this.toHermesView = this.toHermesView.bind(this);
    document.getElementById('hermes_view').onclick = this.toHermesView;
  }

  run() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); 
    this.render();
  }

  render() {
    TWEEN.update();
    if (!tweening_rot) {
      this.updateControls();
    }
    this.updateAxCam();
    this.updateSunGlow();

    if (!paused  && !tweening_tran && started) {
      this.updateBodies();
      this.updateDate();
    }

    if (loaded_bodies.length == NUM_BODIES && !started) {
      started = true;
      this.onAllLoaded();
    }

    // time tracking
    this.frame_count += 1;
    let t = performance.now();
    if (t - this.last_update_time > this.update_dt) {
      frame_rate = Math.floor(this.frame_count / (t - this.last_update_time) * 1000);
      this.last_update_time = t;
      // update the date before resetting frame count
      this.showDate();
      this.frame_count = 0;
      this.updateTime();
      // update the viewer distance
      this.updatePerspective();
      if (started) {
        this.updateHermesInfo();
        var hf = document.getElementById('hermes_info');
        if (current_target != this.bodies.hermes) {
          hf.innerHTML = "";
        }
      }
    }
    
    this.renderer.render(this.scene, this.camera);
    this.axes.renderer.render(this.axes.scene, this.axes.camera);
  }
}

// now call everything...this will actually render the scene
var system = new SolarSystem();


