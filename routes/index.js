var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var express = require('express');
var router = express.Router();
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });//end Post.find
});

router.post('/posts', auth, function(req, res, next) {
var post = new Post(req.body);
post.author = req.payload.username;

post.save(function(err, post){
  if(err){ return next(err); }

  res.json(post);
});//end post.save
});

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);
  query.exec(function(err, post){
    if(err){ return next(err); }
    if(!post){ return next(new Error('cant\'t find post')); }

    req.post = post;
    return next();
  });//end query.exec Post
});

router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function(err, post){
    if(err){ return next(err); }

    res.json(req.post);
  });//end post.populate
});

router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });//end post.upvote
});

router.put('/posts/:post/downvote', auth, function(req, res, next) {
    req.post.downvote(function(err, post) {
        if (err) {
            return next(err);
        }

        res.json(post);
    }); //end post.downvote
});

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);
  query.exec(function(err, comment){
    if(err){ return next(err); }
    if(!comment){ return next(new Error('cant\'t find comment')); }

    req.comment = comment;
    return next();
  });//end query.exec Comment
});

router.post('/posts/:post/comments', auth, function(req, res, next){
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });//end post.save
  });//end comment.save
});

router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if(err){ return next(err); }

    res.json(comment);
  });//end comment.upvote
});

router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next) {
  req.comment.downvote(function(err, comment){
    if(err){ return next(err); }

    res.json(comment);
  });//end comment.downvote
});

router.post('/register', function(req, res, next)
{
  if(!req.body.username || !req.body.password)
  {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }//end if

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  user.save(function(err)
  {
    if(err){ return next(err); }

    return res.json({ token: user.generateJWT()});
  });//end user.save
});

router.post('/login', function(req, res, next)
{
  if(!req.body.username || !req.body.password)
  {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }//end if

  passport.authenticate('local', function(err, user, info)
  {
    if(err){ return next(err); }
    if(user)
    {
      return res.json({ token: user.generateJWT() });
    }//end if
    else
    {
      return res.status(401).json(info);
    }//end else
  })(req, res, next);
});

module.exports = router;
