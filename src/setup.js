// houses the setup functions for the solar system that are called by the class instance

createRenderer = function(node) {
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(node.width, node.height);
    renderer.setClearColor(0x000000, 0);
    node.appendChild(renderer.domElement);
    return renderer;
}

createCamera = function(node, radius) {
    const camera = new THREE.PerspectiveCamera(50, node.width / node.height, 1, 10000000);
    const cameraPosition = new THREE.Vector3(13000, 13000, 13000);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    //WE WANT Z TO BE THE UP AXIS IN GENERAL
    camera.up = new THREE.Vector3(0, 0, 1);
    return camera;
  }


setUpControls = function(camera, renderer) {
    const trackball = new TrackballControls(camera, renderer.domElement);
    trackball.rotateSpeed = TRACKBALL_DEFAULTS.rotateSpeed;
    trackball.zoomSpeed = TRACKBALL_DEFAULTS.zoomSpeed;
    trackball.panSpeed = TRACKBALL_DEFAULTS.panSpeed;
    trackball.noZoom = TRACKBALL_DEFAULTS.noZoom;
    trackball.noPan = TRACKBALL_DEFAULTS.noPan;
    trackball.staticMoving = TRACKBALL_DEFAULTS.staticMoving;
    trackball.dynamicDampingFactor = TRACKBALL_DEFAULTS.dynamicDampingFactor;
    return trackball;
  }


createStars = function() {
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
    var out = [];
    for ( i = 10; i < 30; i ++ ) {
      stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
      stars.rotation.x = Math.random() * 6;
      stars.rotation.y = Math.random() * 6;
      stars.rotation.z = Math.random() * 6;
      stars.scale.setScalar( i * 10 );
      stars.matrixAutoUpdate = false;
      stars.updateMatrix();
      out.push(stars.clone());
    }
    return out
  }

//http://stemkoski.github.io/Three.js/Shader-Glow.html
createGlow = function(orbital_body) {
     const position = new THREE.Vector3(1, 1, 1).multiplyScalar(orbital_body.radius * 0.75 / PLANET_SCALE);
     var customMaterial = new THREE.ShaderMaterial( {
        uniforms: 
        { 
          "c":   { type: "f", value: 0.0 },
          "p":   { type: "f", value: 2.0 },
          glowColor: { type: "c", value: new THREE.Color(0xffff00) },
          viewVector: { type: "v3", value: position }
        },
        vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var glow = new THREE.Mesh(orbital_body.body.geometry.clone(), customMaterial.clone() );
    glow.position.set(orbital_body.group.position.x, orbital_body.group.position.y, orbital_body.group.position.z);
    glow.scale.multiplyScalar(1.01);
    return glow;
}

// setting up gui
setupGui = function() {
	var gui = new dat.GUI();
	var parameters = 
	{time_scale : 0.14, color: "#ffff00" };  // time scaling units are in weeks

	var top = gui.addFolder('Time Scaling');

	var cGUI = 
	top.add(parameters, 'time_scale' ).min(1.65 * Math.pow(10, -6)).max(52).step(0.01).name("Weeks/Sec").listen();
	cGUI.onChange( function(value) { 
	  deltaT = resolveTimeStep(value, numberOfCalculationsPerFrame, frame_rate);
	});
}

createOrbitalBodies = function() {
	// create the bodies from 
	bodies = {};
	for (var key in data) {
      bodies[key] = new OrbitalBody(data[key], key);
    }

    // now add all the moons to their appropriate hosts
    bodies.moon.host = bodies.earth;
    bodies.io.host = bodies.jupiter;
    bodies.europa.host = bodies.jupiter;
    bodies.ganymede.host = bodies.jupiter;
    bodies.callisto.host = bodies.jupiter;
    bodies.titan.host = bodies.saturn;
    bodies.triton.host = bodies.neptune;

    // set up shadows
    if (SHADOWS_ENABLED) {
      for (var i in bodies) {
        if (bodies[i].name == 'sun') {
          bodies[i].body.castShadow = false;
          bodies[i].body.receiveShadow = false;
        } else if (bodies[i].host) {
          bodies[i].body.castShadow = false;
          bodies[i].body.receiveShadow = true;
        } else {
          bodies[i].body.castShadow = true;
          bodies[i].body.receiveShadow = false;
        }
      }
    }
    return bodies;
}





