const express = require("express");
const router = express.Router();

router.get("/login",(req,res)=>{
    res.render("member/login");
});

router.post("/login",(req, res)=>{
    const users = {
        "ddn":{
            nickname: "ddn",
            pw:"123"
        },
        "hello":{
            nickname:"halo",
            pw:"12345"
        }
    };
    const output= {
        success: false,
        error: "帳號密碼錯誤",
        body: req.body
    };
    if(req.body.account && users[req.body.account]){
        //帳號是對的
        if(req.body.password === users[req.body.account].pw){
            //密碼也是對的
            req.session.loginUser={
                account: req.body.account,
                nickname: users[req.body.account].nickname
            };
            output.success = true;
            delete output.error;
        }
    }
    res.json(output)
})

//登出
router.get("/logout",(req,res)=>{
    delete req.session.loginUser; //清掉session變數
    res.redirect("/"); //轉向道別的頁面
})

module.exports = router;