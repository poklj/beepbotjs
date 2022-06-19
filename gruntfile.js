
let grunt = require('grunt');
const credentialsPtr = require ('./credentials-ptr.js');
const credentialsLocal = require ('./localCredentials.js');
const credentials = require ('./credentials.js');
var http = require('https');

function printRemoveEndpointRatelimiting(){
    console.log('To remove ratelimit for 2 hours go to: ')
    console.log('https://screeps.com/a/#!/account/auth-tokens/noratelimit?token=' + credentials.token);
    console.log('attempting to pull token properties')

    http.get('https://screeps.com/api/auth/query-token?token=' + credentials.token, function(res){
        console.log('response: ' + res.statusCode);
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
      
        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          // Consume response data to free up memory
          res.resume();
          return;
        }
      
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
      
    }






// grunt = global grunt object
let ReplaceImports = function (abspath, rootdir, subdir, filename) {
    if (abspath.match(/.js$/) == null) {
        return;
    }
    let file = grunt.file.read(abspath);
    let updatedFile = '';

    let lines = file.split('\n');
    for (let line of lines) {
        // Compiler: IgnoreLine
        if ((line).match(/[.]*\/\/ Compiler: IgnoreLine[.]*/)) {
            continue;
        }
        let reqStr = line.match(/(?:require\(")([^_a-zA-Z0-9]*)([^"]*)/);
        if (reqStr && reqStr != "") {
            let reqPath = subdir ? subdir.split('/') : []; // relative path
            let upPaths = line.match(/\.\.\//gi);
            if (upPaths) {
                for (let i in upPaths) {
                    reqPath.splice(reqPath.length - 1);
                }
            } else {
                let isRelative = line.match(/\.\//gi);
                if (!isRelative || isRelative == "") {
                    // absolute path
                    reqPath = [];
                }
            }

            let rePathed = "";
            if (reqPath && reqPath.length > 0) {
                while (reqPath.length > 0) {

                    rePathed += reqPath.shift() + "_";
                }
            }
            line = line.replace(/require\("([\.\/]*)([^"]*)/, "require\(\"" + rePathed + "$2").replace(/\//gi, '_');
        }

        updatedFile += (line + '\n');
    }

    grunt.file.write((rootdir + '/' + (subdir ? subdir + '/' : '') + filename), updatedFile);
};



module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        screeps: {
            options: {
                token: credentials.token,
                branch: credentials.branch,
                //server: 'season'
            },
            dist: {
                src: ['dist/*.js']
            }
        },


        // Remove all files from the dist folder.
        clean: {
          'dist': ['dist']
        },
        // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
        copy: {
          // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
          screeps: {
            files: [{
              expand: true,
              cwd: 'src/',
              src: '**',
              dest: 'dist/',
              filter: 'isFile',
              rename: function (dest, src) {
                // Change the path name utilize underscores for folders
                return dest + src.replace(/\//g,'_');
              }
            }],
          }
        },
    });
    grunt.registerTask('replace', 'Replaces file paths with _', function () {
        grunt.file.recurse('./dist/', ReplaceImports);
    });
    grunt.registerTask('check_token', printRemoveEndpointRatelimiting);
    grunt.registerTask('screeps-live', ['clean', 'copy:screeps', 'replace', 'check_token', 'screeps']);
    
    
};