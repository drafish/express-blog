'use strict';

let pub = {};

pub.l = (msg) => {
  console.log('\n\n', msg, '\n\n');
};

pub.fail = (res, err) => {
  res.status(err.status).send({
    err: err.status,
    msg: err.msg
  });
};
pub.getPage = (item_count, page_index, page_size) => {
  let page_count, offset, limit, has_next, has_previous
  page_count = parseInt(item_count/page_size); 
  if (item_count % page_size > 0){
    page_count = page_count+1;
  }
  if (item_count == 0 || page_index > page_count){
    offset = 0;
    limit = 0;
    page_index = 1;
  } else {
    page_index = page_index;
    offset = page_size * (page_index - 1);
    limit = parseInt(page_size)
  }
  has_next = page_index < page_count;
  has_previous = page_index > 1;
  return {
    item_count: item_count,
    page_index: page_index,
    page_size: page_size,
    page_count: page_count,
    offset: offset,
    limit: limit,
    has_next: has_next,
    has_previous: has_previous,
  };
}
pub.checkLogin = (req, res, next) => {
  if (req.user.username) {
    console.log(req.user.username)
    next()
  } else {
    res.send({err: '请登录后再操作'})
  }
}
module.exports = pub;
