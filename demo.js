import Facebook from './server/utils/scraper/facebook.js'

const yt = new Facebook
yt.fetch('https://m.facebook.com/reel/1599227971864801').then(console.log)