fis.hook("commonjs");

fis.match('*', {
    useHash: false
});

fis.match('*.less', {
    parser: fis.plugin('less'),
    rExt: '.css'
});

fis.match('::packager', {
    postpackager: fis.plugin('loader')  
});

// 目录编译规范
fis.match(/^\/page\/(.*\.(tpl|html))/i, {
    release: '/views/web/$1'
});

// 目录编译规范
fis.match(/^\/page\/(.*\.(js|css|less|gif|png|jpg))/i, {
    release: '/public/web/page/$1',
    isMod: false
});

// *.mod.js 为模块化代码
fis.match(/^\/page\/(.*\.mod\.js)/i, {
    release: '/public/web/page/$1',
    isMod: true
});

fis.match(/^\/public\/libs.*\.(less|css)'/i, {
  packTo: '/public/pkg/aio.css'
});

fis.match(/^\/public\/(.*\..*)$/i, {
    release: '/public/web/$1'
});