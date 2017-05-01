/**
 * @description: This defines the task to minify the js files
 * @note:  CSS files are not minified as the css files may be referring images relative to the source directory.
 */

var path= require("path");

var fs      = require("fs-extra");

module.exports = function(grunt) {

    var CFG     = require("./cfg/grunt.json"),
        DST_DIR = "client/dist/js/";

    fs.mkdirpSync(DST_DIR);

    var config= {
        pkg: grunt.file.readJSON('package.json'),
        dest_dir:DST_DIR,
        concat: {
            options: {
                separator: ';\n',
                nonull: true    //to warn for missing files
            }
        },
        ngAnnotate: {
            
        },
        uglify:{
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */' //-  +
                    //'<%= grunt.template.today("yyyy-mm-dd") %> */'
            }
        },
        watch: {
            scripts: {
                files: [],
                tasks: [],
                options: {
                    spawn: false
                }
            }
        }
    };
    
    var dev_tasks       = [],
        release_tasks   = [],
        watch_files     = [];

    CFG.apps.forEach(function(app){
        var name        = app.id,
            rel_files   = app.sources,
            files       = [];
        for (var i=0; i< rel_files.length; i++) {
            files.push(path.join((app.src_dir), app.cwd, rel_files[i]));
        }
        if (name == "core"){
            console.log(files);
        }
        watch_files= watch_files.concat(files);
        config.concat[name]= {
            src: files,
            dest: DST_DIR+'/'+name+'.js'
        };
        dev_tasks.push("concat:"+name);
        release_tasks.push("concat:"+name);

        config.ngAnnotate[name]= {
            src     : DST_DIR+'/'+name+'.js',
            dest    : DST_DIR+"/"+name+".annotated.js"
        };
        release_tasks.push("ngAnnotate:"+name);

        config.uglify[name]= {
            files: {}
        };
        config.uglify[name].files[DST_DIR+"/"+name+".min.js"]= [DST_DIR+"/"+name+".annotated.js"];
        release_tasks.push("uglify:"+ name);
    });
    
    config.watch.scripts.files= watch_files;
    config.watch.scripts.tasks= dev_tasks;
    
    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ng-annotate');

    grunt.registerTask('default', dev_tasks);
    grunt.registerTask('release', release_tasks);
};
