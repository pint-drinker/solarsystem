// houses all of the utility functions not needed inside the solar system class

var TIME = INITIAL_TIME;  // everything will be driven and based off of this time value, and all we have to do is change this
// value to change the location of everything. And if we want to animate at certain speeds or with a slider, 
// we just change this value. This time will then parse through the data path of each body and update all
// of their displays.


getNodeComputedProperty = (node, prop) => {
  return window.getComputedStyle(node, null).getPropertyValue(prop);
};

getTimeString = function(seconds) {
  // determine chunk values
  let w = Math.floor(seconds / 604800);  // weeks
  let d = Math.floor((seconds % 604800) / 86400) ;  // days
  let h = Math.floor((seconds % 86400) / 3600);  // hours
  let m = Math.floor((seconds % 3600) / 60);  // minutes
  let s = seconds % 60;  // seconds

  // now construct the string
  var st = '';
  if (w) {
    st += w.toString() + 'w ';
  }
  if (d) {
    st += d.toString() + 'd ';
  }
  if (h) {
    st += h.toString() + 'h ';
  }
  if (m) {
    st += m.toString() + 'm ';
  }
  st += s.toFixed(2).toString() + 's ';
  
  return st; 
}

isInside = function(item, array) {
  for (var i = 0; i < array.length; i++) {
    if (item == array[i]) {
      return true;
    }
  }
  return false;
}

findClosestIndex = function(time_value, time_array) {
  if (time_value < time_array[1]) {
    return 0;
  } else if (time_value > time_array[time_array.length - 2]) {
    return time_array.length - 1;
  } else {
    for (let i = 1; i < time_array.length - 1; i++) {
      if (time_value > time_array[i] && time_value < time_array[i + 1]) {
        if (Math.abs(time_value - time_array[i]) > Math.abs(time_value - time_array[i + 1])) {
          return i + 1;
        } else {
          return i;
        }
      }
    }
    return -1;
  }
}

getDistanceString = function(meters) {
  let ly = Math.floor(meters / (299792458 * 3600 * 24 * 365));
  let Mkm = Math.floor((meters % (299792458 * 3600 * 24 * 365)) / 1000000000);
  let st = '';
  if (ly) {
    st += ly.toString() + ' Ly ';
  }
  st += Mkm.toString() + ' Million km';
  return st;
}

  // get the gravitational acceleration contribution from another orbital body
get_acceleration_contribution = function(body1, body2) {
    // this is the force of body 2 acting on body 1, and will update both vector wise
    var separation_vector = new THREE.Vector3().subVectors(body2.position, body1.position);
    var separation = separation_vector.length();
    separation_vector.normalize();  // this is the direction of the force from body2 on body 1, so point at body 2
    // console.log(separation);
    var force = separation_vector.multiplyScalar(G * body1.mass * body2.mass / (separation * separation));
    // now add the acceleration to the body accelerations accordingly
    body1.acceleration.add(force.clone().multiplyScalar(1 / body1.mass));
    body2.acceleration.sub(force.clone().multiplyScalar(1 / body2.mass));  // sub because force acts in other direction
}

getCameraOffsetDestination = function(ob, sun) {
  // will output the final camera destination based on the orbital body input, will be different for moons and planets
  if (!ob.host) {
    if (ob.name == 'sun') {
      return new THREE.Vector3(1, 1, 1).multiplyScalar(ob.radius * 0.75 / PLANET_SCALE);
    }
    var location = ob.group.position.clone();
    var dir = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(ob.group.position, sun.group.position).normalize(), 
      sun.up);
    if (ob.name == 'pluto') {
      location.add(dir.multiplyScalar(ob.radius * 100 / PLANET_SCALE));
      location.z += ob.radius * 20 / PLANET_SCALE
    } else if (ob.name == 'mercury') {
      location.add(dir.multiplyScalar(ob.radius * 20 / PLANET_SCALE));
      location.z += ob.radius * 5 / PLANET_SCALE
    } else if (ob.name == 'hermes') {
      location.add(dir.multiplyScalar(5000000 * 20 / PLANET_SCALE));
      location.z += 5000000 * 2 / PLANET_SCALE
    } else {
      location.add(dir.multiplyScalar(ob.radius * 8 / PLANET_SCALE));
      location.z += ob.radius * 2 / PLANET_SCALE
    }
  } else {
    var location = ob.group.position.clone();
    var loc2 = ob.host.group.position.clone();
    var separation_vector = new THREE.Vector3().subVectors(location, loc2);
    separation_vector.normalize();
    location.add(separation_vector.multiplyScalar(ob.radius * 12 / PLANET_SCALE));
    location.z += ob.radius * 2 / PLANET_SCALE;
  }
  return location;
}

getCameraObliqueDestination = function(ob, pos) {
  if (!ob.host) {
    var location = ob.group.position.clone();
    var dir = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(ob.group.position, sun.group.position).normalize(), 
      sun.up);
    if (ob.name == 'pluto') {
      location.add(dir.multiplyScalar(ob.radius * 100 / PLANET_SCALE));
      location.z += ob.radius * 20 / PLANET_SCALE
    } else {
      location.add(dir.multiplyScalar(ob.radius * 8 / PLANET_SCALE));
      location.z += ob.radius * 2 / PLANET_SCALE
    }
  } else {
    var location = ob.group.position.clone();
    var loc2 = ob.host.group.position.clone();
    var separation_vector = new THREE.Vector3().subVectors(location, loc2);
    separation_vector.normalize();
    location.add(separation_vector.multiplyScalar(ob.radius * 8 / PLANET_SCALE));
    location.z += ob.radius * 2 / PLANET_SCALE;
  }
  return location;

}



