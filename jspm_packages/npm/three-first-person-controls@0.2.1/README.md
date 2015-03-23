three-first-person-controls
===========================

Three.js first person controls, adapted from https://github.com/mrdoob/three.js/blob/master/examples/js/controls/FirstPersonControls.js



## usage

```npm install three-first-person-controls```

```js

var THREE = require('three.js');

// Add the plugin
require('three-first-person-controls')(THREE);


// build your THREE.js scene


THREE.FirstPersonControls(cameraObject, domElement);