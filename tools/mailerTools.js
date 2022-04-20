const mailer = require("nodemailer");
const config = require("../config/appconfig");

/**
 * send mail with specified domain (gmail default)
 * @param {*} email String with the destination mail
 * @param {*} subject a subject to mail
 * @param {*} body a body to send in mail
 * @param {*} callback a next handler after succes or error send
 */
function sendMail(email, subject, title, content, footer, callback){
    let transport = mailer.createTransport({
        service: "gmail",
        auth: config.email
    });

    let body = '<div style="padding: 2em">';
    body += '<div style="width: 70%; margin-left: 15%; box-shadow: 0px 0px 10px 2px gray">';
    body += "<div style='background-image: linear-gradient(to left,#5800e8,#0061f2); border-radius: 1.5em 1.5em 0em 0em'>";
    body += "<h1 style='padding: 1em; color: white; font-family: arial black'>"+title+"</h1></div>";
    body += "<div style='background-image: linear-gradient(#EFEFEF,#E2E2E2); padding: 1em; color: #001A27; text-aling: center'>";
    body += content + "</div>";
    body +="<div style='text-align: center; background-color: #A5A5A5; color: white; padding: 0.8em; font-family: arial'>"+footer+"</div></div></div>";

    let mailOptions = {
        from: config.email.user,
        to: email,
        subject: subject,
        html: body
    };

    transport.sendMail(mailOptions, function (err, data) {
        if (err) {
            callback({ "Error": err });
        } else {
            callback({ "Success":data});
        }
    });
}

function testHostEmail(callback){
    let transport = mailer.createTransport({
        service: "gmail",
        auth: config.email
    });
    let mailOptions = {
        from: config.email.user,
        to: config.email.user,
        subject: "Alerta de acceso",
        html: ""
    };
    transport.sendMail(mailOptions,(err,data)=>{
        if (err){
            callback(err,null);
        }else{
            callback(null,true);
        }
    });
}

function testTargetEmail(target,callback){
    let transport = mailer.createTransport({
        service: "gmail",
        auth: config.email
    });
    let mailOptions = {
        from: config.email.user,
        to: target,
        subject: "Alerta de pre registro",
        html: ""
    };
    transport.sendMail(mailOptions,(err,data)=>{
        if (err){
            callback(err,null);
        }else{
            callback(null,true);
        }
    });
}

module.exports = {
    sendMail,
    testHostEmail,
    testTargetEmail
};