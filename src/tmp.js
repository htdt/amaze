
var container, stats;
var camera, controls, scene, renderer;
var cube, plane;

function createSomething(klass, args) {
    var F = function(klass, args) {
        return klass.apply(this, args);
    }
    F.prototype = klass.prototype;
    return new F(klass, args);
}
var materials = [];
for (var i = 0; i < 6; i++) {
    materials.push([new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        wireframe: false
    })]);
}
var geometriesParams = [{
    type: 'RabbitGeometry',
    args: [],
    meshScale: 200
}, {
    type: 'BoxGeometry',
    args: [200, 200, 200, 10, 10, 10, materials]
}, {
    type: 'SphereGeometry',
    args: [100, 10, 10],
    meshScale: 2
}, {
    type: 'TorusGeometry',
    args: [100, 60, 4, 8, Math.PI * 2]
}, {
    type: 'TorusKnotGeometry',
    args: [],
    scale: 0.25,
    meshScale: 4
}, {
    type: 'PlaneGeometry',
    args: [200, 200, 4, 4]
}];
var loader = new THREE.JSONLoader();
loader.load('WaltHeadLo.js', function(geometry) {
    geometriesParams.push({
        type: 'WaltHead',
        args: [],
        meshScale: 6
    });
    THREE.WaltHead = function() {
        return geometry.clone();
    };
    updateInfo()
});
var loader2 = new THREE.JSONLoader();
loader2.load('Suzanne.js', function(geometry) {
    geometriesParams.push({
        type: 'Suzanne',
        args: [],
        scale: 100,
        meshScale: 2
    });
    THREE.Suzanne = function() {
        return geometry.clone();
    };
    updateInfo()
});
var info;
var subdivisions = 0;
var geometryIndex = 0;
raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var sortedGeometry;
document.addEventListener('mousemove', onDocumentMouseMove, false);
init();
animate();

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function nextSubdivision(x) {
    subdivisions = Math.max(0, subdivisions + x);
    addStuff();
}

function nextGeometry() {
    geometryIndex++;
    if (geometryIndex > geometriesParams.length - 1) {
        geometryIndex = 0;
    }
    addStuff();
}

function switchGeometry(i) {
    geometryIndex = i;
    addStuff();
}

function updateInfo() {
    var params = geometriesParams[geometryIndex];
    var dropdown = '<select id="dropdown" onchange="switchGeometry(this.value)">';
    for (i = 0; i < geometriesParams.length; i++) {
        dropdown += '<option value="' + i + '"';
        dropdown += (geometryIndex == i) ? ' selected' : '';
        dropdown += '>' + geometriesParams[i].type + '</option>';
    }
    dropdown += '</select>';
    info.innerHTML = 'THREE.' + params.type + '' + '<br>Geometry: ' + dropdown + ' <a href="#" onclick="nextGeometry();return false;">next</a>' + '<br>Subdivisions: ' + subdivisions + ' <a href="#" onclick="nextSubdivision(1); return false;">more</a>/<a href="#" onclick="nextSubdivision(-1); return false;">less</a>' + '<br><br>Vertices count: ' + geometry.vertices.length + ' -> ' + smooth.vertices.length + ' -> ' + simplifiedVertices + '<br>Face count: ' + geometry.faces.length + ' -> ' + smooth.faces.length + ' -> ' + simplifiedFaces + '<br>Drag slider to adjust Polygon Reduction';
}

function addStuff() {
    if (cube) {
        scene.remove(group);
        scene.remove(cube);
    }
    var modifier = new THREE.SubdivisionModifier(subdivisions);
    var params = geometriesParams[geometryIndex];
    geometry = createSomething(THREE[params.type], params.args);
    if (params.scale) {
        geometry.applyMatrix(new THREE.Matrix4().makeScale(params.scale, params.scale, params.scale));
    }
    smooth = geometry.clone();
    smooth.mergeVertices();
    modifier.modify(smooth);
    var simplify = new THREE.SimplifyModifier(400);
    sortedGeometry = simplify.modify(smooth);
    range.value = 1;
    changeLOD(1);
    updateInfo();
    var faceABCD = "abcd";
    var color, f, p, n, vertexIndex;
    group = new THREE.Group();
    scene.add(group);
    var meshmaterials = [new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading
    }), new THREE.MeshBasicMaterial({
        color: 0x405040,
        wireframe: true,
        opacity: 0.8,
        transparent: true
    })];
    cube = THREE.SceneUtils.createMultiMaterialObject(smooth, meshmaterials);
    var meshScale = params.meshScale ? params.meshScale : 1;
    cube.scale.x = meshScale;
    cube.scale.y = meshScale;
    cube.scale.z = meshScale;
    scene.add(cube);
    group.scale.copy(cube.scale);
}

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Drag to spin the geometry ';
    container.appendChild(info);
    range = document.createElement('input');
    range.style.position = 'absolute';
    range.style.textAlign = 'center';
    range.style.width = '50%';
    range.style.left = '25%'
    range.type = "range"
    range.min = "0"
    range.max = "1"
    range.step = "0.0001"
    range.style.bottom = '50px';
    container.appendChild(range);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 500;
    scene = new THREE.Scene();
    var light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(1000, 1000, 2000);
    scene.add(light);
    var light = new THREE.PointLight(0xffffff, 0.5);
    light.position.set(-2000, 1000, -2000);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x777777));
    addStuff();
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0xf0f0f0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    initLOD();
}
var simplifiedVertices;
var simplifiedFaces;

function changeLOD(k) {
    var map = sortedGeometry.map;
    var permutations = sortedGeometry.sortedGeometry;
    var sortedVertices = sortedGeometry.vertices;
    var t = sortedVertices.length - 1;
    t = t * k | 0;
    var numFaces = 0;
    var face;
    var geometry = smooth;
    for (i = 0; i < geometry.faces.length; i++) {
        face = geometry.faces[i];
        var oldFace = sortedGeometry.faces[i];
        face.a = oldFace.a;
        face.b = oldFace.b;
        face.c = oldFace.c;
        while (face.a > t) face.a = map[face.a];
        while (face.b > t) face.b = map[face.b];
        while (face.c > t) face.c = map[face.c];
        if (face.a !== face.b && face.b !== face.c && face.c !== face.a) numFaces++;
    }
    simplifiedFaces = numFaces;
    simplifiedVertices = t;
    geometry.computeFaceNormals();
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    updateInfo();
}

function initLOD() {
    function change(a) {
        changeLOD(range.value);
    };
    range.addEventListener('mousedown', function() {
        document.addEventListener('mousemove', change);
    });
    range.addEventListener('mouseup', function() {
        document.removeEventListener('mousemove', change);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}