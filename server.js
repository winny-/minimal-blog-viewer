var express = require('express');
var jade = require('jade');
var restify = require('restify');
var assert = require('assert');

var settings = require(__dirname + '/settings.json');

var app = express();
var port = process.env.PORT || 3000;
var bloggerApiKey = settings.bloggerApiKey;
app.engine('jade', jade.__express);
app.set('view engine', 'jade');

app.get('/', function (req, res){
  res.set('Content-Type', 'text/plain');
  res.send('Please try /blog/someblogidhere');
  res.close();
});

app.get('/blog/:id', function (req, res){
  console.log('Request for blog resource "'+req.params.id+'".');
  res.set('Content-Type', 'text/html; charset=utf-8');

  var client = restify.createJsonClient({
    url: 'https://www.googleapis.com/blogger/v3/blogs/'
  });

  client.get('/blogger/v3/blogs/'+req.params.id+'?key='+bloggerApiKey, function (err, req_, res_, obj){
    assert.ifError(err);
    client.get('/blogger/v3/blogs/'+req.params.id+'/posts?key='+bloggerApiKey, function (err, req__, res__, obj_){
      assert.ifError(err);
      res.render('blog.jade', {blog:obj, posts:obj_});
    });
  });
});

console.log('Listening on port: '+port+'.');
app.listen(port);
