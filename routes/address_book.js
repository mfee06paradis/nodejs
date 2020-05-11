// const express = require('express');
// const db = require(__dirname + '/../db_connect');
// const router = express.Router();

// router.get('/:page?',(req,res)=>{
//     const perPage = 5;
//     let page = parseInt(req.params.page) || 1;
//     const output = {
//         totalRows: 0,   //總比數
//         perPage: 5,     //每一頁最多幾筆
//         totalPages: 0,  //總頁數
//         page: page,        //用戶要查看的頁數
//         rows: 0,        //當頁的資料
//     };
//     const t_sql = "select count(1) num from students";
//     db.query(t_sql, (error, results)=>{
//         output.totalRows = results[0].num;
//         output.totalPages = Math.ceil(output.totalRows/perPage);
//         if(output.page<1) output.page = 1;
//         if(output.page>output.totalPages) output.page = output.totalPages;

//         const sql= `SELECT * from students LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`;

//         db.query(sql,(error, results)=>{
//             output.rows = results;
//             //res.json(output);
//             res.render('list', output);
//         })
//     })
// })

// module.exports = router;



const express = require('express');
const moment = require('moment-timezone');
const upload = require(__dirname+'/../upload');
const db = require(__dirname + '/../db_connect');
const router = express.Router();

router.use((req, res, next)=>{
    res.locals.title = 'Address-Book';
    next();
});

router.get('/delete/:cID?', (req, res)=>{
    const sql = "DELETE FROM `students` WHERE cID=?";
    db.queryAsync(sql, [req.params.cID])
        .then(results=>{
            // res.redirect('/address-book');
            if(req.get('Referer')){
                // 如果有[從哪裡來]的資料
                res.redirect( req.get('Referer') );
            } else {
                res.redirect('/students');
            }

            /*
            res.json({
                success: true
            });

             */
        })
        .catch(ex=>{
            console.log('ex:', ex);
            res.json({
                success: false,
                info: '無法刪除資料'
            });
        })
});


router.get('/add',(req, res)=>{
    res.render('add');
});

// upload.none() 用來解析 multipart/form-data 格式的 middleware
router.post('/add', upload.none(), (req, res)=>{
    const output = {
        success: false,
        error: '',
    };
    // TODO: 應該檢查表單進來的資料
    if(req.body.cName.length<2){
        output.error = '姓名字元長度太短';
        return res.json(output);
    }

    const email_pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(!email_pattern.test(req.body.cEmail)){
        output.error = 'Email 格式錯誤';
        return res.json(output);
    }

    const sql = "INSERT INTO `students`(`cName`, `cEmail`, `cPhone`, `cBirthday`, `cAddr`) VALUES (?,?,?,?,?)";

    db.queryAsync(sql, [
        req.body.name,
        req.body.email,
        req.body.mobile,
        req.body.birthday,
        req.body.address,
    ])
        .then(results=>{
            output.results = results;
            if(results.affectedRows===1){
                output.success = true;
            }
            res.json(output);
        })
        .catch(ex=>{
            console.log('ex:', ex);
        })

    //res.json(req.body);
});

router.get('/edit/:cID',(req, res)=>{
    const sql = "SELECT * FROM students WHERE cID=?";
    db.queryAsync(sql, [req.params.cID])
        .then(results=>{
            if(results.length){
                results[0].cBirthday = moment(results[0].cBirthday).format('YYYY-MM-DD');
                res.render('edit', results[0]);
            } else {
                res.redirect('/students');
            }
        })
        .catch(ex=>{
            console.log('ex:', ex);
        })
});

router.post('/edit', upload.none(), (req, res)=>{
    const output = {
        success: false,
        error: '',
    };
    // TODO: 應該檢查表單進來的資料
    if(req.body.cName.length<2){
        output.error = '姓名字元長度太短';
        return res.json(output);
    }

    const email_pattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(!email_pattern.test(req.body.cEmail)){
        output.error = 'Email 格式錯誤';
        return res.json(output);
    }

    const data = {...req.body}; // 第一層複製
    delete data.cID; // 移除 sid

    const sql = "UPDATE `students` SET ? WHERE cID=?";

    db.queryAsync(sql, [data, req.body.cID])
        .then(results=>{
            output.results = results;
            if(results.changedRows===1){
                output.success = true;
            } else {
                output.error = '資料沒有變更';
            }
            res.json(output);
        })
        .catch(ex=>{
            console.log('ex:', ex);
        })
});


router.get('/:page?',(req,res)=>{
    const perPage = 5;
    let page = parseInt(req.params.page) || 1;
    const output = {
        totalRows: 0,   //總比數
        perPage: 5,     //每一頁最多幾筆
        totalPages: 0,  //總頁數
        page: page,        //用戶要查看的頁數
        rows: 0,        //當頁的資料
    };
    const t_sql = "select count(1) num from students";
    db.queryAsync(t_sql)
        .then(results=>{
        output.totalRows = results[0].num;
        output.totalPages = Math.ceil(output.totalRows/perPage);
        if(output.page<1) output.page = 1;
        if(output.page>output.totalPages) output.page = output.totalPages;

        const sql= `SELECT * from students LIMIT ${(output.page-1)*output.perPage}, ${output.perPage}`;
        return db.queryAsync(sql);
        })
        .then(results=>{
            const fm = 'YYYY-MM-DD';
            for(let i of results){
                i.cBirthday = moment(i.cBirthday).format(fm);
            }
            output.rows = results;
            // res.json(output);
            res.render('list', output);
        })
    })

module.exports = router;