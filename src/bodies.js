class OrbitalBody {
	constructor(initial_conditions, up) {
		console.log(initial_conditions);
		this.mass = initial_conditions.mass;
		this.radius = initial_conditions.radius;
		this.up = up;

		// set up a structure to add the two planets and then test it out
		this.local_axis = initial_conditions.local_axis;
		this.local_theta = initial_conditions.local_theta;
		this.local_omega = initial_conditions.local_omega;
		this.local_alpha = initial_conditions.local_alpha;
		this.system_axis = initial_conditions.system_axis;
		this.system_theta = initial_conditions.system_theta;
		this.system_omega = initial_conditions.system_omega;
		this.system_alpha = initial_conditions.system_alpha;
		this.radial_position = initial_conditions.radial_position;
		this.radial_velocity = initial_conditions.radial_velocity;
		this.radial_acceleration = initial_conditions.radial_acceleration;

		this.position = new THREE.Vector3(this.radial_position, 0, 0);

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
	      color: COLORS.blue, 
	      transparent: false, 
	      opacity: MATERIAL_PROPERTIES.opacity, 
	      reflectivity: MATERIAL_PROPERTIES.reflectivity, 
	      metalness: MATERIAL_PROPERTIES.metalness
	    });
	    this.body = new THREE.Mesh(this.geometry, this.material);
	    console.log(this.body);
	    this.resolve_cartesian();
	}

	// not need to round to prevent the propagation of obscene errors that lead to huge chaos
	get_radial_acceleration() {
		return (this.radial_position * Math.pow(this.system_omega, 2) - G * 
			SUN0.mass / Math.pow(this.radial_position, 2)).toFixed(4);
	}

	get_system_alpha() {
		return (-2 * this.radial_velocity * this.system_theta / this.radial_position).toFixed(4);
	}

	get_new_value(current, dt, derivative) {
		return current + dt * derivative;
	}

	resolve_cartesian() {
		// this will be with respect to the system_axis input
		this.position = new THREE.Vector3(this.radial_position * Math.cos(this.system_theta) / DISTANCE_SCALE, 0, 
			this.radial_position * -Math.sin(this.system_theta) / DISTANCE_SCALE);

		// now rotate according to the axis and standard y up, 
		// from https://stackoverflow.com/questions/25199173/how-to-find-rotation-matrix-between-two-vectors-in-three-js
		// need to figure this out here
		// this.body.quaternion.setFromUnitVectors(this.up, this.system_axis);
		// console.log(this.position);
		// console.log(this.position);

	}

	move_planet() {
		this.body.position.set(this.position.x, this.position.y, this.position.z);
		// console.log(this.body.position);
	}

	update_planet(dt, num) {
		// will update everything about the body if need be, including real valued shit and other stuff
		// console.log(this.body.position);
		for (var i = 0; i < num; i++) {


			this.radial_acceleration = this.get_radial_acceleration();
			this.system_alpha = this.get_system_alpha();

			this.system_omega = this.get_new_value(this.system_omega, dt, this.system_alpha);
			this.system_theta = this.get_new_value(this.system_theta, dt, this.system_omega);

			this.radial_velocity = this.get_new_value(this.radial_velocity, dt, this.radial_acceleration);
			this.radial_position = this.get_new_value(this.radial_position, dt, this.radial_velocity);
			// console.log(this.body.position);

		}

		// now resolve to cartesian and update the bodies position
		this.resolve_cartesian();
		// console.log(this.body.position);
		// console.log('end');

		// add in local axis stuff as well

		// now move the planet
		this.move_planet();
		// console.log(this.body.position);

	}
}