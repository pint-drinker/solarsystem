

getNodeComputedProperty = (node, prop) => {
  return window.getComputedStyle(node, null).getPropertyValue(prop);
};



class SolarSystem {
  constructor() {
    // initializing node
    this.node = document.getElementById("container");
    this.node.width = window.innerWidth;
    this.node.height = window.innerHeight;
    this.nodeWidth = window.innerWidth;
    this.nodeHeight = window.innerHeight;

    // bodies
    this.bodies = [];
    this.sun = new OrbitalBody(SUN0, new THREE.Vector3(0, 1, 0), 'Sun');
    this.earth = new OrbitalBody(EARTH0, new THREE.Vector3(0, 1, 0), 'Earth');
    this.mars = new OrbitalBody(MARS0, new THREE.Vector3(0, 1, 0), 'Mars');
    this.bodies.push(this.sun);
    this.bodies.push(this.earth);
    this.bodies.push(this.mars);
    
    // number of calculations per second
    this.numberOfCalculationsPerFrame = 500;
    // The length of the time increment, in seconds.
    this.deltaT = 3600 * 24 / 3000;
    // this ends up being 12 hours per frame

    // ray casting
    this.mouse = {x: 0, y: 0};
    this.select_mouse = {x: 0, y: 0};
    this.raycaster = new THREE.Raycaster();
    this.intersected = null;
    this.selected = null;

    // world elements
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.spotLight = this.createSpotLight();
    this.light = this.createAmbientLight();
    this.directionalLight = this.createDirectionalLight();
    

     // additional setups
    this.setUpControls();
    this.axes = new ThreeAxes(document.getElementById("container"), this.camera);

    // now add everything to the scene
    for (var i in this.bodies) {
      this.scene.add(this.bodies[i].group);
    }
    this.createStars();

    this.add_event_listeners();

    console.log(this);
    this.run();
  }


  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.nodeWidth, this.nodeHeight);
    renderer.setClearColor(COLORS.black, 0);
    this.node.appendChild(renderer.domElement);
    return renderer;
  }

  createScene() {
    // creates the scene
    return new THREE.Scene();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(50, this.nodeWidth / this.nodeHeight, 1, 1000000);
    const cameraPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(SUN0.radius * 2 / PLANET_SCALE);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(this.scene.position);
    camera.visible = true;
    //WE WANT Z TO BE THE UP AXIS IN GENERAL
    // camera.up = new THREE.Vector3(0, 0, 1);
    this.scene.add(camera);
    return camera;
  }

  createSpotLight() {
    //add in spotlight to track with camera
    const spotLight = new THREE.SpotLight(COLOR_CODES.spotlight, 0.2);
    spotLight.up = this.camera.up;
    const pos = new THREE.Vector3(1, 1, 1).multiplyScalar(SUN0.radius * 2 / PLANET_SCALE);
    spotLight.position.set(pos.x, pos.y, pos.z);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 12;
    // spotLight.visible = false;
    this.scene.add(spotLight);
    return spotLight;
  }

  createDirectionalLight() {
    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( -1, 0, 1 ).normalize();
    this.scene.add( dirLight );
    return dirLight;
  }

  createAmbientLight() {
    const light = new THREE.AmbientLight(COLORS.soft_white, 0.5);
    this.scene.add(light);
    return light;
  }

  createStars() {
    var radius = 500;
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

  updateControls() {
    this.trackball.update();
  }

  updateSpotlight() {
    const sc = this.camera.position.length();
    this.spotLight.position.set(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z
    );
    this.spotLight.angle = Math.atan(sc / sc);
    this.spotLight.target.position.set(this.scene.position);
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
      for (var i = 0; i < this.bodies.length; i ++) {
        this.bodies[i].acceleration.set(0, 0, 0);
      }
      // resolve all the accelerations
      for (var i = 0; i < this.bodies.length; i++) {
        for (var j = i + 1; j < this.bodies.length; j++) {
          this.get_acceleration_contribution(this.bodies[i], this.bodies[j]);
        }
      }
      // now update all the telemetry of all the bodies
      for (var i = 0; i < this.bodies.length; i ++) {
        this.bodies[i].update_kinematics(this.deltaT);
      }
    }
    // now move the actual bodies on the screen
    for (var i = 0; i < this.bodies.length; i ++) {
      this.bodies[i].move_body();
    }
  }

  add_event_listeners() {
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, false);
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
    this.updateSpotlight();
    this.updateAxCam();
    this.updateControls();
    this.updateBodies();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.axes.renderer.render(this.axes.scene, this.axes.camera);
  }
}

// now call everything
var system = new SolarSystem();


