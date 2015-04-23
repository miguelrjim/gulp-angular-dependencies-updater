## Install

```
$ npm install --save-dev gulp-angular-dependencies-updater
```


## Usage

```js
var gulp = require('gulp');
var depUpdater = require('gulp-angular-dependencies-updater');

gulp.task('default', function () {
  return gulp.src('src/**/*.js', {read: false})
    .pipe(depUpdater({
      db: 'db.dat'
    }))
});
```

## License

MIT © [Miguel Jimenez](https://github.com/miguelrjim)
