var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    upvotes: {type: Number, default: 0},
    totalComments: Number,
    post: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});//end CommentSchema

CommentSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};//end upvote

CommentSchema.methods.downvote = function(cb) {
    this.upvotes -= 1;
    this.save(cb);
};//end downvote

mongoose.model('Comment', CommentSchema);
