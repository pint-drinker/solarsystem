
var ct = 0;

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

    this.paused = false;

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
    this.scene = new THREE.Scene();

    // viewing
    this.camera = createCamera(this.node, this.bodies.sun.radius);
    this.scene.add(this.camera);
    this.scene.add(new THREE.AmbientLight(0xfafafa, 0.3));  // ambient light
    // NOTE: if want to adjust scale might need to change this, like back to real for spaceship
    this.scene.add(new THREE.PointLight(0xffffff, 1, 11000, 1));  // point light decays to 0 when past pluto

    // for planet tracking and camera and spotlight updating
    this.current_target = undefined;
    
     // additional setups
    this.trackball = setUpControls(this.camera, this.renderer);
    this.trackball.target = this.bodies.sun.group.position;
    this.axes = new ThreeAxes(this.node, this.camera);

    // now add everything to the scene
    for (var i in this.bodies) {
      this.scene.add(this.bodies[i].group);
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

    console.log(this);
    this.run();
  }

  updateAxCam() {
    this.axes.camera.position.subVectors(this.camera.position, this.trackball.target);
    this.axes.camera.position.setLength(SCENE_DEFAULTS.cam_distance);
    this.axes.camera.lookAt(this.axes.scene.position);
  }

  updateCamera() {
    if (!this.current_target) {
      return;
    }
    
    if (!this.current_target.host) {
      var location = this.current_target.group.position.clone();
      var dir = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(this.current_target.group.position, this.bodies.sun.group.position).normalize(), 
        this.bodies.sun.up);
      if (this.current_target.name == 'pluto') {
        location.add(dir.multiplyScalar(this.current_target.radius * 100 / PLANET_SCALE));
        this.camera.position.set(location.x, location.y, location.z + this.current_target.radius * 20 / PLANET_SCALE);
      } else {
        location.add(dir.multiplyScalar(this.current_target.radius * 8 / PLANET_SCALE));
        this.camera.position.set(location.x, location.y, location.z + this.current_target.radius * 2 / PLANET_SCALE);
      }
      this.camera.lookAt(this.current_target.group.position);
    } else {
      var location = this.current_target.group.position.clone();
      var loc2 = this.current_target.host.group.position.clone();
      var separation_vector = new THREE.Vector3().subVectors(location, loc2);
      separation_vector.normalize();
      location.add(separation_vector.multiplyScalar(this.current_target.radius * 8 / PLANET_SCALE));
      this.camera.position.set(location.x, location.y, location.z + this.current_target.radius * 2 / PLANET_SCALE);
      this.camera.lookAt(this.current_target.host.group.position);
    }
  }

  updateSunGlow() {
    this.sun_glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(this.camera.position, this.sun_glow.position);
  }

  updateControls() {
    if (this.current_target || this.paused) {
      this.trackball.noPan = true;
    } else {
      this.trackball.noPan = false;
    }
    this.trackball.update();
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
        ct = 0;
        for (var key2 in this.bodies) {
          if (isInside(key2, tracking) == false) {
            get_acceleration_contribution(this.bodies[key1], this.bodies[key2]);
          } 
        }
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

  // DOUBLE CHECK THIS IS NOT OVER COUNTING BY ONE FRAME
  updateDate() {
    this.current_time += numberOfCalculationsPerFrame * deltaT * Math.pow(10, 3);
  }

  showDate() {
    this.current_date = new Date(this.current_time);
    this.date_holder.innerHTML = 'Date: ' + this.current_date.toString();
  }

  updateTime() {
    this.time_per_frame = numberOfCalculationsPerFrame * deltaT;  // in seconds, going to need to scale this later
    this.time_factor = Math.floor(this.time_per_frame * frame_rate);
    this.time_info_holder.innerHTML = 'Time Step(s): ' + Math.floor(deltaT).toString() + '<br />Steps per frame: ' + 
      numberOfCalculationsPerFrame.toString() + '<br />Time Per Frame: ' + getTimeString(this.time_per_frame) + 
      '<br />FPS: ' + frame_rate.toString() + '<br />Time Factor: ' + this.time_factor.toString() +
      '<br />1 sec = ' + getTimeString(this.time_factor);
  }

  updatePerspective() {
    this.viewer_distance = new THREE.Vector3().subVectors(this.camera.position.clone().multiplyScalar(DISTANCE_SCALE), 
      this.bodies.sun.position).length();
    this.perspective_holder.innerHTML = 'Viewer Distance from Sun:<br />' + getDistanceString(this.viewer_distance);
  }

  // button interaction functions
  toSunView() {
    this.onResetView();
  }

  toEarthView() {
    this.current_target = this.bodies.earth;
    this.trackball.target = this.bodies.earth.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toMoonView() {
    this.trackball.target = this.bodies.moon.group.position;
    this.current_target = this.bodies.moon;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toMercuryView() {
    this.current_target = this.bodies.mercury;
    this.trackball.target = this.bodies.mercury.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE / 4;
  }

  toVenusView() {
    this.current_target = this.bodies.venus;
    this.trackball.target = this.bodies.venus.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toMarsView() {
    this.current_target = this.bodies.mars;
    this.trackball.target = this.bodies.mars.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toJupiterView() {
    this.current_target = this.bodies.jupiter;
    this.trackball.target = this.bodies.jupiter.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toIoView() {
    this.trackball.target = this.bodies.io.group.position;
    this.current_target = this.bodies.io;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toEuropaView() {
    this.trackball.target = this.bodies.europa.group.position;
    this.current_target = this.bodies.europa;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toGanymedeView() {
    this.trackball.target = this.bodies.ganymede.group.position;
    this.current_target = this.bodies.ganymede;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toCallistoView() {
    this.trackball.target = this.bodies.callisto.group.position;
    this.current_target = this.bodies.callisto;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toSaturnView() {
    this.current_target = this.bodies.saturn;
    this.trackball.target = this.bodies.saturn.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toTitanView() {
    this.trackball.target = this.bodies.titan.group.position;
    this.current_target = this.bodies.titan;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toUranusView() {
    this.current_target = this.bodies.uranus;
    this.trackball.target = this.bodies.uranus.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toNeptuneView() {
    this.current_target = this.bodies.neptune;
    this.trackball.target = this.bodies.neptune.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toTritonView() {
    this.trackball.target = this.bodies.triton.group.position;
    this.current_target = this.bodies.triton;
    deltaT = 2 * Math.PI / this.current_target.host.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  toPlutoView() {
    this.current_target = this.bodies.pluto;
    this.trackball.target = this.bodies.pluto.group.position;
    deltaT = 2 * Math.PI / this.current_target.omega / numberOfCalculationsPerFrame / FRAMES_TO_ROTATE;
  }

  onResetView() {
    this.trackball.target = this.bodies.sun.group.position;
    this.current_target = undefined;
    deltaT = DEFAULT_dT;
    this.trackball.reset();
  }

  onPause() {
    if (this.paused) {
      this.paused = false;
    } else {
      this.updateDate();
      this.paused = true;
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

    this.toSunView = this.toSunView.bind(this);
    document.getElementById('sun_view').onclick = this.toSunView;

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

    this.onResetView = this.onResetView.bind(this);
    document.getElementById('reset_view').onclick = this.onResetView;

    this.onPause = this.onPause.bind(this);
    document.getElementById('pause').onclick = this.onPause;
  }

  run() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); 
    this.render();
  }

  render() {
    this.updateControls();
    this.updateAxCam();
    this.updateSunGlow();

    if (!this.paused) {
      this.updateBodies();
      this.updateDate();
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
    }
    
    this.renderer.render(this.scene, this.camera);
    this.axes.renderer.render(this.axes.scene, this.axes.camera);
  }
}

// now call everything
var system = new SolarSystem();


