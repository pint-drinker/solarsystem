// this will house the constants we will use for the simulation

const SUN_SCALE = Math.pow(10, 7);
const PLANET_SCALE = Math.pow(10, 6);  // so mplanet sizes are shrunk by a factor of a million
const AU = 1.496 * Math.pow(10, 11);
const DISTANCE_SCALE = AU / 300;  // distances are shrunk by a factor of 1 AU to 300 pixels
const MOON_FAC = 10;
const FRAMES_TO_ROTATE = 60;
const DEFAULT_FRAMES = 500;

const G = 6.67408 * Math.pow(10, -11);

const SUN0 = {
	mass: 1.98855 * Math.pow(10, 30),
	radius: 695.7 * Math.pow(10, 6),
	position: new THREE.Vector3(0, 0, 0),
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 2.9721 * Math.pow(10, -6),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for cartesian technique
	position: new THREE.Vector3(0, 0, 0), 
	velocity: new THREE.Vector3(0, 0, 0),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const MERCURY0 = {
	mass: 3.3 * Math.pow(10, 23),
	radius: 2439500,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 7.2921159 * Math.pow(10, -5) / 176,  // day cycle speed
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(57909227000, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -47855.4),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting

};

const VENUS0 = {
	mass: 4.87 * Math.pow(10, 24),
	radius: 6.052 * Math.pow(10, 6),
	local_axis: new THREE.Vector3(0, 1, 0),  // axis that the planet rotates on
	local_theta: 0,  // angle value of local spin
	local_omega: 7.2921159 * Math.pow(10, -5) / 117,  // day cycle speed
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for cartesian technique
	// do this later to make the angle arbitrary
	position: new THREE.Vector3(108209475000, 0, 0),  // this should eventually by auto adjusting for the axis
	// assuming always zero in the z direction
	velocity: new THREE.Vector3(0, 0, -34974.289),  // will need to eventually be auto adjusted based on axis stuff
	// add this in leter
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting

};

const EARTH0 = {
	mass: 5.972 * Math.pow(10, 24),
	radius: 6.371 * Math.pow(10, 6) * 0.7,
	local_axis: new THREE.Vector3(0, 1, 0),  // axis that the planet rotates on
	local_theta: 0,  // angle value of local spin
	local_omega: 7.2921159 * Math.pow(10, -5),  // day cycle speed
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for cartesian technique
	// do this later to make the angle arbitrary
	position: new THREE.Vector3(1.496 * Math.pow(10, 11), 0, 0),  // this should eventually by auto adjusting for the axis
	// assuming always zero in the z direction
	velocity: new THREE.Vector3(0, 0, -29785.151),  // will need to eventually be auto adjusted based on axis stuff
	// add this in leter
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const MOON0 = {
	mass: 7.35 * Math.pow(10, 22),
	radius: 1737500,
	local_axis: new THREE.Vector3(0, 1, 0),  // axis that the planet rotates on
	local_theta: 0,  // angle value of local spin
	local_omega: 7.2921159 * Math.pow(10, -5) / 27,  // day cycle speed
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(1.496 * Math.pow(10, 11) + 384400000, 0, 0),  // relative to earths position
	velocity: new THREE.Vector3(0, 0, -29785.151 + -1023.969), // relative to earth
	acceleration: new THREE.Vector3(0, 0, 0)
};

const MARS0 = {
	mass: 6.41693 * Math.pow(10, 23),
	radius: 3389500,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 7.107325 * Math.pow(10, -5),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(227943824000, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -2.4077 * Math.pow(10, 4)),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const JUPITER0 = {
	mass: 5.972 * Math.pow(10, 24) * 318,
	radius: 71492000,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 1.76 * Math.pow(10, -4),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(778340821000, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -13062.13),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const SATURN0 = {
	mass: 5.972 * Math.pow(10, 24) * 95,
	radius: 60268000,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 1.652 * Math.pow(10, -4),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(1426666422000, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -9645.789),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const URANUS0 = {
	mass: 5.972 * Math.pow(10, 24) * 15,
	radius: 25559000,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 1.0128 * Math.pow(10, -4),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(1.496 * Math.pow(10, 11) * 19.19, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -6802.89),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const NEPTUNE0 = {
	mass: 5.972 * Math.pow(10, 24) * 17,
	radius: 24764000,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 9.6963 * Math.pow(10, -5),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(1.496 * Math.pow(10, 11) * 30.10, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -5434.9995),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const PLUTO0 = {
	mass: 1.31 * Math.pow(10, 22),
	radius: 1186000,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 1.13851 * Math.pow(10, -5),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	position: new THREE.Vector3(1.496 * Math.pow(10, 11) * 39.26, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -4719.06),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};



const TRACKBALL_DEFAULTS = {
	rotateSpeed: 2.0,
    zoomSpeed: 1.0,
    panSpeed: 0.15,
    noZoom: false,
    noPan: false,
    staticMoving: false,
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

const COLORS = {
	white: 0xFFFFFF,
	silver: 0xC0C0C0,
	black: 0x000000,
	maroon: 0x800000,
	olive: 0x808000,
	bright_green: 0x008000,
	soft_white: 0xfafafa,
	red: 0xFF0000,
	green: 0x00FF00,
	blue: 0x0000FF,
	yellow: 0xFFFF00,
	highlight: 0xF0F050,
	cyan: 0x00FFFF,
	purple: 0x8000FF,
	light_purple: 0xC561FF,
	pink: 0xFF00E8,
	orange: 0xFF8300,
	salmon: 0xFA8072,
	paperless_orange: 0xED6C24,
	gray: 0xA9AFAF,
	turquoise: 0x2AD2E3,
	navy: 0x0F2897,
	soft_blue: 0x67D0F2
};

const COLOR_CODES = {};
COLOR_CODES['x'] = COLORS.red;
COLOR_CODES['y'] = COLORS.green;
COLOR_CODES['z'] = COLORS.blue;
COLOR_CODES['disabled'] = COLORS.gray;
COLOR_CODES['enabled'] = COLORS.soft_blue;
COLOR_CODES['hover'] = COLORS.paperless_orange;

const OPACITY_MAP = {
	part_opacity: 1,
	full: 1,
	dfm: 0.5,
	feature: 0.75,
	direction: 1,
	highlight: 0.6,
	selected: 0.6,
	edge_highlight: 0.8,
	edge_std: 0
};

const MATERIAL_PROPERTIES = {
	color: COLORS.orange,
	opacity: OPACITY_MAP.part_opacity,
	reflectivity: 0.1,
	metalness: 0.1
};