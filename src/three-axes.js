

class ThreeAxes {
  constructor(node, camera) {
    this.node = node;
    this.nodeWidth = parseInt(getNodeComputedProperty(node, 'width'));
    this.nodeHeight = parseInt(getNodeComputedProperty(node, 'height'));
    this.parentCamera = camera;
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.camera = this.createCamera();
    this.light = this.createLight();
    this.drawAxes();
  }

  createRenderer() {
    //NOW AXIS RENDERER, SCENE, AND CAMERA
    //create axis guide renderer, put it somewhere nice
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(this.nodeWidth / SCENE_DEFAULTS.axes_shrink_factor, this.nodeHeight / SCENE_DEFAULTS.axes_shrink_factor);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.bottom = '20px';
    renderer.domElement.style.left = '20px';
    this.node.appendChild(renderer.domElement);
    return renderer;
  }

  createScene() {
    return new THREE.Scene();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(50, this.nodeWidth / this.nodeHeight, 0.1, 10000);
    camera.up = this.parentCamera.up;
    this.scene.add(camera);
    return camera;
  }

  createLight() {
    const light = new THREE.AmbientLight(0xfafafa, 0.8);
    this.scene.add(light);
    return light;
  }

  drawAxes() {
    const loader = new THREE.FontLoader(); //for text annotaitons on axes
    const l = 10;
    const origin = new THREE.Vector3(0, -l / 3, 0);
    const hl = l / 4;
    const hw = l / 5;
    const xarr = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, l, 0xFF0000, hl, hw);
    const yarr = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, l, 0x00FF00, hl, hw);
    const zarr = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, l, 0x0000FF, hl, hw);

    this.scene.add(xarr);
    this.scene.add(yarr);
    this.scene.add(zarr);

    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var mesh = new THREE.Mesh( geometry, material );
    // this.scene.add(mesh);

    //load in text labels ,that float around, try to combine the meshes later, could be more convenient
    //x label
    loader.load('/library/helvetiker_bold.typeface.json',
      (font) => {
        var geometry = new THREE.TextGeometry('X', {
          font: font,
          size: 2,
          height: 0.3,
          bevelEnabled: false
        });
        var mat = new THREE.MeshPhysicalMaterial({color: 0xFF0000});
        var m = new THREE.Mesh(geometry, mat);
        m.position.addVectors(origin, new THREE.Vector3(l + hl - l / 3, 0, 1));
        m.rotateX(-Math.PI / 2);
        this.scene.add(m);
      }); //end load function

    //y label
    loader.load('/library/helvetiker_bold.typeface.json',
      (font) => {
        var geometry = new THREE.TextGeometry('Y', {
          font: font,
          size: 2,
          height: 0.3,
          bevelEnabled: false
        });
        var mat = new THREE.MeshPhysicalMaterial({color: 0x00FF00});
        var m = new THREE.Mesh(geometry, mat);
        m.position.addVectors(origin, new THREE.Vector3(0, l + hl - l / 3, -1));
        m.rotateX(Math.PI / 2);
        m.rotateY(Math.PI / 2);
        this.scene.add(m);
      }); //end load function

    //z label
    loader.load('/library/helvetiker_bold.typeface.json',
      (font) => {
        var geometry = new THREE.TextGeometry('Z', {
          font: font,
          size: 2,
          height: 0.3,
          bevelEnabled: false
        });
        var mat = new THREE.MeshPhysicalMaterial({color: 0x0000FF});
        var m = new THREE.Mesh(geometry, mat);
        m.position.addVectors(origin, new THREE.Vector3(0, 0, l + hl - 1));
        m.rotateX(-Math.PI / 2);
        m.rotateY(Math.PI / 4);
        this.scene.add(m);
      }); //end load function
  }
}
