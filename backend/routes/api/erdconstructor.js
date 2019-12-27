var router = require('express').Router();
const db = require('../../db')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const imageupload = require('../../imagemiddleware')
const fs = require('fs');
const nodemailer = require('nodemailer');
const uuid = require('uuid/v4')
const config = require('../../config/config.js');
const path = require('path');

router.use(morgan('short'))
router.use(bodyParser.json());

const mailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const transporter = nodemailer.createTransport({
    sendmail:true,
    newline: 'unix',
    path:'/usr/sbin/sendmail'
    // host: global.gConfig.mail.host,
    // port: global.gConfig.mail.port,
    // secure: false,
    // auth: {
    //   user: global.gConfig.mail.address,
    //   pass: global.gConfig.mail.password
    // }
  });

function validateIndexFormat(index){
    const indexInt = Number(index);
    if(indexInt != NaN && Number.isInteger(indexInt)){
        if(index.length >=  global.gConfig.erd_constructor.min_index_length
            && index.length <=  global.gConfig.erd_constructor.max_index_length){
                return true;
        }
    }
    return false;
}

function validateEmailFormat(email) {
    return mailTest.test(email);
}

function sendConfirmMail(email, reportID) {
    const mailOptions = {
        from: global.gConfig.mail.address,
        to: email,
        subject: 'Confirm your ERD Constructor report',
        html: '<p>Your report was succesfully uploaded to server. Please confirm that report visible in link below is correct by clickinkg "Confirm" button.</p> \
        <p style="text-align: center;"><button style="display:block;margin: 0 auto; height: 30px; width: 50%; background-color: #1166ff; border: 0; font-weight: bold;"> \
        <a style="text-decorartion:none;color:#000000;" href="' + global.gConfig.frontend.report_ep + reportID + '">VIEW REPORT</a></button></p> \
        <p>If button not working copy and paste link: ' + global.gConfig.frontend.report_ep + reportID + '</p> \
        <p><b>Remember! You cannot unconfirm report once confirmed. Don\'t share links.</b></p> \
        <p>If something is wrong try upload once again and if this will not help send report in <b>.docx</b> format to "' + global.gConfig.mail.address +'</p>'
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
          });
    })
}

router.post('/', imageupload.single('image'), (req, res) => {
    if(!req.file || !req.body.document){
        res.status(401).json({error: 'Please provide an proper data'});
        return;
    }

    if(!validateIndexFormat(req.body.index)){
        removeFile(req.file);
        res.status(400).json("Invalid student index format");
        res.end();
        return;
    }
    if(!validateEmailFormat(req.body.email)){
        removeFile(req.file);
        res.status(400).json("Provided email address is invalid. ");
        res.end();
        return;
    }

    const reportUUID = uuid();

    var getTermIdQuery = {
        text: "SELECT id FROM term where code = $1",
        values: [req.body.term_code]
    };
    var insertReportQuery = {
        text: "INSERT INTO report(id, student_id, json_report, image_src, term_id, version)\
                 VALUES ($1, $2, $3, $4, $5, $6)",
        values: [reportUUID, req.body.index, req.body.document, req.file.filename]
    };
    var getStudentReports = {
        text: "SELECT id, confirmed, image_src, shared, rate_done FROM report WHERE student_id = $1",
        values: [req.body.index]
    };

    var dropStudentReport = "DELETE FROM report WHERE id = $1";

    db.getClient(async (err, client, done) => {
        try {
            await client.query('BEGIN');
            //check term code
            var {rowCount, rows} = await client.query(getTermIdQuery)
            if(rowCount != 1){
                removeFile(req.file);
                await client.query('ROLLBACK');
                res.status(400).json("Invalid term code");
                return
            }
            const term = rows;
            // check confirmed work
            var {rowCount, rows} = await client.query(getStudentReports);
            let newReportVersion = 1;
            rows.forEach(e => {
                console.log(e);
                if(e.confirmed == true && (e.shared == true || e.rate_done == true)){
                    // if report is rated/shared dont overwrite
                    // and let student send corrected report
                    newReportVersion = newReportVersion + 1; // which student report ver. this will be
                } else if(e.confirmed == true){
                    throw({reason: "confirmed"})
                } else {
                    client.query({text: dropStudentReport, values: [e.id]});
                    removeFile({path: 'erd_images/' + e.image_src});
                }
            });

            // insert work
            var {rowCount} = await client.query(insertReportQuery.text,
                                    insertReportQuery.values.concat([term[0].id, newReportVersion]));
            if(rowCount < 1){
                await client.query('ROLLBACK');
                removeFile(req.file);
                res.status(500).json("Failed to upload report to server");
                return
            }
            await sendConfirmMail(req.body.email, reportUUID)
            await client.query('COMMIT');
            res.status(200)
        } catch(e){
            if(e.reason === "confirmed"){
                res.status(400).json("One of your report is already confirmed and waits to be rated.");
            } else {
                res.status(500).json("Failed to upload report to server")
            }
            console.log(e);
            await client.query('ROLLBACK');
            if(req.file){
                removeFile(req.file);
             }
        } finally{
            done()
            res.end()
            return;
        }
    });
    return;
});

function removeFile(file){
    if(file){
        fs.unlink(file.path, (error) => {
            if(error){
                console.log("Failed to remove file");
                console.log(error);
            }
        });
    }
}
module.exports = router;