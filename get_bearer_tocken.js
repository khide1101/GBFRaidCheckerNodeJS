const { execSync } = require('child_process');
const consumerKey = require('./config/consumer_key.js');

/**
 * BearerToken Generater
 * consumer_key, consumer_secret から アプリケーション認証に必要なbearerトークンを取得する
 */

// const bearerTokenCredentials = execSync(`echo -n ${consumerKey.consumer_key}:${consumerKey.consumer_secret} | openssl enc -e -base64 | tr -d "\n"`).toString();
// const bearerTokenCredentials = execSync(`echo "${consumerKey.consumer_key}:${consumerKey.consumer_secret}" | base64`).toString();
// console.log('=== bearerTokenCredentials ===');
// console.log(bearerTokenCredentials);

// const bearerTocken = execSync(`curl -X POST -H "Authorization: Basic ${bearerTokenCredentials}" -H "Content-Type: application/x-www-form-urlencoded;charset=UTF-8" -d "grant_type=client_credentials" "https://api.twitter.com/oauth2/token"`).toString();
// console.log('=== bearerTocken ===');
// console.log(bearerTocken);

const bearerTocken = execSync(`curl -u '${consumerKey.consumer_key}:${consumerKey.consumer_secret}' --data 'grant_type=client_credentials' 'https://api.twitter.com/oauth2/token'`).toString();
console.log(bearerTocken);
