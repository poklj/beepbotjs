var gulp = require('gulp');
var screeps = require('gulp-screeps');
var credentials = require('./credentials.js');
var localCredentials = require('./localCredentials.js');
var flatten = require('gulp-flatten');
var flattenRequires = require('gulp-flatten-requires');

var http = require('https');
const credentialsPtr = require('./credentials-ptr.js');

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

gulp.task('flatten', function() {
    return gulp.src('./src/**/*.js')
        .pipe(flatten())
        .pipe(flattenRequires())
        .pipe(gulp.dest('./dist'));
});


gulp.task('screeps-live', function() {
    printRemoveEndpointRatelimiting();
 return gulp.src('dist/*.js')
    .pipe(screeps(credentials));
});

gulp.task('screeps-local', function() {
 return gulp.src('dist/*.js')
    .pipe(gulp.dest(localCredentials.localUsrStorageLocation));
});
gulp.task('screeps-ptr', function() {
  printRemoveEndpointRatelimiting();
  return gulp.src('dist/*.js')
      .pipe(screeps(credentialsPtr));
})