
var ct = 0;

getNodeComputedProperty = (node, prop) => {
  return window.getComputedStyle(node, null).getPropertyValue(prop);
};

getTimeString = function(seconds) {
  // determine chunk values
  let w = Math.floor(seconds / 604800);  // weeks
  let d = Math.floor((seconds % 604800) / 86400) ;  // days
  let h = Math.floor((seconds % 86400) / 3600);  // hours
  let m = Math.floor((seconds % 3600) / 60);  // minutes
  let s = Math.floor(seconds % 60);  // seconds

  // now construct the string
  var st = '';
  if (w) {
    st += w.toString() + 'w ';
  }
  if (d) {
    st += d.toString() + 'd ';
  }
  if (h) {
    st += h.toString() + 'h ';
  }
  if (m) {
    st += m.toString() + 'm ';
  }
  if (s) {
    st += s.toString() + 's ';
  }
  return st; 
}

isInside = function(item, array) {
  for (var i = 0; i < array.length; i++) {
    if (item == array[i]) {
      return true;
    }
  }
  return false;
}

getDistanceString = function(meters) {
  let ly = Math.floor(meters / (299792458 * 3600 * 24 * 365));
  let Mkm = Math.floor((meters % (299792458 * 3600 * 24 * 365)) / 1000000000);
  let st = '';
  if (ly) {
    st += ly.toString() + ' Ly ';
  }
  st += Mkm.toString() + ' Million km';
  return st;
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

    this.paused = false;

    // number of calculations per second
    this.numberOfCalculationsPerFrame = DEFAULT_FRAMES;
    // The length of the time increment, in seconds.
    this.deltaT = DEFAULT_dT;

    // time and text tracking
    this.frame_count = 0;
    this.last_update_time = 0;
    this.update_dt = DEFAULT_UPDATE_TIME;

    // set the time object
    this.date_holder = document.getElementById('date_holder');
    this.start_date = new Date(this.data.sun.time);
    this.current_date = new Date(this.data.sun.time);
    this.current_time = this.data.sun.time;
    this.date_label = 'Date: '
    this.date_holder.innerHTML = this.date_label + this.start_date.toString();

    // set the time info object
    this.time_info_holder = document.getElementById('time_info_holder');
    this.kt_label = 'Time Step(s): '
    this.cc_label = '<br />Steps per frame: '
    this.dt_label = '<br />Time Per Frame: ';
    this.fr_label = '<br />FPS: ';
    this.tf_label = '<br />Time Factor: ';
    this.ts_label = '<br />1 sec = ';
    this.frame_rate = 0;
    this.time_per_frame = 0;
    this.time_per_frame_s = '';
    this.time_factor = 0;
    this.time_factor_s = '';
    this.updateTime();

    // set up the persepctive update
    this.perspective_holder = document.getElementById('perspective_info');
    this.p_label = 'Viewer Distance from Sun:<br />'
    this.viewer_distance = 0;
    this.perspective_holder.innerHTML = this.p_label;

    // populate all the bodies
    this.bodies = {};
    for (var key in data) {
      console.log(key);
      this.bodies[key] = new OrbitalBody(data[key], key);
    }

    // now add all the moons to their appropriate hosts
    this.bodies.moon.host = this.bodies.earth;
    this.bodies.io.host = this.bodies.jupiter;
    this.bodies.europa.host = this.bodies.jupiter;
    this.bodies.ganymede.host = this.bodies.jupiter;
    this.bodies.callisto.host = this.bodies.jupiter;
    this.bodies.titan.host = this.bodies.saturn;
    this.bodies.triton.host = this.bodies.neptune;

    // ray casting
    this.mouse = {x: 0, y: 0};
    this.select_mouse = {x: 0, y: 0};
    this.raycaster = new THREE.Raycaster();
    this.intersected = null;
    this.selected = null;

    // world elements
    this.renderer = this.createRenderer();
    this.scene = this.createScene();

    // viewing
    this.camera = this.createCamera();
    this.light = this.createAmbientLight();
    this.point_light = this.createPointLight();

    // get the sun glow
    this.sun_glow = this.createSunGlow();
    this.bodies.sun.group.add(this.sun_glow)

    // for planet tracking and camera and spotlight updating
    this.current_target = undefined;
    
     // additional setups
    this.setUpControls();
    this.axes = new ThreeAxes(this.node, this.camera);

    // now add everything to the scene
    // NOTE, ONLY CAN RECEIVE OR CAST SHADOWS, CANT DO BOTH, SO RIGHT NOW ITS PLANETS ON THE MOONS
    for (var i in this.bodies) {
      if (this.bodies[i].name == 'sun') {
        this.bodies[i].body.castShadow = false;
        this.bodies[i].body.receiveShadow = false;
      } else if (this.bodies[i].host) {
        this.bodies[i].body.castShadow = false;
        this.bodies[i].body.receiveShadow = true;
      } else {
        this.bodies[i].body.castShadow = true;
        this.bodies[i].body.receiveShadow = false;
      }
      this.scene.add(this.bodies[i].group);
    }
    this.createStars();

    this.add_event_listeners();

    this.updatePerspective();

    console.log(this);
    this.run();
  }


  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.nodeWidth, this.nodeHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMapEnabled = true;
    this.node.appendChild(renderer.domElement);
    return renderer;
  }

  createScene() {
    // creates the scene
    return new THREE.Scene();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(50, this.nodeWidth / this.nodeHeight, 1, 10000000);
    const cameraPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(this.data.sun.radius * 0.75 / PLANET_SCALE);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(this.scene.position);
    camera.visible = true;
    //WE WANT Z TO BE THE UP AXIS IN GENERAL
    camera.up = new THREE.Vector3(0, 0, 1);
    this.scene.add(camera);
    return camera;
  }

  createAmbientLight() {
    const light = new THREE.AmbientLight(0xfafafa, 0.3);
    this.scene.add(light);
    return light;
  }

  createPointLight() {
    var light = new THREE.PointLight(0xffffff, 1, 11000, 1);
    light.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadowDarkness = 0.7;
    this.scene.add(light);
    return light;
  }

  createSunGlow() {
      //http://stemkoski.github.io/Three.js/Shader-Glow.html
      const cameraPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(this.bodies.sun.radius * 0.75 / PLANET_SCALE);
      var customMaterial = new THREE.ShaderMaterial( 
      {
          uniforms: 
        { 
          "c":   { type: "f", value: 0.0 },
          "p":   { type: "f", value: 2.0 },
          glowColor: { type: "c", value: new THREE.Color(0xffff00) },
          viewVector: { type: "v3", value: cameraPosition }
        },
        vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      }   );
        
      var glow = new THREE.Mesh( this.bodies.sun.body.geometry.clone(), customMaterial.clone() );
      glow.position.set(this.bodies.sun.group.position.x, this.bodies.sun.group.position.y, this.bodies.sun.group.position.z);
      glow.scale.multiplyScalar(1.01);
      this.scene.add(glow);
      return glow;
  }

  createStars() {
    var radius = 5000;
    var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];
    for ( i = 0; i < 250; i ++ ) {
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.multiplyScalar( r );
      starsGeometry[ 0 ].vertices.push( vertex );
    }
    for ( i = 0; i < 1500; i ++ ) {
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.multiplyScalar( r );
      starsGeometry[ 1 ].vertices.push( vertex );
    }
    var stars;
    var starsMaterials = [
      new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
      new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
      new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
      new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
      new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
      new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
    ];
    for ( i = 10; i < 30; i ++ ) {
      stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
      stars.rotation.x = Math.random() * 6;
      stars.rotation.y = Math.random() * 6;
      stars.rotation.z = Math.random() * 6;
      stars.scale.setScalar( i * 10 );
      stars.matrixAutoUpdate = false;
      stars.updateMatrix();
      this.scene.add(stars);
    }
  }

  setUpControls() {
    const trackball = new TrackballControls(this.camera, this.renderer.domElement);
    trackball.rotateSpeed = TRACKBALL_DEFAULTS.rotateSpeed;
    trackball.zoomSpeed = TRACKBALL_DEFAULTS.zoomSpeed;
    trackball.panSpeed = TRACKBALL_DEFAULTS.panSpeed;
    trackball.noZoom = TRACKBALL_DEFAULTS.noZoom;
    trackball.noPan = TRACKBALL_DEFAULTS.noPan;
    trackball.staticMoving = TRACKBALL_DEFAULTS.staticMoving;
    trackball.dynamicDampingFactor = TRACKBALL_DEFAULTS.dynamicDampingFactor;

    this.trackball = trackball;
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
    this.trackball.update();
  }

  // get the gravitational acceleration contribution from another orbital body
  get_acceleration_contribution(body1, body2) {
    // this is the force of body 2 acting on body 1, and will update both vector wise
    var separation_vector = new THREE.Vector3().subVectors(body2.position, body1.position);
    var separation = separation_vector.length();
    separation_vector.normalize();  // this is the direction of the force from body2 on body 1, so point at body 2
    // console.log(separation);
    var force = separation_vector.multiplyScalar(G * body1.mass * body2.mass / (separation * separation));
    // now add the acceleration to the body accelerations accordingly
    body1.acceleration.add(force.clone().multiplyScalar(1 / body1.mass));
    body2.acceleration.sub(force.clone().multiplyScalar(1 / body2.mass));  // sub because force acts in other direction
  }

  updateBodies() {
    // perform updating with delegated number of calculations per frame
    for (var k = 0; k < this.numberOfCalculationsPerFrame; k++) {
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
            this.get_acceleration_contribution(this.bodies[key1], this.bodies[key2]);
          } 
        }
      }

      // now update all the telemetry of all the bodies
      for (var key in this.bodies) {
        this.bodies[key].update_kinematics(this.deltaT);
      }
    }
    // now move the actual bodies on the screen
    for (var key in this.bodies) {
      this.bodies[key].move_body();
    }
  }

  // DOUBLE CHECK THIS IS NOT OVER COUNTING BY ONE FRAME
  updateDate() {
    this.current_time += this.numberOfCalculationsPerFrame * this.deltaT * Math.pow(10, 3) * this.frame_count;
    this.current_date = new Date(this.current_time);
    this.date_holder.innerHTML = this.date_label + this.current_date.toString();
  }

  updateTime() {
    this.time_per_frame = this.numberOfCalculationsPerFrame * this.deltaT;  // in seconds, going to need to scale this later
    this.time_per_frame_s = getTimeString(this.time_per_frame);
    this.time_factor = Math.floor(this.time_per_frame * this.frame_rate);
    this.time_factor_s = getTimeString(this.time_factor);
    this.time_info_holder.innerHTML = this.kt_label + this.deltaT.toString() + this.cc_label + 
      this.numberOfCalculationsPerFrame.toString() + this.dt_label + this.time_per_frame_s + 
      this.fr_label + this.frame_rate.toString() + this.tf_label + this.time_factor.toString() +
      this.ts_label + this.time_factor_s;
  }

  updatePerspective() {
    this.viewer_distance = new THREE.Vector3().subVectors(this.camera.position.clone().multiplyScalar(DISTANCE_SCALE), 
      this.bodies.sun.position).length();
    this.perspective_holder.innerHTML = this.p_label + getDistanceString(this.viewer_distance);
  }

  // button interaction functions
  toSunView() {
    console.log('want sun?');
    this.trackball.enabled = true;
    this.current_target = undefined;
    this.numberOfCalculationsPerFrame = DEFAULT_FRAMES;
    const cameraPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(this.data.sun.radius * 0.75 / PLANET_SCALE);
    this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    this.camera.lookAt(this.scene.position);
  }

  toEarthView() {
    console.log('want earth?');
    this.current_target = this.bodies.earth;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toMoonView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.moon;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toMercuryView() {
    console.log('want mercury?');
    this.current_target = this.bodies.mercury;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE / 15);
  }

  toVenusView() {
    console.log('want venus?');
    this.current_target = this.bodies.venus;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE / 10);
  }

  toMarsView() {
    console.log('want mars?');
    this.current_target = this.bodies.mars;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toJupiterView() {
    console.log('want jupiter?');
    this.current_target = this.bodies.jupiter;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toIoView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.io;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toEuropaView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.europa;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toGanymedeView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.ganymede;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toCallistoView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.callisto;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toSaturnView() {
    console.log('want saturn?');
    this.current_target = this.bodies.saturn;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toTitanView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.titan;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toUranusView() {
    console.log('want saturn?');
    this.current_target = this.bodies.uranus;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toNeptuneView() {
    console.log('want neptune?');
    this.current_target = this.bodies.neptune;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toTritonView() {
    this.trackball.enabled = false;
    this.current_target = this.bodies.triton;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.host.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  toPlutoView() {
    console.log('want pluto?');
    this.current_target = this.bodies.pluto;
    this.trackball.enabled = false;
    this.numberOfCalculationsPerFrame = Math.ceil(2 * Math.PI / this.current_target.omega / this.deltaT /
     FRAMES_TO_ROTATE);
  }

  onResetView() {
    this.trackball.enabled = true;
    this.current_target = undefined;
    this.numberOfCalculationsPerFrame = DEFAULT_FRAMES;
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

  run() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));    
    this.render();
  }

  render() {
    if (this.paused) {
      return;
    }
    this.updateControls();
    this.updateBodies();
    this.updateCamera();
    this.updateAxCam();
    this.updateSunGlow();

    // time tracking
    this.frame_count += 1;
    let t = performance.now();
    if (t - this.last_update_time > this.update_dt) {
      this.frame_rate = Math.floor(this.frame_count / (t - this.last_update_time) * 1000);
      this.last_update_time = t;
      // update the date before resetting frame count
      this.updateDate();
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


