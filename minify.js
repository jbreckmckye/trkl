const fs = require('fs');
const UglifyJS = require('uglify-es');

const source = fs.readFileSync('trkl.js', 'utf8');

const options = {
    warnings: true,
    compress: {
        passes: 2
    },
    mangle: {
        properties: {
            regex: /^_/
        }
    },
    toplevel: false,
    ie8: false
};

const result = UglifyJS.minify(source, options);

fs.writeFileSync('trkl-min.js', result.code);