const fs = require('fs');
const gzipSize = require('gzip-size');
const UglifyJS = require('uglify-es');

const source = fs.readFileSync('trkl.js', 'utf8');

const options = {
    warnings: true,
    compress: {
        passes: 5
    },
    mangle: {
        properties: {
            regex: /^_|read|write|setStale|setReady|validate|foundCircular|onError/
        }
    },
    toplevel: true,
    ie8: false
};

const result = UglifyJS.minify(source, options);

fs.writeFileSync('trkl-min.js', result.code);

const initSize = source.length;
const minSize = result.code.length;
const zipSize = gzipSize.sync(result.code);
console.log(`File size: compressed from ${initSize} characters to ${minSize} characters. Predicted GZIP size is ${zipSize}`);
