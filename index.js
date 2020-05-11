// 1. 引入 express
const express = require('express');
const url = require('url');
// 設定上傳暫存目錄
const multer = require('multer');
const upload = multer({dest:'tmp_uploads/'});
const fs = require('fs'); // 處理檔案的核心套件
//post資料用
//const bodyParser = require('body-parser');
//const urlencodedParser = express.urlencoded({extended: true});
// 2. 建立 web server 物件
const app = express();
const session = require("express-session");
const moment = require('moment-timezone');
const db = require(__dirname + '/db_connect');
const cors = require('cors');

// 註冊樣版引擎
app.set('view engine', 'ejs');
// 設定views路徑 (選擇性設定)
// app.set('views', __dirname + '/../views');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({
    saveUninitialized: false,
    resave: false, //沒變更內容是否強制回存
    secret: "sdfgg",
    cookie:{
        maxAge:1200000, //20分鐘
    }
}))

app.use(cors());
// 3. 路由
//連結樣板
app.get('/', function(request, response){
    //response.send('<h2>Hello World!</h2><hr><p>好想睡覺</p>'); });
    response.render('home', {name : 'Shinder'});
});

//普通網址連結
app.get('/abc', function(request, response){
    response.send('<h2>好想睡覺</h2><hr><p>ＯＯＯＯ</p>');
});

//連結json檔
app.get('/sales', function (request, response) {
    // const sales = require(__dirname + '/../data/sales');
    // response.send(`<h2>${sales[0].name}</h2>`)
    const sales = require(__dirname + '/../data/sales');
    response.render('sales-table', {
        sales: sales
    });
    });
//取得JQueryString的資料
app.get('/try-qs', (req, res)=>{
    const urlParts = url.parse(req.url, true);
    console.log(urlParts);
    // 在 server 端查看
    res.json(urlParts.query);
    });

//post資料用
//app.post('/try-post-form', urlencodedParser, (req, res) => {
app.post('/try-post-form', (req, res) => {
    res.json(req.body);
});
//上傳檔案
app.post('/try-upload', upload.single('avatar'), (req, res)=>{
    const output = {
        body: req.body,
        file: req.file,
    };
    console.log(req.file);
    if(req.file && req.file.originalname){
        let ext = ''; //副檔名
        switch(req.file.mimetype){
            case 'image/jpeg':
                ext = '.jpg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            case 'image/gif':
                ext = '.gif';
                break;
        }
        if(ext){
            let filename = "member" + ext;
            output.newName = filename;
            fs.rename(
                req.file.path,
                './public/img/' + filename,
                error=>{}
            );
        } else {
            fs.unlink(req.file.path, error=>{});
        }
    }

    res.json(output);
});

//session
app.get('/try-session', (req, res)=>{
    req.session.my_var = req.session.my_var || 0; // 預設為 0
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session: req.session
    });
});
app.use("/member", require(__dirname + "/routes/member"))

//SQL
// app.get("/try-db",(req,res) =>{
//     const sql = "SELECT * FROM students limit 3";
//     db.query(sql, (error, results, fields)=>{
//         if(error){
//             console.log(error);
//         }else{
//             res.json(results);
//         }
//     })
// })
app.get("/try-db",(req,res) =>{
    const sql = "UPDATE students SET cName=?, cEmail=? WHERE cID =4;";
    db.query(sql, ['我一號', 'number1@number1.com'],(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.json(results);
        }
    })
});
app.use("/students", require(__dirname + "/routes/address_book"));
app.use('/members', require(__dirname + '/routes/members'));
app.use('/members', require(__dirname + '/routes/creditCards'));


//路由網址正規表示法
app.get('/my-params1/:action/:id', (req, res)=>{
    res.json(req.params);
});
app.get('/my-params2/:action?/:id?', (req, res)=>{
    res.json(req.params);
});
app.get('/my-params3/*/*?', (req, res)=>{
    res.json(req.params);
});

//連結靜態網址
app.use(express.static('public'));

// *** 此段放在所有路由設定的後面 ***
app.use((req, res)=>{
    res.type('text/html');
    res.status(404);
    res.send(`path: ${req.url}` + '<br>404 - 找不到網頁');
});

// 4. Server 偵聽
app.listen(5000, function(){
console.log('啟動 server 偵聽埠號 5000');});