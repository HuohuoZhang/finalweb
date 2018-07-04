const fs = require('fs');
const path = require('path');
const text2 = require("../../common/text.js");
const lefa = global.lefamin;
const mariadb = require('../lib/mariadb.js');
mariadb.dbInfo.constr = lefa.dbInfo.constr;
const userTable = 'us';


function checkEmail(email)
{
  return (!email || (typeof email)!="string" || !email.includes("@") || email.length<lefa.emailMin|| email.length>lefa.emailMax); 
}
function processEmail(email)
{
  return email.toLowerCase().trim(); 
}
function checkPassword(password)
{
  return (!password || (typeof password)!="string" || password.length<lefa.passwordMin || password.length>lefa.passwordMax); 
}


function getUserByEmail(email, callback = (err, rs) => {})
{
  try
  {
    if (checkEmail(email)) throw new Error("email不正确"); email = processEmail(email);
    mariadb.getEqual(userTable,'email', email, 'CHAR(512)', rs=>callback(null, rs));// users.all.find(u=>u.email==email);
  }
  catch (err) { callback(err, null); }
};

exports.login = (parts, ps, user, callback = (err, ok) => { })=>
{  
  let email = ps.email, pd = ps.pd; getUserByEmail(email, (err, rs) =>
  {
    let r = {}; if (err) r.err = err.message; else if (rs && rs.length>0)
    {
      let u = rs[0]; if (u.pd == pd)
      {
        let token = text2.randomText(20); u.token = token; lefa.sessions[email] = u; r = { userId: u.id, token:token };
      }
      else
      {
        r.err = `密码不正确`;
      }
    }
    else
    {
      r.err = `email"${email}"尚未被注册`;
    }
    callback(null, JSON.stringify(r));
  });
}
