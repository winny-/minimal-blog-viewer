var express = require('express');
var jade = require('jade');
var googleapis = require('googleapis');

var app = express();
var port = process.env.PORT || 3000;
var bloggerApiKey = process.env.GOOGLEAPI_BLOGGER_KEY;
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
  googleapis.discover('blogger', 'v3').execute(function (err, client){
    client.blogger.blogs.getByUrl({
      url: url,
      key: bloggerApiKey
    }).execute(function (err, response){
      callback(response.id);
    });
  });
}

/* Given `id` for a blog, fetch the `blog` resource */
function getBlog(id, callback) {
  googleapis.discover('blogger', 'v3').execute(function (err, client) {
    client.blogger.blogs.get({
      blogId: id,
      key: bloggerApiKey
    }).execute(function (err, blog) {
      callback(blog);
    });
  });
}

/* Given `blogId` & `postId`, get that blog's `post`. */
function getPost(blogId, postId, callback) {
  googleapis.discover('blogger', 'v3').execute(function (err, client) {
    client.blogger.posts.get({
      blogId: blogId,
      postId: postId,
      key: bloggerApiKey
    }).execute(function (err, post) {
      callback(post);
    });
  });
}

/* Takes `id` and gets its last `post`. */
function getLastPost(id, callback) {
  googleapis.discover('blogger', 'v3').execute(function (err, client) {
    client.blogger.posts.list({
      blogId: id,
      maxResults: 1,
      key: bloggerApiKey
    }).execute(function (err, posts) {
      callback(posts.items[0]);
    });
  });
}

/* Helper that takes `datum`, determines if it's an ID or URL,
 * does the appropriate query and then calls `getBlog()`.
 */
function getBlogInfo(datum, callback) {
  if (!isNaN(datum)) {
    getBlog(datum, callback);
  } else {
    getBlogId(datum, function (id) {
      getBlog(id, callback);
    });
  }
}

app.get('/', function (req, res) {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.render('homepage.jade');
});

app.get('/blog', function (req, res){
  res.set('Content-Type', 'text/html; charset=utf-8');

  var id = req.query.id;
  var range = req.query.range;

  if (typeof range === 'undefined' || range == '1-1') {
    getBlogInfo(id, function (blog) {
      getLastPost(blog.id, function (post) {
        res.render('last.jade', {blog:blog, post:post});
      });
    });
  } else {
    // getBlogInfo(id, function (blog) {
    //   for (var i = 
  }
});


console.log('Listening on port: '+port+'.');
app.listen(port);
