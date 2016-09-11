'use strict'

const tool = require('../tool')
const async = require('async');
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost/vueblog')
let blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  create_time: Number,
  update_time: Number
}, {
  collection: 'blog',
  versionKey: false
})
let blogModel = mongoose.model('Blog', blogSchema)
let pub = {}

pub.getBlogs = (req, res) => {
  async.waterfall([
    function (cb) {
      blogModel.count({}, function (err, total) {
        let page = tool.getPage(total, req.param('page'), req.param('size'))
        cb(err, page);
      });
    },
    function (page, cb) {
      blogModel.find().sort({
        create_time: -1
      }).skip(page.offset).limit(page.limit).select({'user': 0}).exec(function (err, blogs) {
        for (let blog of blogs) {
          if (blog.content.length > 200) {
            blog.content = blog.content.substr(0, 200) + '......'
          }
        }
        cb(err, blogs, page)
      })
    }
  ], function (err, blogs, page) {
    res.send({blogs: blogs, page: page})
  })
}
pub.getBlog = (req, res) => {
  blogModel.findOne({
    "_id": req.param('_id')
  }).populate({
    path: 'user', 
    select: {
      '_id': 0,
      'username': 1,
      'nickname':1,
      'image':1
    } 
  }).exec(function (err, blog) {
    if (blog) {
      res.send({blog: blog})
    } else {
      res.send({err: '博客不存在'})
    }
  })
}
pub.postBlog = (req, res) => {
  if (req.param('title').trim() === '' || req.param('content').trim() === '') {
    res.send({err: '标题或内容不能为空'})
  }
  let blog = {
    title: req.param('title'),
    content: req.param('content'),
    user: req.user_id,
    create_time: Date.parse(new Date()),
    update_time: Date.parse(new Date())
  }
  if (req.param('_id') === 'new') {
    let newBlog = new blogModel(blog)
    newBlog.save((err, result) => {
      res.send({blog_id: result._id})
    })
  } else {
    blogModel.update({
      _id: req.param('_id')
    }, {
      title: req.param('title'),
      content: req.param('content'),
      update_time: Date.parse(new Date())
    }).exec((err, result) => {
      res.send({blog_id: req.param('_id')})
    })
    
  }
}

module.exports = pub
