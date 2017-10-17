class OrbitalBody {
	constructor(obj, name) {
		this.name = name;
		this.group = new THREE.Group();  // possibly for moons and shit

		this.mass = obj.mass;
		this.radius = obj.radius;
		this.up = new THREE.Vector3(0, 0, 1);

		// set up a structure to add the two planets and then test it out
		this.theta = 0;
		this.omega = obj.omega;

		// cartesian updates
		this.position = new THREE.Vector3(obj.position[0], obj.position[1], obj.position[2]);
		this.velocity = new THREE.Vector3(obj.velocity[0], obj.velocity[1], obj.velocity[2])
		this.acceleration = new THREE.Vector3();

		// axis tilt, representing a rotation about the z direction in radians
		this.obliquity = obj.obliquity;
		this.axis = new THREE.Vector3(0, Math.cos(this.obliquity), Math.sin(this.obliquity));

		// create the actual body and any moons
	    this.body = this.create(this.name, this.radius);
	    this.group.add(this.body);

	    this.max_points = 500;
	    this.points = [];

	    this.host = undefined;

	    // only initially move it isnt labeled a moon, moons will be moved relative to their hosts
	    this.move_body();	    
	}

	create(name, radius) {
		if (name == 'earth') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map		: THREE.ImageUtils.loadTexture('images/earthmap1k.jpg'),
				bumpMap		: THREE.ImageUtils.loadTexture('images/earthbump1k.jpg'),
				bumpScale	: 0.05,
				specularMap	: THREE.ImageUtils.loadTexture('images/earthspec1k.jpg'),
				specular	: new THREE.Color('grey'),
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'sun') {
			var geometry	= new THREE.SphereGeometry(radius / SUN_SCALE * 1.5, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/sunmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'mars') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/marsmap1k.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/marsbump1k.jpg'),
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'mercury') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/mercurymap.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/mercurybump.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'venus') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/venusmap.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/venusbump.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'jupiter') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/jupitermap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.02,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'saturn') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/saturnmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'uranus') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/uranusmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'neptune') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= THREE.ImageUtils.loadTexture('images/neptunemap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'pluto') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE * 10, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/plutomap1k.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/plutobump1k.jpg'),
				bumpScale: 0.005,
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'moon') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: THREE.ImageUtils.loadTexture('images/moonmap1k.jpg'),
				bumpMap	: THREE.ImageUtils.loadTexture('images/moonbump1k.jpg'),
				bumpScale: 0.002,
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
		this.theta += this.omega * dt;
	}

	move_body() {
		if (!this.host) {
			var x_comp = this.position.x / DISTANCE_SCALE;
			var y_comp = this.position.y / DISTANCE_SCALE;
			var z_comp = this.position.z / DISTANCE_SCALE;
			this.body.position.set(x_comp, y_comp, z_comp);
		} else {
			var x_comp = this.host.position.x / DISTANCE_SCALE;
			var y_comp = this.host.position.y / DISTANCE_SCALE;
			var z_comp = this.host.position.z / DISTANCE_SCALE;
			var sep_vec = new THREE.Vector3().subVectors(this.host.position.clone(), this.position.clone());
			this.body.position.set(x_comp + sep_vec.x / DISTANCE_SCALE * MOON_FAC, 
				y_comp + sep_vec.y / DISTANCE_SCALE * MOON_FAC, 
				z_comp + sep_vec.z / DISTANCE_SCALE * MOON_FAC);
		}
		this.body.rotation.set(0, 0, 0); 
		this.body.rotateX(Math.PI / 2 - this.obliquity);  // for mapping transformation, and matches seasons correctly
		this.body.rotateY(this.theta);
	}


}