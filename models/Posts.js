var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    link: String,
    author: String,
    upvotes: {type: Number, default: 0},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});//end PostSchema

PostSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};//end upvote

PostSchema.methods.downvote = function(cb) {
    this.upvotes -= 1;
    this.save(cb);
};//end downvote

mongoose.model('Post', PostSchema);
