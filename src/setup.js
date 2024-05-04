// houses the setup functions for the solar system that are called by the class instance

createRenderer = function (node) {
    const renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(node.width, node.height);
    renderer.setClearColor(0x000000, 0);
    node.appendChild(renderer.domElement);
    return renderer;
}

createCamera = function (node, radius) {
    const camera = new THREE.PerspectiveCamera(50, node.width / node.height, 1, 10000000);
    const cameraPosition = new THREE.Vector3(13000, 13000, 13000);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    //WE WANT Z TO BE THE UP AXIS IN GENERAL
    camera.up = new THREE.Vector3(0, 0, 1);
    return camera;
}


setUpControls = function (camera, renderer) {
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


createStars = function () {
    var radius = 5000;
    var i, r = radius, starsGeometry = [new THREE.Geometry(), new THREE.Geometry()];
    for (i = 0; i < 250; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);
        starsGeometry[0].vertices.push(vertex);
    }
    for (i = 0; i < 1500; i++) {
        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);
        starsGeometry[1].vertices.push(vertex);
    }
    var stars;
    var starsMaterials = [
        new THREE.PointsMaterial({color: 0x555555, size: 2, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0x555555, size: 1, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0x333333, size: 2, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0x3a3a3a, size: 1, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0x1a1a1a, size: 2, sizeAttenuation: false}),
        new THREE.PointsMaterial({color: 0x1a1a1a, size: 1, sizeAttenuation: false})
    ];
    var out = [];
    for (i = 10; i < 30; i++) {
        stars = new THREE.Points(starsGeometry[i % 2], starsMaterials[i % 6]);
        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar(i * 10);
        stars.matrixAutoUpdate = false;
        stars.updateMatrix();
        out.push(stars.clone());
    }
    return out
}

//http://stemkoski.github.io/Three.js/Shader-Glow.html
createGlow = function (orbital_body) {
    const position = new THREE.Vector3(1, 1, 1).multiplyScalar(orbital_body.radius * 0.75 / PLANET_SCALE);
    var customMaterial = new THREE.ShaderMaterial({
        uniforms:
            {
                "c": {type: "f", value: 0.0},
                "p": {type: "f", value: 2.0},
                glowColor: {type: "c", value: new THREE.Color(0xffff00)},
                viewVector: {type: "v3", value: position}
            },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    var glow = new THREE.Mesh(orbital_body.body.geometry.clone(), customMaterial.clone());
    glow.position.set(orbital_body.group.position.x, orbital_body.group.position.y, orbital_body.group.position.z);
    glow.scale.multiplyScalar(1.01);
    return glow;
}

// setting up gui
setupGui = function () {
    var gui = new dat.GUI();
    // time scaling units are in weeks
    var parameters = {
        week_scale: 0.14, day_scale: 0, hour_scale: 0, minute_scale: 0, second_scale: 0, color: "#ffff00"
    };

    var top = gui.addFolder('Time Scaling');

    var cGUI = top.add(parameters, 'week_scale').min(-52).max(52).step(1).name("Weeks/Sec").listen();  // 1.65 * Math.pow(10, -6)
    cGUI.onChange(function (value) {
        week_dt = 604800 * value;
        DELTA_T = (week_dt + day_dt + hour_dt + minute_dt + second_dt) / NUMBER_OF_CALCULATIONS_PER_FRAME / FRAME_RATE;
    });
    var dGUI = top.add(parameters, 'day_scale').min(-7).max(7).step(1).name("Days/Sec").listen();
    dGUI.onChange(function (value) {
        day_dt = 86400 * value;
        DELTA_T = (week_dt + day_dt + hour_dt + minute_dt + second_dt) / NUMBER_OF_CALCULATIONS_PER_FRAME / FRAME_RATE;
    });
    var hGUI = top.add(parameters, 'hour_scale').min(-24).max(24).step(1).name("Hours/Sec").listen();
    hGUI.onChange(function (value) {
        hour_dt = 3600 * value;
        DELTA_T = (week_dt + day_dt + hour_dt + minute_dt + second_dt) / NUMBER_OF_CALCULATIONS_PER_FRAME / FRAME_RATE;
    });
    var mGUI = top.add(parameters, 'minute_scale').min(-60).max(60).step(1).name("Mins/Sec").listen();
    mGUI.onChange(function (value) {
        minute_dt = 60 * value;
        DELTA_T = (week_dt + day_dt + hour_dt + minute_dt + second_dt) / NUMBER_OF_CALCULATIONS_PER_FRAME / FRAME_RATE;
    });
    var sGUI = top.add(parameters, 'second_scale').min(-60).max(60).step(1).name("Seconds/Sec").listen();
    sGUI.onChange(function (value) {
        second_dt = value;
        DELTA_T = (week_dt + day_dt + hour_dt + minute_dt + second_dt) / NUMBER_OF_CALCULATIONS_PER_FRAME / FRAME_RATE;
    });
}

createOrbitalBodies = function () {
    // create the bodies from
    bodies = {};
    for (const [key, bodyObj] of Object.entries(GLOBAL_BODY_DATA)) {
        bodies[key] = new OrbitalBody(bodyObj, key);
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
