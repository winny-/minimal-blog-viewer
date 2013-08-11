var express = require('express');
var jade = require('jade');
var googleapis = require('googleapis');

var settings = require(__dirname + '/settings.json');

var app = express();
var port = process.env.PORT || 3000;
var bloggerApiKey = settings.bloggerApiKey;
app.engine('jade', jade.__express);
app.set('view engine', 'jade');


function getBlogId(url, callback){
  if (url.slice(0,7) != 'http://' && url.slice(0,8) != 'https://') {
    url = 'http://'+url;
  }
  if (url.slice(-1) != '/') {
    url += '/';
  }
  console.log('Querying for Blog Id for URL: '+url);
  googleapis.discover('blogger', 'v3').execute(function (err, client){
    var parameters = {
      url: url,
      key: bloggerApiKey
    }
    var req1 = client.blogger.blogs.getByUrl(parameters);
    req1.execute(function (err, response){
      var id = false;
      if (!err) {
        id = response.id;
      }
      callback(id);
    });
  });
}

function getBlog(id, callback){
  googleapis.discover('blogger', 'v3').execute(function (err, client){
    var req1 = client.blogger.blogs.get({
      blogId: id,
      key: bloggerApiKey
    });
    req1.execute(function (err, response1){
      var parameters2 = {
        blogId: id,
        maxResults: 1,
        key: bloggerApiKey
      }
      var req2 = client.blogger.posts.list(parameters2);
      req2.execute(function (err, response2){
        callback(response1, response2);
      });
    });
  });
}


app.get('/', function (req, res){
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.render('homepage.jade');
});

app.get('/blog', function (req, res){
  res.set('Content-Type', 'text/html; charset=utf-8');

  var url = req.query.url;
  var id = req.query.id;
  if (typeof url !== 'undefined') {
    getBlogId(url, function (id){
      getBlog(id, function(blog, posts){
        res.render('blog.jade', {blog:blog, posts:posts});
      });
    });
  } else if (!isNaN(id)) {
    getBlog(id, function(blog, posts){
      res.render('blog.jade', {blog:blog, posts:posts});
    });
  } else {
    res.render('invalid.jade', {inputs:{url:url, id:id}});
  }
});


console.log('Listening on port: '+port+'.');
app.listen(port);
