import gulp from "gulp";
import babel from "gulp-babel";
import mocha from "gulp-mocha";
import {log} from "gulp-util";
import del from "del";

const dest = "dist";
const js_src=["src/**/*.js"];
const js_test_src = ["src/**/*.test.js"];

gulp.task("build:js", function(){
  del(dest);
  return gulp.src(js_src)
    .pipe(babel().on("error", log))
    .pipe(gulp.dest(dest+"/"));
});

gulp.task("build:all",  gulp.parallel("build:js"));

gulp.task("watch:build", function(){
  return gulp.watch(js_src, gulp.series("build:all"));
});

gulp.task("test:js", function(){
  return gulp.src(js_test_src)
            .pipe(mocha({
              compilers:"js:babel-core/register"
            }).on("error", log));
});

gulp.task("watch:test", gulp.series("test:js", gulp.parallel(
  function(){
    return gulp.watch(js_test_src, gulp.series("test:js"));
  },
  function(){
    return gulp.watch(js_src, gulp.series("test:js"));
  }
)));

gulp.task("default", gulp.parallel("watch:test", "watch:build"));
