/**
 * Resize and compress images in the browser
 * usage:
    let r = new Resizer(500, 75); // max file width and height is 500px, max JPEG compresion ratio is 75

    // file is an instance of the File class specified by the File API (https://w3c.github.io/FileAPI/)
    // which is usually generated using the <input type="file"> element
    r.processFile(file).then((dataUrl) => {
        // do whatever you like with the dataUrl (save it to the user, post it to the server, display it in <img>...)
    });
 */
class Resizer {
    /**
     * Initialize the resizer
     * @param maxSize maximum dimension of the image - the returned image must have both size equal or smaller than this value
     * @param compression - target level of JPEG compression
     */
    constructor(maxSize, compression) {
        this.maxSize = maxSize;
        this.compression = compression;
    }

    /**
     * Scale and compress the provided image
     * @param img an instance of Image that will be processed
     * @return {Promise} promise, whose resolution is a data URL of the processed image
     */
    scaleAndCompress(img) {
        return new Promise((resolve, reject) => {

            // canvas for the final result
            let final = document.createElement('canvas'); //
            let finalContext = final.getContext('2d');

            // resize the image only if it exceeds the maximum size
            if (img.width > this.maxSize || img.height > this.maxSize) {

                // compute the new dimensions
                let cWidth, cHeight;
                if (img.width > img.height) {
                    cWidth = this.maxSize;
                    cHeight = Math.round((img.height * this.maxSize) / img.width);
                } else {
                    cWidth = Math.round((img.width * this.maxSize) / img.height);
                    cHeight = this.maxSize;
                }

                // scale down by the powers of two to get smoother image
                // looking for the biggest n, that canvas.width * 2^n <= img.width
                let n = Math.floor(Math.log2(img.width / cWidth));
                let n_pow = Math.pow(2, n);

                // the scaledown routine: img.width -> cSize * 2^n -> cSize * 2^(n-1) -> ... -> cSize
                // (cSize being cWidth and cHeight)
                let w = cWidth * n_pow;
                let h = cHeight * n_pow;

                // processing canvas used in the scaledown routine
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('2d');

                // set the canvas dimensions
                canvas.width = w;
                canvas.height = h;

                // render the original image and downscale it a little bit to match the cSize * 2^n formula
                context.drawImage(img, 0, 0, w, h);

                // run the scaledown routine n times
                for (let i = 0; i < n; ++i) {
                    context.drawImage(canvas, 0, 0, w / 2, h / 2);
                }

                // now we have a canvas that has an image with width of cWidth and height of cHeight
                // in the left top corner of the canvas

                // copy the image to the final canvas

                // set the final canvas dimensions
                final.width = cWidth;
                final.height = cHeight;

                // render the left top corner of 'canvas' onto 'final'
                finalContext.drawImage(canvas, 0, 0, cWidth, cHeight, 0, 0, cWidth, cHeight);
                canvas = null; // clear the memory immediately instead of waiting for the garbage collector
            } else {
                // image does not need resizing => copy it straight to the canvas of the size of the original image

                final.width = img.width;
                final.height = img.height;

                finalContext.drawImage(img, 0, 0, img.width, img.height);
            }

            // generate and return the dataURL using the specified JPEG compression rate
            resolve(final.toDataURL('image/jpeg', this.compression / 100));
        });
    }

    /**
     * Return the optimized image.
     * @param file instance of a File (specified by the browser File API)
     * @return {Promise} promise, whose resolution is the smallest possible data URL
     */
    processFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.match('image.*')) {
                reject('The file is not an image.')
            }

            // initialize the file reader
            let reader = new FileReader();

            // listen on the reader load
            reader.addEventListener('load', (e) => {
                // initialize new image
                let img = new Image();

                // listen on the image load
                img.addEventListener('load', () => {
                    resolve(
                        // scale and compress the image
                        this.scaleAndCompress(img).then((generatedURL) => {
                            // compare the result of the scaleAndCompress function
                            // with the original data uri and return the smaller one

                            // this is important because user may submit a file with stronger compression
                            // ratio, so recompressing it would just make the file bigger without any reason

                            if(generatedURL.length < e.target.result.length) {
                                return generatedURL;
                            } else {
                                return e.target.result;
                            }
                        })
                    )
                });

                // Load the target data URI into an image object
                // (after this is finished, the event listener on 'load' of the img object will be triggered)
                img.src = e.target.result;
            });

            // Read in the image file as a data URL
            // (after the image is finished loading, the event listener on 'load' of the reader object will be triggered)
            reader.readAsDataURL(file);
        });
    }
}