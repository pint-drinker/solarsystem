// getting info on all the planets and shit
// https://ssd.jpl.nasa.gov/?horizons#telnet

const SUN_SCALE = 1.2 * Math.pow(10, 7);
const PLANET_SCALE = Math.pow(10, 6);  // so mplanet sizes are shrunk by a factor of a million
const AU = 1.496 * Math.pow(10, 11);
const DISTANCE_SCALE = AU / 300;  // distances are shrunk by a factor of 1 AU to 300 pixels
const MOON_FAC = 12;
const FRAMES_TO_ROTATE = 60;
const DEFAULT_FRAMES = 10;
const DEFAULT_dT = 3600 * 24 / 100;
const DEFAULT_UPDATE_TIME = 1000;  // update text every second, or 1000 milliseconds

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

// Maping between keys in the json document and the colors and descriptions associated with features
const KEYS = {
	earth: 'earth',
	sun: 'sun'
};
