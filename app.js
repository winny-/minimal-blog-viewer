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
  url = 'http://'+url+'/';
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
    var parameters1 = {
      blogId: id,
      key: bloggerApiKey
    }
    req1 = client.blogger.blogs.get(parameters1);
    req1.execute(function (err, response1){
      var parameters2 = {
        blogId: id,
        maxResults: 1,
        key: bloggerApiKey
      }
      req2 = client.blogger.posts.list(parameters2);
      req2.execute(function (err, response2){
        callback(response1, response2);
      });
    });
  });
}

app.get('/', function (req, res){
  res.set('Content-Type', 'text/plain');
  res.send('Please try /blog/someblogidhere');
  res.close();
});

app.get('/blog/:id', function (req, res){
  res.set('Content-Type', 'text/html; charset=utf-8');

  var id = req.params.id;
  if (!isNaN(id)){
    getBlog(id, function (blog, posts){
      res.render('blog.jade', {blog:blog, posts:posts});
    });
  } else {
    getBlogId(id, function(id){
      getBlog(id, function (blog, posts){
        res.render('blog.jade', {blog:blog, posts:posts});
      });
    });
  }
});


console.log('Listening on port: '+port+'.');
app.listen(port);
