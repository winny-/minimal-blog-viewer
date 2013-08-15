var express = require('express');
var jade = require('jade');
var blogger = require('./blogger');


var app = express();
var port = process.env.PORT || 3000;
blogger.apiKey = process.env.GOOGLEAPI_BLOGGER_KEY;
app.engine('jade', jade.__express);
app.set('view engine', 'jade');


app.get('/', function (req, res) {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.render('homepage.jade');
});

app.get('/blog', function (req, res){
  res.set('Content-Type', 'text/html; charset=utf-8');

  var id = req.query.id;
  var range = req.query.range;

  if (typeof range === 'undefined' || range == '1-1') {
    blogger.getBlogInfo(id, function (blog) {
      blogger.getLastPost(blog.id, function (post) {
        res.render('last.jade', {blog:blog, post:post});
      });
    });
  } else {
    // blogger.getBlogInfo(id, function (blog) {
    //   for (var i = 
  }
});


console.log('Listening on port: '+port+'.');
app.listen(port);
