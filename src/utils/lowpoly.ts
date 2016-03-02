import './lib/SimplifyModifier';

var out = document.createElement("div");
document.body.appendChild(out);

var loader = new THREE.JSONLoader(true);
loader.load( 'media/LeePerrySmith.js', (geometry) => {

  geometry.mergeVertices();
  var simplify = new THREE.SimplifyModifier(400);
  var sortedGeometry = simplify.modify(geometry);
  var lp = lowpoly(sortedGeometry, 1000);
  cleanup(lp);

  out.innerHTML = tojson(lp);
  out.innerHTML += "<br><br>";
  out.innerText += reduceMap(sortedGeometry.map, 1001).join(",");
});

function faceHasClone(g, k): boolean{
  let f2 = g.faces[k];
  for (let i = 0; i < g.faces.length; i++)
  if (i!=k)
  {
    let f1 = g.faces[i];
    if (f1.a == f2.a && f1.b == f2.b && f1.c == f2.c) return true;
  }
  return false;
}

function faceIsNull(face){
  return face.a == face.b || face.b == face.c || face.c == face.a;
}


function vertexUsed(g, k): boolean{
  for (let i = 0; i < g.faces.length; i++)
  {
    let f1 = g.faces[i];
    if (f1.a == k || f1.b == k || f1.c == k) return true;
  }
  return false;
}

function vertexHasClone(g, k): boolean{
  let v = g.vertices[k];
  for (let i = 0; i < g.vertices.length; i++)
  if (i!=k)
  {
    let v1 = g.vertices[i];
    if (v1.equals(v)) return true;
  }
  return false;
}

function cleanup(g){
  for (let i = g.faces.length - 1; i >= 0 ; i--)
    if (faceHasClone(g,i) || faceIsNull(g.faces[i]))
      g.faces.splice(i,1);

  for (let i = g.vertices.length - 1; i >= 0 ; i--)
     if (!vertexUsed(g,i) || vertexHasClone(g,i))
       g.vertices.splice(i,1);

   g.computeFaceNormals();
   g.computeVertexNormals();
}

function lowpoly(sortedGeometry, t): void{
  var map = sortedGeometry.map;
  var sortedVertices = sortedGeometry.vertices;
  //var t = (sortedVertices.length - 1) * d;
  var face;
  var geometry = sortedGeometry.clone();

  for (var i = 0; i < geometry.faces.length; i++) {
      face = geometry.faces[i];
      var oldFace = sortedGeometry.faces[i];
      face.a = oldFace.a;
      face.b = oldFace.b;
      face.c = oldFace.c;
      while (face.a > t) face.a = map[face.a];
      while (face.b > t) face.b = map[face.b];
      while (face.c > t) face.c = map[face.c];
  }

  return geometry;
}

function reduceMap(map, t){
  for (var i = 0; i < map.length; i++)
    while (map[i] > t) map[i] = map[map[i]];
  return map.slice(0,t);
}

function tojson(geometry) {
    var i,
        json = {
            metadata: { 
                formatVersion: 3
            },
            scale: 1.000000,
            materials: [],
            vertices: [],
            morphTargets: [],
            morphColors: [],
            normals: [],
            colors: [],
            uvs: [[]],                  
            faces: []
        };

    for (i = 0; i < geometry.vertices.length; i++) {
        json.vertices.push(geometry.vertices[i].x);
        json.vertices.push(geometry.vertices[i].y);
        json.vertices.push(geometry.vertices[i].z);
    }

    for (i = 0; i < geometry.faces.length; i++) {
        if (geometry.faces[i].d) {
            json.faces.push(1);
        } else {
            json.faces.push(0);                 
        }

        json.faces.push(geometry.faces[i].a);
        json.faces.push(geometry.faces[i].b);
        json.faces.push(geometry.faces[i].c);

        if (geometry.faces[i].d) {
            json.faces.push(geometry.faces[i].d);
        }

        json.normals.push(geometry.faces[i].normal.x);
        json.normals.push(geometry.faces[i].normal.y);
        json.normals.push(geometry.faces[i].normal.z);
    }

    return JSON.stringify(json, null,'');
}