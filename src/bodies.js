class OrbitalBody {
	constructor(initial_conditions, up, name) {
		console.log(initial_conditions);
		this.name = name;
		this.group = new THREE.Group();  // possibly for moons and shit

		this.mass = initial_conditions.mass;
		this.radius = initial_conditions.radius;
		this.up = up;

		// set up a structure to add the two planets and then test it out
		this.local_axis = initial_conditions.local_axis;
		this.local_theta = initial_conditions.local_theta;
		this.local_omega = initial_conditions.local_omega;
		this.local_alpha = initial_conditions.local_alpha;
		this.system_axis = initial_conditions.system_axis;

		// cartesian updates
		this.position = initial_conditions.position;
		this.velocity = initial_conditions.velocity;
		this.acceleration = initial_conditions.acceleration;

		// for conveninetly resolving to cartesian coordinates
		// need to check this thoroughly
		this.system_quaternion = new THREE.Quaternion();
		this.system_quaternion.setFromUnitVectors( this.up, this.system_axis);

		// for adjutng the spin nicely, need to figure this out later
		this.local_quaternion = new THREE.Quaternion();
		this.local_quaternion.setFromUnitVectors( this.up, this.local_axis);

		// create the actual body
	    this.body = this.create(this.name);
	    this.group.add(this.body);

	    this.max_points = 500;
	    this.points = [];

	    this.move_body();	    
	}

	create(name) {
		if (name == 'Earth') {
			var geometry	= new THREE.SphereGeometry(EARTH0.radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map		: THREE.ImageUtils.loadTexture('images/earthmap1k.jpg'),
				bumpMap		: THREE.ImageUtils.loadTexture('images/earthbump1k.jpg'),
				bumpScale	: 0.05,
				specularMap	: THREE.ImageUtils.loadTexture('images/earthspec1k.jpg'),
				specular	: new THREE.Color('grey'),
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'Sun') {
			var geometry	= new THREE.SphereGeometry(SUN0.radius / SUN_SCALE * 1.5, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/sunmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'Mars') {
			var geometry	= new THREE.SphereGeometry(MARS0.radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/marsmap1k.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/marsbump1k.jpg'),
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'Mercury') {
			var geometry	= new THREE.SphereGeometry(MERCURY0.radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/mercurymap.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/mercurybump.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'Venus') {
			var geometry	= new THREE.SphereGeometry(VENUS0.radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/venusmap.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/venusbump.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'Jupiter') {
			var geometry	= new THREE.SphereGeometry(JUPITER0.radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/jupitermap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.02,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'Saturn') {
			var geometry	= new THREE.SphereGeometry(SATURN0.radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/saturnmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'Uranus') {
			var geometry	= new THREE.SphereGeometry(URANUS0.radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/uranusmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'Neptune') {
			var geometry	= new THREE.SphereGeometry(NEPTUNE0.radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/neptunemap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'Pluto') {
			var geometry	= new THREE.SphereGeometry(PLUTO0.radius / PLANET_SCALE * 10, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/plutomap1k.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/plutobump1k.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		}
	}

	// call this after all the bits of acceleration have been added from each orbital body
	update_kinematics(dt) {
		// update 
		this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
		this.position.add(this.velocity.clone().multiplyScalar(dt));
		// need to resolve local spinning based on local axis, need to make that nice
		this.local_theta += this.local_omega * dt;
	}

	move_body() {
		this.body.position.set(this.position.x / DISTANCE_SCALE, this.position.y / DISTANCE_SCALE,
		 this.position.z / DISTANCE_SCALE);
		var rot = this.local_axis.clone().multiplyScalar(this.local_theta);
		this.body.rotation.set(rot.x, rot.y, rot.z);
	}


}