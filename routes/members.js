
const express = require('express');
const moment = require('moment-timezone');
const db = require(__dirname + '/../db_connect');
const router = express.Router();


router.get('/', (req, res)=>{
  const sql = "SELECT * FROM member";
  db.query(sql, (error, results, fields)=>{
      if(error){
          console.log(error);
      } else {
          res.json(results);
      }
  });
});

router.post('/add', (req, res)=>{
    const output = {
        success: false,
        error: '',
    };

    const sql = "INSERT INTO `member`(`memberName`, `memberPw`, `memberEmail`) VALUES (?,?,?)";

    db.queryAsync(sql, [
        req.body.memberName,
        req.body.memberPW,
        req.body.memberEmail,
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
});

router.put('/update', (req, res)=>{
    const output = {
        success: false,
        error: '',
    };

    const sql = "UPDATE `member` SET `memberName` = ?, `memberSex` = ?, `memberBirthday`=?, `memberPhone` = ?, `memberAddress`=?, `avatar`=? WHERE `memberId` = ?";

    db.queryAsync(sql, [
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.phone,
        req.body.addressData,
        req.body.avatar,
        req.body.memberID
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

});

module.exports = router;

