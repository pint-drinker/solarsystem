

getNodeComputedProperty = (node, prop) => {
  return window.getComputedStyle(node, null).getPropertyValue(prop);
};



class SolarSystem {
  constructor() {

    this.node = document.getElementById("container");
    this.nodeWidth = parseInt(getNodeComputedProperty(document.getElementById("container"), 'width'));
    this.nodeHeight = parseInt(getNodeComputedProperty(document.getElementById("container"), 'height'));

    this.sun_geometry = new THREE.SphereGeometry(20, 25, 25);
    this.sun_material = new THREE.MeshPhysicalMaterial( {
      color: MATERIAL_PROPERTIES.color, 
      transparent: false, 
      opacity: MATERIAL_PROPERTIES.opacity, 
      reflectivity: MATERIAL_PROPERTIES.reflectivity, 
      metalness: MATERIAL_PROPERTIES.metalness
    });
    this.sun = new THREE.Mesh(this.sun_geometry, this.sun_material);


    this.earth_geometry = new THREE.SphereGeometry(5, 25, 25);
    this.earth_material = new THREE.MeshPhysicalMaterial( {
      color: COLORS.blue, 
      transparent: false, 
      opacity: MATERIAL_PROPERTIES.opacity, 
      reflectivity: MATERIAL_PROPERTIES.reflectivity, 
      metalness: MATERIAL_PROPERTIES.metalness
    });
    this.earth = new THREE.Mesh(this.earth_geometry, this.earth_material);
    this.earth.position.set(100, 0, 0);
    this.earth_state = {
      dist_to_sun: 100,
      position: new THREE.Vector3(100, 0, 0),
      velocity: new THREE.Vector3(0, 0, -20),
      acceleration: new THREE.Vector3(0, 0, 0),
      angular_position: 0,
      angular_velocity: 0.05, // about y axis
      angular_acceleration: 0,
      cartesian_force: new THREE.Vector3(0, 0, 0),
      polar_force: new THREE.Vector3(0,0,0)
    };


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
    this.light = this.createLight();
    

     // additional setups
    this.setUpControls();
    this.axes = new ThreeAxes(this.node, this.camera);

    this.scene.add(this.sun);
    this.scene.add(this.earth);

    console.log(this);
    this.run();

  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.nodeWidth, this.nodeHeight);
    renderer.setClearColor(COLOR_CODES.scene_color, 0);
    this.node.appendChild(renderer.domElement);
    return renderer;
  }

  createScene() {
    // creates the scene
    return new THREE.Scene();
  }


  createCamera() {
    const camera = new THREE.PerspectiveCamera(50, this.nodeWidth / this.nodeHeight, 1, 10000);
    const cameraPosition = new THREE.Vector3(1, 1, 1).multiplyScalar(SCENE_DEFAULTS.scale_length);
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
    const spotLight = new THREE.SpotLight(COLOR_CODES.spotlight, 1);
    spotLight.up = this.camera.up;
    spotLight.position.set(400, 400, 400);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 12;
    // spotLight.visible = false;
    this.scene.add(spotLight);
    return spotLight;
  }

  createLight() {
    const light = new THREE.AmbientLight(COLORS.soft_white, 0.2);
    this.scene.add(light);
    return light;
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
    this.spotLight.angle = Math.atan(SCENE_DEFAULTS.scale_length / sc);
    this.spotLight.target.position.set(this.scene.position);
  }

  updateForces() {
    // do gravity stuff here

  }

  updateAccelerations() {

  }

  updateVelocities() {

  }

  updatePositions() {
    // for now x is just rotating in x-z plane, can be resolved into a polar coordinate system
    this.earth_state.angular_position += this.earth_state.angular_velocity;
    this.earth.position.setX(this.earth_state.dist_to_sun * Math.cos(this.earth_state.angular_position));
    this.earth.position.setZ(this.earth_state.dist_to_sun * - Math.sin(this.earth_state.angular_position));
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
    this.updatePositions();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    // this.axes.renderer.render(this.axes.scene, this.axes.camera);
  }
}

// now call everything
var system = new SolarSystem();