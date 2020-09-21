const { execSync } = require('child_process');
const consumerKey = require('./config/consumer_key.js');

/**
 * BearerToken Generater
 * consumer_key, consumer_secret から アプリケーション認証に必要なbearerトークンを取得する
 */

const bearerTocken = execSync(`curl -u '${consumerKey.userAuth.consumer_key}:${consumerKey.userAuth.consumer_secret}' --data 'grant_type=client_credentials' 'https://api.twitter.com/oauth2/token'`).toString();
console.log(bearerTocken);
