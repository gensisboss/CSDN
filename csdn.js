var express = require('express')
var router = express.Router()
const iconv = require('iconv-lite')
// 添加依赖
var request = require('request')
var cheerio = require('cheerio')
/* GET users listing. */
 
let intervalArticle = function (urls) {
  var count = 0 // 刷了多少次
  var len = urls.length // 需要刷的文章篇数
  var co = 0 // 为了循环刷新
 
  setInterval(function () {
    count = count + 1
    // 随机生成0~len的数字，可以按顺序刷，也可以随机刷
    // co = Math.floor(Math.random() * len)
    // 请求博客地址
    request(urls[co].url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let buffer = iconv.encode(`seeEount: ${count} , title: ${urls[co].title} , loadTimes: ${parseInt((count + len) / len)}`, 'binary')
        let bufferStr = iconv.decode(buffer, 'cp936')
        console.log(bufferStr)
      }
    })
    ++co
    if (co === len) {
      co = 0
    }
  }, 1000)
}
 
// 当前页码，这个可以自定义也可以从页面抓取，这里我就不赘述了
let indexPage = 1
// 博客地址 + /article/list/ + 页码  表示当前网页
let url = 'https://blog.csdn.net/gghhb12/article/list/' + indexPage
// 获取博客主页
router.get('/reptile', function (req, res, next) {
  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // 获取html文档
      let $ = cheerio.load(body)
      // 计算总页数
      let allCount = $('#blog_statistics li span').first().text() || 20
      let page = parseInt(allCount) / 20
      let pageStr = page.toString()
      // 不能被整除
      if (pageStr.indexOf('.') > 0) {
        page = parseInt(pageStr.split('.')[0]) + 1
      }
      // 返回的json数据
      let data = {}
      // 文章集合
      let articles = []
      data.allPages = page
      data.currentPage = parseInt(indexPage)
      // 博客主页列表网址存在 .article-list h4 a 标签中，这个随时可能变
      $('.article-list h4 a').each((ins, el) => {
        let article = {} // 每篇文章的字典
        $(el).find(".article-type").remove()
        // 获取文本去除空格以及回车换行
        let text = ($(el).text().replace(/\ +/g, "")).replace(/[\r\n]/g, "")
        // 获取博客网址
        let url = ($(el).attr('href').replace(/\ +/g, "")).replace(/[\r\n]/g, "")
        // title太长可以隐藏
        if (text.length > 20) {
          text = text.substring(0, 20).concat('...')
        }
        article.title = text
        article.url = url
        articles.push(article)
      })
      data.articles = articles
      // 执行函数，开启定时任务，请求博客
      intervalArticle(articles)
      res.set('Content-Type', 'text/html; charset=utf8')
      res.end(JSON.stringify(data))
    } else {
      // 返回的json数据
      let data = {}
      data.msg = '爬取失败'
    }
  })
})
 
module.exports = router