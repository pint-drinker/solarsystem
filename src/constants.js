// this will house the constants we will use for the simulation

const SUN_SCALE = Math.pow(10, 7);
const PLANET_SCALE = Math.pow(10, 6);  // so mplanet sizes are shrunk by a factor of a million
const DISTANCE_SCALE = 1.496 * Math.pow(10, 11) / 300;  // distances are shrunk by a factor of 1 AU to 300 pixels

const SUN0 = {
	mass: 1.98855 * Math.pow(10, 30),
	radius: 695.7 * Math.pow(10, 6),
	position: new THREE.Vector3(0, 0, 0),
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 2.9721 * Math.pow(10, -6),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for resolved 2d polar technique
	system_theta: 0,  // angle relative to 0, 0, 0
	system_omega: 0,  // angular velocity in rad/s around origin
	system_alpha: 0,  // angular acceleration around origin
	radial_position: 0,  // radial position from origin
	radial_velocity: 0,  // radial velocity from origin
	radial_acceleration: 0,  // radial acceleration from origin

	// for cartesian technique
	position: new THREE.Vector3(0, 0, 0), 
	velocity: new THREE.Vector3(0, 0, 0),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const EARTH0 = {
	mass: 5.972 * Math.pow(10, 24),
	radius: 6.371 * Math.pow(10, 6),
	local_axis: new THREE.Vector3(0, 1, 0),  // axis that the planet rotates on
	local_theta: 0,  // angle value of local spin
	local_omega: 7.2921159 * Math.pow(10, -5),  // day cycle speed
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for resolved 2d polar technique
	system_theta: 0,  // angle relative to 0, 0, 0
	system_omega: 1.990986 * Math.pow(10, -7),  // angular velocity in rad/s around origin
	system_alpha: 0,  // angular acceleration around origin
	radial_position: 1.496 * Math.pow(10, 11),  // radial position from origin
	radial_velocity: 0,  // radial velocity from origin
	radial_acceleration: 0,  // radial acceleration from origin

	// for cartesian technique
	// do this later to make the angle arbitrary
	position: new THREE.Vector3(1.496 * Math.pow(10, 11), 0, 0),  // this should eventually by auto adjusting for the axis
	// assuming always zero in the z direction
	velocity: new THREE.Vector3(0, 0, -29785.151),  // will need to eventually be auto adjusted based on axis stuff
	// add this in leter
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const MARS0 = {
	mass: 6.41693 * Math.pow(10, 23),
	radius: 3389500,
	local_axis: new THREE.Vector3(0, 1, 0),
	local_theta: 0,
	local_omega: 7.107325 * Math.pow(10, -5),
	local_alpha: 0,  // acceleration of planet day cycle
	system_axis: new THREE.Vector3(0, 1, 0),  // orbital plane normal

	// for resolved 2d polar technique
	system_theta: 0,  // angle relative to 0, 0, 0
	system_omega: 0,  // angular velocity in rad/s around origin
	system_alpha: 0,  // angular acceleration around origin
	radial_position: 0,  // radial position from origin
	radial_velocity: 0,  // radial velocity from origin
	radial_acceleration: 0,  // radial acceleration from origin

	// for cartesian technique
	position: new THREE.Vector3(227943824000, 0, 0), 
	velocity: new THREE.Vector3(0, 0, -2.4077 * Math.pow(10, 4)),
	acceleration: new THREE.Vector3(0, 0, 0)  // will be calsulated before enacting
};

const G = 6.67408 * Math.pow(10, -11);

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