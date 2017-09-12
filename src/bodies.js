class OrbitalBody {
	constructor(mass, radius, up, initial_conditions) {
		this.mass = mass;
		this.radius = radius;
		this.up = up;

		// set up a structure to add the two planets and then test it out
		this.local_axis = initial_conditions.local_axis;
		this.local_theta = initial_conditions.local_theta;
		this.local_omega = initial_conditions.local_omega;
		this.local_alpha = initial_conditions.local_alpha;
		this.system_axis = initial_conditions.system_axis;
		this.system_theta = initial_conditions.galactic_theta;
		this.system_omega = initial_conditions.system_omega;
		this.system_alpha = initial_conditions.system_alpha;
		this.radial_position = initial_conditions.radial_position;
		this.radial_velocity = initial_conditions.radial_velocity;
		this.radial_acceleration = initial_conditions.radial_acceleration;

		// houses all previous values
		this.state = initial_conditions;

		// for conveninetly resolving to cartesian coordinates
		// need to check this thoroughly
		this.system_quaternion = new THREE.Quaternion();
		this.system_quaternion.setFromUnitVectors( this.up, this.system_axis);


		// create the actual body and set all of its positions
		// also need to change for their tilt
		this.geometry = new THREE.SphereGeometry(this.radius / PLANET_SCALE, 25, 25);
    	this.material = new THREE.MeshPhysicalMaterial( {
	      color: COLORS.orange, 
	      transparent: false, 
	      opacity: MATERIAL_PROPERTIES.opacity, 
	      reflectivity: MATERIAL_PROPERTIES.reflectivity, 
	      metalness: MATERIAL_PROPERTIES.metalness
	    });
	    this.body = new THREE.Mesh(this.geometry, this.material);
	    this.resolve_cartesian();
	}

	get_radial_acceleration() {
		return this.radial_position * Math.pow(this.system_omega, 2) - G * SUN0.mass / Math.pow(this.radial_position, 2);
	}

	get_system_alpha() {
		return -2 * this.radial_velocity * this.system_theta / this.radial_position;
	}

	get_new_value(current, dt, derivative) {
		return current + dt * derivative;
	}

	resolve_cartesian() {
		// this will be with respect to the system_axis input
		this.position = new THREE.Vector3();
		// first resolve as if it is in the x-y plane, and then rotate accordingly
		this.position.setX(this.radial_position * Math.cos(this.system_theta)) / DISTANCE_SCALE;
		this.position.setY(0);
		this.position.setZ(this.radial_position * -Math.sin(this.system_theta)) / DISTANCE_SCALE;

		// now rotate according to the axis and standard y up, 
		// from https://stackoverflow.com/questions/25199173/how-to-find-rotation-matrix-between-two-vectors-in-three-js
		this.body.applyQuaternion(this.system_quaternion);

	}

	update_planet(dt) {
		// will update everything about the body if need be, including real valued shit and other stuff
		this.radial_acceleration = this.get_radial_acceleration();
		this.system_alpha = this.get_system_alpha();

		this.system_omega = this.get_new_value(this.system_omega, dt, this.system_alpha);
		this.system_theta = this.get_new_value(this.system_theta, dt, this.system_omega);

		this.radial_velocity = this.get_new_value(this.radial_velocity, dt, this.radial_acceleration);
		this.radial_position = this.get_new_value(this.radial_position, dt, this.radial_velocity);

		// now resolve to cartesian and update the bodies position
		this.resolve_cartesian();

		// add in local axis stuff as well

	}
}