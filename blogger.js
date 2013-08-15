var googleapis = require('googleapis');

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
      key: module.exports.apiKey
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
      key: module.exports.apiKey
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
      key: module.exports.apiKey
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
      key: module.exports.apiKey
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

module.exports = {
  getBlogId:   getBlogId,
  getBlog:     getBlog,
  getPost:     getPost,
  getLastPost: getLastPost,
  getBlogInfo: getBlogInfo,
  apiKey:      ''
}
