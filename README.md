# Optimizer
Resize and compress images directly in the browser.
Client side image optimization can be useful to save upload time (and server resources).

The script is written in **ES6** using features of the [File API](https://w3c.github.io/FileAPI/) and [HTML5 Canvas](https://www.w3.org/TR/html5/semantics-scripting.html#the-canvas-element).
For backwards compatibility the code could be transpiled into ES2015 using
Babel or some other JavaScript preprocessor.

No external libraries are needed.
 
## Usage
```javascript
let opt = new Optimizer(500, 75); // max file width and height is 500px, max JPEG compresion ratio is 75

// file is an instance of the File class specified by the File API (https://w3c.github.io/FileAPI/)
// which is usually generated using the <input type="file"> element
opt.processFile(file).then((dataUrl) => {
    // do whatever you like with the dataUrl (save it to the user, post it to the server, display it in <img>...)
});
```

The Optimizer produces JPEG images of given maximum size and compression ratio. On the input there can be any image format supported by the browser.

If the input file is smaller than the generated file, the original file is returned (which means that PNGs and other formats might show up as the output as well).

**Check out the [live demo](https://optimize.janjaromirhorak.cz/).**