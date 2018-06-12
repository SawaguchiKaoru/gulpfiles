// Plugins   ---------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
'use strict';
const
    fs           = require('fs'),
    gulp          = require('gulp'),
    concat        = require('gulp-concat'),       // ファイルを結合
    uglify        = require('gulp-uglify'),       // ファイルを圧縮
    autoprefixer  = require('gulp-autoprefixer'), //ベンダープリフィクス
    sass          = require('gulp-sass'),         // sass
    plumber       = require('gulp-plumber'),      // エラーによる他の実行停止防止
    notify        = require('gulp-notify'),       // エラー通知(デスクトップ)
    imagemin      = require('gulp-imagemin'),     // 画像圧縮
    requireDir = require("require-dir"),        // ディレクトリ以下のJSファイルをまとめて読み込みます。
    ejs           = require('gulp-ejs'),          // EJS
    rename        = require('gulp-rename'),       // ファイルリネーム
    connect       = require('gulp-connect'),      // ローカルサーバ
    sync          = require('browser-sync').create();// ブラウザシンク
    watch         = require("gulp-watch");        // 監視


// タスクの登録　default = 無名タスク
// gulp.task('default', function(){
//   console.log('Hello World');
// });


// Directory ---------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

var root = {// ルートディレクトリ
  src:    'src/',
  dist:   'dist/'
}

var src = { // 出力元ディレクトリ変数定義
  css:    root.src+'css/',
  sass:   root.src+'sass/',
  js:     root.src+'js/',
  img:    root.src+'img/',
  // lib:    'src/lib/',
  ejs:    root.src+'ejs/'
}


var dist = { // 出力先ディレクトリ変数定義
  css:    root.dist+'css/',
  js:     root.dist+'js/',
  img:    root.dist+'img/',
  // lib:    'dist/lib/'
}

// Task --------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

// Javascript minfy
gulp.task('js', function(){          // タスクの定義 = jsという名前でタスクの登録
  return gulp.src(src.js + '*.js')         // 処理の対象となるソース指定
  .pipe(concat('app.js'))            // concatの適応　ファイルの結合とアウトプット先
  .pipe(uglify())                    // uglifyの適応
  .pipe(gulp.dest(dist.js))           // ソースの配置(アウトプット先のフォルダ定義)
});


// gulp.task('compile-css', function () {
//   return gulp.src([src.sass + '*.css']) //対象CSS指定
//       .pipe(autoprefixer({
//           browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4'], // サポートブラウザ指定
//           cascade: false
//       }))
//       .pipe(gulp.dest(dist.css)); // 出力先
// });

// Sass コンパイル
gulp.task('sass', function(){    // SassとCssの保存先を指定
  "use strict";
  gulp.src(src.sass + '**/*.scss') // 出力元指定
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    })) // plumber x notify
    .pipe(sass({outputStyle: 'expanded'})) // 出力形式
    .pipe(gulp.dest(dist.css)) // 出力先指定
});

// SASSの監視
gulp.task('sass-watch', ['sass'], function(){ //自動監視のタスクを作成(sass-watchと名付ける)
  var watcher = gulp.watch(src.sass + '**/*.scss', ['sass']); // 対象ファイル指定
  watcher.on('change', function(event) {
  });
});

// 画像圧縮
gulp.task( 'imagemin', function(){ //タスク名の定義 画像をMinify
  var origin = src.img + '**/*.+(jpg|jpeg|png|gif|svg)', // 出力元
      imageminOptions = { optimizationLevel: 7 }; // 出力レベル

  gulp.src( origin )
    .pipe(imagemin( imageminOptions ))
    .pipe(gulp.dest(dist.img));
});

// HTMLテンプレート
gulp.task('ejs', function() {
  var
    jsonFile = root.src+'/data.json', // jsonファイル指定
    tempFile = [src.ejs+"**/*.ejs",'!' + src.ejs+"/**/_*.ejs"], //参照するディレクトリ、出力を除外するファイル
    json = JSON.parse(fs.readFileSync(jsonFile, 'utf8')),// jsonファイルの読み込み
    pages = json.pages; // jsonファイルにあるpages読み込み
    gulp.src(tempFile)
      .pipe(ejs({
          jsonData: pages
          // data.jsonの中にある情報の取得
          // jsonファイルの記述内容のpagesの取得をし、jsonDataに格納する
      }))
      // .pipe(rename(id + '.html')) // htmlへ変換
      .pipe(rename({// phpへリネームする
        extname: '.html'
      }))
      .pipe(gulp.dest(root.dist+''));
});

// ローカルサーバー
gulp.task('connect', function(){
  connect.server({
    root: root.dist,
    livereload: true
  });
});

// ブラウザシンク
const bsOption = { server: './dist'}
gulp.task('server',(done) => {
  sync.init(bsOption) // サーバーディレクトリ
  done()
  startPath: './page1/index.html'
  open: 'external'
  // notify: false
});

gulp.task('watch', (done) => {
  const browserReload = (done) => {
    sync.reload()
    done()
  }
  gulp.watch(dist+'**/*', browserReload)
});

/** ファイルの更新をチェックして JS のビルド処理を呼び出す */
// gulp.task("watch", function() {
//   gulp.watch([src.sass+'*.sass'], ['sass']);
//   gulp.watch([src.js+'*.js'], ['js']);
//   gulp.watch([src+'*.ejs'], ['ejs']);
// });

// Build -------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
gulp.task('default', [
  'ejs',
  'js',
  'sass',
  'connect',
  'sass-watch',
  'server',
  'watch'
], function (){
});// デフォルトタスク設定
