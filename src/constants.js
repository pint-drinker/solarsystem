// getting info on all the planets and shit
// https://ssd.jpl.nasa.gov/?horizons#telnet

const SUN_SCALE = 1.2 * Math.pow(10, 7);
const PLANET_SCALE = Math.pow(10, 6);  // so mplanet sizes are shrunk by a factor of a million
const AU = 1.496 * Math.pow(10, 11);
const DISTANCE_SCALE = AU / 300;  // distances are shrunk by a factor of 1 AU to 300 pixels
const MOON_FAC = 12;
const INITIAL_TIME = data.sun.time[0];
const END_TIME = data.sun.time[data.sun.time.length - 1];

const SHADOWS_ENABLED = false;

const G = 6.67408 * Math.pow(10, -11);

const TRACKBALL_DEFAULTS = {
	rotateSpeed: 2.0,
    zoomSpeed: 2.0,
    panSpeed: 2.0,
    noZoom: false,
    noPan: false,
    staticMoving: true,
    dynamicDampingFactor: 0.15
};

const SCENE_DEFAULTS = {
	axes_shrink_factor: 5,
	cam_distance: 30,
	scale_length: 40,
};

// need to filereader all the objects in to memory so they can be loaded in the browser
