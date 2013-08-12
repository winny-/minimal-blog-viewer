var express = require('express');
var jade = require('jade');
var googleapis = require('googleapis');

var settings = {bloggerApiKey: process.env.GOOGLEAPI_BLOGGER_KEY}

var app = express();
var port = process.env.PORT || 3000;
var bloggerApiKey = settings.bloggerApiKey;
app.engine('jade', jade.__express);
app.set('view engine', 'jade');


/* Given `url` get the `id` for its corresponding blog. */
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

/* Given `id` for a blog, fetch the `blog` resource */
function getBlog(id, callback) {
  googleapis.discover('blogger', 'v3').execute(function (err, client) {
    var req1 = client.blogger.blogs.get({
      blogId: id,
      key: bloggerApiKey
    });
    req1.execute(function (err, blog) {
      callback(blog);
    });
  });
}

/* Takes `id` and gets its corresponding `blog` object and gets the latest post in `posts`. */
function getLastBlogPost(id, callback){
    getBlog(id, function (blog) {
      googleapis.discover('blogger', 'v3').execute(function (err, client){
      var req2 = client.blogger.posts.list({
        blogId: id,
        maxResults: 1,
        key: bloggerApiKey
      });
      req2.execute(function (err, posts){
        callback(blog, posts);
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
  var range = req.query.range;

  if (typeof url !== 'undefined') {
    getBlogId(url, function (id){
      if (typeof range === 'undefined' || range == '1-1') {
        getLastBlogPost(id, function(blog, posts){
          res.render('blog.jade', {blog:blog, posts:posts});
        });
      } else {
        // Get arbritrary range of blog posts.
      }
    });
  } else if (!isNaN(id)) {
    if (typeof range === 'undefined' || range == '1-1') {
      getLastBlogPost(id, function(blog, posts){
        res.render('blog.jade', {blog:blog, posts:posts});
      });
    } else {
      // Get arbritrary range of blog posts.
    }
  } else {
    res.render('invalid.jade', {inputs:{url:url, id:id}});
  }
});


console.log('Listening on port: '+port+'.');
app.listen(port);
