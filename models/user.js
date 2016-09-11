'use strict'

//const tool = require('../tool')
const async = require('async')
const crypto = require('crypto')
const md5 = (str, key) => {
  let hash = crypto.createHash('md5')
  return hash.update(str+key).digest('hex')
}
const mongoose = require('mongoose')
const Schema = mongoose.Schema
//mongoose.connect('mongodb://localhost:27017/vueblog')
let userSchema = new mongoose.Schema({
  username: String,
  password: String,
  nickname: String,
  image: String,
  create_time: Number,
  update_time: Number
}, {
  collection: 'user',
  versionKey: false
})
let userModel = mongoose.model('User', userSchema)
let pub = {}
pub.parseToken = (req, res, next) => {
  req.key = 'you will never guess'
  let token = req.headers.token;
  if (token) {
    token = token.split('-')
    if (token[1]<Date.parse(new Date())) {
      res.send({err: '登录过期，请重新登录'})
    } else {
      pub.getUser(token[0], (user) => {
        if (token[2] === md5(user.password, req.key)){
          let currentUser = {
            username: user.username,
            nickname: user.nickname,
            image: user.image
          }
          req.user = currentUser
          req.user_id = user._id
          next()
        } else {
          res.send({err: 'token被篡改'})
        }
      })
    }
  } else {
    next()
  }
}
pub.getUser = (username, callback) => {
  userModel.findOne({
    "username": username
  }, {
    'username': 1,
    'password': 1,
    'nickname': 1,
    'image': 1
  }).exec((err, user) => {
    callback(user)
  });
}
pub.login = (req, res) => {
  if (req.param('username').trim() === '' || req.param('password') === '') {
    res.send({err: '用户名或密码不能为空'})
  }
  userModel.findOne({
    'username': req.param('username')
  }, {
    'username': 1,
    'password': 1,
    'nickname': 1,
    'image': 1
  }).exec((err, user) => {
    if (user.password === md5(req.param('password'), req.key)) {
      let expires = Date.parse(new Date()) + 7 * 24 * 3600 * 1000;
      let token = user.username + '-' + expires + '-' + md5(user.password, req.key)
      user = {
        username: user.username,
        nickname: user.nickname,
        image: user.image
      }
      res.send({user: user, token: token})
    } else {
      res.send({err: '用户名或密码错误'})
    }
  })
}
pub.register = (req, res) => {
  if (req.param('username').trim() === '' || req.param('password') === '') {
    res.send({err: '用户名或密码不能为空'})
  }
  async.waterfall([
    function (cb) {
      userModel.count({
        username: req.param('username')
      }).exec((err, result) => {
        if (result>0) {
          err = '该用户已注册'
        }
        cb(err)
      });
    },
    function (cb) {
      let user = {
        username: req.param('username'),
        password: md5(req.param('password'), req.key),
        nickname: req.param('username'),
        image: '/static/img/user.png',
        create_time: Date.parse(new Date()),
        update_time: Date.parse(new Date())
      }
      let newUser = new userModel(user)
      newUser.save(function (err, result) {
        let expires = Date.parse(new Date()) + 7 * 24 * 3600 * 1000
        let token = user.username + '-' + expires + '-' + md5(user.password, req.key)
        delete user.password
        delete user.create_time
        delete user.update_time
        cb(err, user, token)
      })
    }
  ], function (err, user, token) {
    if (err) {
      res.send({err: err})
    } else {
      res.send({user: user, token: token})
    }
  })
}
module.exports = pub
