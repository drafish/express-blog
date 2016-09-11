'use strict';

let config = {

  // 服务端 host
  host: 'http://localhost:3000',

  // web 开发环境的 host
  webHost: 'http://localhost:8080',

  // 跨域白名单
  whiteOrigins: [
    'http://localhost:8080',
    'http://www.paidepaiper.top',
    'http://www.paidepaiper.xyz'
  ]
};

module.exports = config;
