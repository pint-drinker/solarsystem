
var loaded_bodies = [];

var NUM_BODIES = 17;

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
		this.create_rings = this.create_rings.bind(this);
	    this.body = this.create(this.name, this.radius);
	    this.rings = this.create_rings(this.name);
	    this.group.add(this.body);
	    if (this.rings) {
	    	this.group.add(this.rings);
	    }

	    this.max_points = 500;
	    this.points = [];

	    this.host = undefined;

	    // only initially move it isnt labeled a moon, moons will be moved relative to their hosts
	    this.move_body();	    
	}

	create(name, radius) {
		loaded_bodies.push(name);
		var loader = new THREE.TextureLoader();
		if (name == 'earth') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map		: loader.load('images/earthmap1k.jpg'),
				bumpMap		: loader.load('images/earthbump1k.jpg'),
				bumpScale	: 0.05,
				specularMap	: loader.load('images/earthspec1k.jpg'),
				specular	: new THREE.Color('grey'),
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'sun') {
			var geometry	= new THREE.SphereGeometry(radius / SUN_SCALE * 1.5, 32, 32)
			var texture	= loader.load('images/sunmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
				transparent: true,
				opacity: 1
			});
			var mesh	= new THREE.Mesh(geometry, material);
			return mesh	
		} else if (name == 'mars') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/marsmap1k.jpg'),
				bumpMap	: loader.load('images/marsbump1k.jpg'),
				bumpScale: 0.05,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'mercury') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/mercurymap.jpg'),
				bumpMap	: loader.load('images/mercurybump.jpg'),
				bumpScale: 0.005,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'venus') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/venusmap.jpg'),
				bumpMap	: loader.load('images/venusbump.jpg'),
				bumpScale: 0.005,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'jupiter') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= loader.load('images/jupitermap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.02,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'saturn') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= loader.load('images/saturnmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'uranus') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= loader.load('images/uranusmap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'neptune') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var texture	= loader.load('images/neptunemap.jpg')
			var material	= new THREE.MeshPhongMaterial({
				map	: texture,
				bumpMap	: texture,
				bumpScale: 0.05,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'pluto') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE * 10, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/plutomap1k.jpg'),
				bumpMap	: loader.load('images/plutobump1k.jpg'),
				bumpScale: 0.005,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh	
		} else if (name == 'moon') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/moonmap1k.jpg'),
				bumpMap	: loader.load('images/moonbump1k.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'titan') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/titanmap.png'),
				bumpMap	: loader.load('images/titanmap.png'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'triton') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/triton.jpg'),
				bumpMap	: loader.load('images/triton.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'ganymede') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/ganymede.jpg'),
				bumpMap	: loader.load('images/ganymede.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'callisto') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/callisto.jpg'),
				bumpMap	: loader.load('images/callisto.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'europa') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/europa.jpg'),
				bumpMap	: loader.load('images/europa.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else if (name == 'io') {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32)
			var material	= new THREE.MeshPhongMaterial({
				map	: loader.load('images/io.jpg'),
				bumpMap	: loader.load('images/io.jpg'),
				bumpScale: 0.002,
				shininess: 0
			})
			var mesh	= new THREE.Mesh(geometry, material)
			return mesh
		} else {
			var geometry	= new THREE.SphereGeometry(radius / PLANET_SCALE, 32, 32);
			var material	= new THREE.MeshPhongMaterial({color: 0x00ffff});
			var mesh = new THREE.Mesh(geometry, material);
			return mesh;
		}
	}

	create_rings(name) {
		if (name == 'saturn') {
			loaded_bodies.push[name];
			// create destination canvas
			var canvasResult	= document.createElement('canvas')
			canvasResult.width	= 915
			canvasResult.height	= 64
			var contextResult	= canvasResult.getContext('2d')	

			// load earthcloudmap
			var imageMap	= new Image();
			imageMap.addEventListener("load", function() {
				
				// create dataMap ImageData for earthcloudmap
				var canvasMap	= document.createElement('canvas')
				canvasMap.width	= imageMap.width
				canvasMap.height= imageMap.height
				var contextMap	= canvasMap.getContext('2d')
				contextMap.drawImage(imageMap, 0, 0)
				var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

				// load earthcloudmaptrans
				var imageTrans	= new Image();
				imageTrans.addEventListener("load", function(){
					// create dataTrans ImageData for earthcloudmaptrans
					var canvasTrans		= document.createElement('canvas')
					canvasTrans.width	= imageTrans.width
					canvasTrans.height	= imageTrans.height
					var contextTrans	= canvasTrans.getContext('2d')
					contextTrans.drawImage(imageTrans, 0, 0)
					var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
					// merge dataMap + dataTrans into dataResult
					var dataResult		= contextMap.createImageData(canvasResult.width, canvasResult.height)
					for(var y = 0, offset = 0; y < imageMap.height; y++){
						for(var x = 0; x < imageMap.width; x++, offset += 4){
							dataResult.data[offset+0]	= dataMap.data[offset+0]
							dataResult.data[offset+1]	= dataMap.data[offset+1]
							dataResult.data[offset+2]	= dataMap.data[offset+2]
							dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]/4
						}
					}
					// update texture with result
					contextResult.putImageData(dataResult,0,0)	
					material.map.needsUpdate = true;
				})
				imageTrans.src	= 'images/saturnringpattern.gif';
			}, false);
			imageMap.src	= 'images/saturnringcolor.jpg';
			
			var geometry	= new RingGeometry(1.11 * 60268000 / PLANET_SCALE, 2.9 * 60268000 / PLANET_SCALE, 64);
			var material	= new THREE.MeshPhongMaterial({
				map		: new THREE.Texture(canvasResult),
				side		: THREE.DoubleSide,
				transparent	: true,
				opacity		: 0.8,
			})
			var mesh	= new THREE.Mesh(geometry.geo, material);
			return mesh;
		} else {
			return undefined;
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
			this.group.position.set(x_comp, y_comp, z_comp);
		} else {
			var x_comp = this.host.position.x / DISTANCE_SCALE;
			var y_comp = this.host.position.y / DISTANCE_SCALE;
			var z_comp = this.host.position.z / DISTANCE_SCALE;
			var sep_vec = new THREE.Vector3().subVectors(this.host.position.clone(), this.position.clone());
			var fac = 1 / DISTANCE_SCALE * MOON_FAC * this.host.radius / 6371010;  // scaling based on siz of planet realtive to earth
			this.group.position.set(x_comp + sep_vec.x * fac,   
				y_comp + sep_vec.y * fac, 
				z_comp + sep_vec.z * fac);
		}
		if (this.name == 'sun') {
			this.body.rotation.set(0, 0, 0); 
			this.body.rotateX(Math.PI / 2 - this.obliquity);  // for mapping transformation, and matches seasons correctly
			this.body.rotateY(this.theta);
		} else {
			this.group.rotation.set(0, 0, 0); 
			this.group.rotateX(Math.PI / 2 - this.obliquity);  // for mapping transformation, and matches seasons correctly
			this.group.rotateY(this.theta);
		}
	}
}


class SpaceShip {
	constructor(group, position, velocity) {
		this.name = 'hermes';
		this.group = group;
		
		this.position = position;
		this.velocity = velocity;
		this.acceleration = new THREE.Vector3();

		this.mass = 1000000;  // one million pounds
		this.length = 300; // meters
		this.radius = 25;  // average radius

		this.I_yaw = 1/12 * this.mass * this.length * this.length;
		this.I_pitch = this.I_yaw;
		this.I_roll = 1/2 * this.mass * this.radius * this.radius;

		this.booster_thrust = 1000000 * 4.44822;
		this.brake_thrust = 500000 * 4.44822
		this.roll_torque = 1000000 * 4.44822;
		this.yaw_torque = 1000000 * 4.44822;
		this.pitch_torque = 1000000 * 4.44822;

		this.burn = {booster: false, brake: false, roll_left: false, roll_right: false, yaw_left: false, yaw_right: false, 
			pitch_up: false, pitch_down: false};

		this.host = undefined;


		this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.keydown = function( event ) {

		if ( event.altKey ) {
			return;
		}
		switch ( event.keyCode ) {

			case 16: /* shift */ this.burn.brake = true; break;
			case 32: /* space */ this.burn.booster = true; break;

			// case 87: /*W*/ this.moveState.forward = 1; break;
			// case 83: /*S*/ this.moveState.back = 1; break;

			// case 65: /*A*/ this.moveState.left = 1; break;
			// case 68: /*D*/ this.moveState.right = 1; break;

			// case 82: /*R*/ this.moveState.up = 1; break;
			// case 70: /*F*/ this.moveState.down = 1; break;

			// case 38: up this.moveState.pitchUp = 1; break;
			// case 40: /*down*/ this.moveState.pitchDown = 1; break;

			// case 37: /*left*/ this.moveState.yawLeft = 1; break;
			// case 39: /*right*/ this.moveState.yawRight = 1; break;

			// case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			// case 69: /*E*/ this.moveState.rollRight = 1; break;

		}

		// this.updateMovementVector();
		// this.updateRotationVector();

	};

	this.keyup = function( event ) {

		switch ( event.keyCode ) {

			case 32: /* space */ this.burn.booster = false; break;
			case 16: /* shift */ this.burn.brake = false; break;

			// case 87: /*W*/ this.moveState.forward = 0; break;
			// case 83: /*S*/ this.moveState.back = 0; break;

			// case 65: /*A*/ this.moveState.left = 0; break;
			// case 68: /*D*/ this.moveState.right = 0; break;

			// case 82: /*R*/ this.moveState.up = 0; break;
			// case 70: /*F*/ this.moveState.down = 0; break;

			// case 38: up this.moveState.pitchUp = 0; break;
			// case 40: /*down*/ this.moveState.pitchDown = 0; break;

			// case 37: /*left*/ this.moveState.yawLeft = 0; break;
			// case 39: /*right*/ this.moveState.yawRight = 0; break;

			// case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			// case 69: /*E*/ this.moveState.rollRight = 0; break;

		}

		// this.updateMovementVector();
		// this.updateRotationVector();

	};

	
	}
}


// from http://jeromeetienne.github.io/threex.planets/examples/select.html#Saturn
RingGeometry = function ( innerRadius, outerRadius, thetaSegments ) {

	this.geo = new THREE.Geometry();

	innerRadius	= innerRadius || 0
	outerRadius	= outerRadius || 50
	thetaSegments	= thetaSegments	|| 8

	var normal	= new THREE.Vector3( 0, 0, 1 )

	for(var i = 0; i < thetaSegments; i++ ){
		var angleLo	= (i / thetaSegments) *Math.PI*2
		var angleHi	= ((i+1) / thetaSegments) *Math.PI*2

		var vertex1	= new THREE.Vector3(innerRadius * Math.cos(angleLo), innerRadius * Math.sin(angleLo), 0);
		var vertex2	= new THREE.Vector3(outerRadius * Math.cos(angleLo), outerRadius * Math.sin(angleLo), 0);
		var vertex3	= new THREE.Vector3(innerRadius * Math.cos(angleHi), innerRadius * Math.sin(angleHi), 0);
		var vertex4	= new THREE.Vector3(outerRadius * Math.cos(angleHi), outerRadius * Math.sin(angleHi), 0);

		this.geo.vertices.push( vertex1 );
		this.geo.vertices.push( vertex2 );
		this.geo.vertices.push( vertex3 );
		this.geo.vertices.push( vertex4 );
		

		var vertexIdx	= i * 4;

		// Create the first triangle
		var face = new THREE.Face3(vertexIdx + 0, vertexIdx + 1, vertexIdx + 2, normal);
		var uvs = []

		var uv = new THREE.Vector2(0, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(0, 1)
		uvs.push(uv)

		this.geo.faces.push(face);
		this.geo.faceVertexUvs[0].push(uvs);

		// Create the second triangle
		var face = new THREE.Face3(vertexIdx + 2, vertexIdx + 1, vertexIdx + 3, normal);
		var uvs = []

		var uv = new THREE.Vector2(0, 1)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 0)
		uvs.push(uv)
		var uv = new THREE.Vector2(1, 1)
		uvs.push(uv)

		this.geo.faces.push(face);
		this.geo.faceVertexUvs[0].push(uvs);
	}

	// this.computeCentroids();
	this.geo.computeVertexNormals();
	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );

	// rotate the geometry a bit to account for z being up
	this.geo.rotateX(Math.PI / 2);

};