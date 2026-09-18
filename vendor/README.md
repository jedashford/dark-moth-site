# Viewer dependencies

Three.js r128, OrbitControls and GLTFLoader are vendored from this project's existing `v3-button/site/vendor` runtime so the local viewer has no external script/CDN dependency. The add-on files are minified with esbuild; their behaviour is unchanged. [Three.js MIT license](LICENSE-three.txt).

Original source: [Three.js](https://github.com/mrdoob/three.js/tree/r128).

TrackballControls is vendored from the [official Three.js r128 source](https://github.com/mrdoob/three.js/blob/r128/examples/js/controls/TrackballControls.js), minified without behavior changes using esbuild. The perfboard workbench uses its quaternion rotation to allow full vertical and horizontal turns; the orthogonal board presets deliberately lock rotation. The same Three.js MIT license applies.
