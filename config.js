System.config({
  "baseURL": "/",
  "paths": {
    "*": "*.js",
    "npm:*": "jspm_packages/npm/*.js",
    "github:*": "jspm_packages/github/*.js"
  },
  "traceurOptions": {
    "annotations": true,
    "memberVariables": true,
    "typeAssertions": true,
    "typeAssertionModule": "rtts_assert/rtts_assert",
    "types": true
  }
});

System.config({
  "map": {
    "three-first-person-controls": "npm:three-first-person-controls@0.2.1",
    "three-orbit-controls": "npm:three-orbit-controls@69.0.4",
    "three.js": "github:mrdoob/three.js@master"
  }
});

