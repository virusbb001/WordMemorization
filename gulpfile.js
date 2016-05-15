var gulp=require('gulp'),
    mainBowerFiles=require('main-bower-files');

gulp.task("bower-files",function(){
 return gulp.src(mainBowerFiles()).pipe(gulp.dest("lib"));
});
