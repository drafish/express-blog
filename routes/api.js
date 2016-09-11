'use strict'

const express = require('express')
const router = express.Router()
const checkLogin = require('../tool').checkLogin
const blogModel = require('../models/blog')
const userModel = require('../models/user')
const commentModel = require('../models/comment')

router.all('/*', userModel.parseToken)
router.get('/blog', (req, res) => {
  if (req.param('_id')) {
    blogModel.getBlog(req, res)
  } else {
    blogModel.getBlogs(req, res)
  }
})
router.post('/blog', checkLogin)
router.post('/blog', blogModel.postBlog)
router.get('/user', (req, res) => {
  if (req.user) {
    res.send({user: req.user})
  } else {
    userModel.login(req, res)
  }
})
router.post('/user', userModel.register)
router.get('/comment', commentModel.getComments)
router.post('/comment', checkLogin)
router.post('/comment', commentModel.postComment)

module.exports = router;
