'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var nedb = require('nedb');
var vinyl_fs = require('vinyl-fs');

module.exports = function (options) {
	if (!options.db) {
		throw new gutil.PluginError('gulp-angular-dependencies-updater', '`db` required');
	}

	// Load specified database
	var db = new nedb({
		filename: options.db,
		autoload: true
	});

  var filesToAdd = [];
  var dependenciesAdded = {};

	return through.obj(function (file, enc, cb) {
    this.push(file.path);

    var dependencies = []

    db.find({
      path: file.path.substr(process.cwd().length+1)
    }, function(err, docs) {
      docs.forEach(function(doc) {
        if(!dependenciesAdded[doc.name] && doc.dependents && doc.dependents.length > 0)
          dependencies = dependencies.concat(doc.dependents);
        dependenciesAdded[doc.name] = true;
      });
      addDependencies(function() {
        cb();
      })
    });

    function addDependencies(fn) {
      if(dependencies.length == 0) {
        return fn();
      }
      db.find({
        name: {
          $in: dependencies
        }
      }, function(err, docs) {
        dependencies = [];
        docs.forEach(function(doc) {
          if(!dependenciesAdded[doc.name] && doc.dependents && doc.dependents.length > 0)
            dependencies = dependencies.concat(doc.dependents);
          dependenciesAdded[doc.name] = true;
          filesToAdd.push(doc.path);
        });
        addDependencies(fn);
      })
    }
	}, function(cb) {
    var that=this;
    vinyl_fs.src(filesToAdd, {
      read: false
    })
      .pipe(through.obj(function(file, enc, cb) {
        that.push(file);
      }, function(icb) {
        icb();
        cb();
      }))
  });
};
