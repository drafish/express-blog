'use strict'

const tool = require('../tool')
const async = require('async')
const mongoose = require('mongoose')
let commentSchema = new mongoose.Schema({
  blog_id: String,
  content: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  create_time: Number
}, {
  collection: 'comment',
  versionKey: false
})
let commentModel = mongoose.model('Comment', commentSchema)
let pub = {}

pub.getComments = (req, res) => {
  async.waterfall([
    function (cb) {
      commentModel.count({
        "blog_id": req.param('_id')
      }).exec((err, total) => {
        let page = tool.getPage(total, req.param('page'), req.param('size'))
        cb(err, page);
      });
    },
    function (page, cb) {
      commentModel.find({
        "blog_id": req.param('_id')
      }).sort({
        create_time: -1
      }).skip(page.offset).limit(page.limit).populate({
        path: 'user', 
        select: {
          '_id':0,
          'username':1,
          'nickname':1,
          'image':1
        } 
      }).exec(function (err, comments) {
        cb(err, comments, page)
      })
    }
  ], function (err, comments, page) {
    res.send({comments: comments, page: page})
  })
}
pub.postComment = (req, res) => {
  if (req.param('content').trim() === '') {
    res.send({err: '评论不能为空'})
  }
  let comment = {
    blog_id: req.param('_id'),
    content: req.param('content'),
    user: req.user_id,
    create_time: Date.parse(new Date())
  }
  let newComment = new commentModel(comment)
  newComment.save((err, result) => {
    comment.user = req.user
    res.send({comment: [comment]})
  })
}
module.exports = pub
