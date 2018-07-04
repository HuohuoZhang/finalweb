const path = require('path');
const fs = require('fs');
const os=require('os');

global.lefamin=new Object(); const lefa=global.lefamin; 
lefa.path=__dirname; //console.log(`path: ${lefa.path}`);
require('./common/settings.js');

//------------server--------------//
lefa.serverName=os.hostname().toLowerCase(); //console.log(`server name: ${lefa.serverName}`);
lefa.host = '0.0.0.0';

lefa.commonPath=path.join(lefa.path,"common");
lefa.frontPath=path.join(lefa.path,"front");
lefa.serverPath=path.join(lefa.path,"server");
lefa.layoutPath=path.join(lefa.frontPath,"layout.htm");
lefa.layout = fs.readFileSync(lefa.layoutPath, 'utf8');

lefa.sessions = {};
lefa.makeUser = (req) =>
{
  let cookie = req.headers.cookie, user = {}; console.log(cookie); if (cookie)
  {
    cookie.split(';').map(item => item.trim()).filter(item => item).map(item =>
    {
      if (item.startsWith('email=')) user.email = item.substr('email='.length);
      if (item.startsWith('token=')) user.token = item.substr('token='.length);
      return item;
    });
    if (user.email && user.token)
    {
      console.log(`${user.email} && ${user.token}`);
      let session = lefa.sessions[user.email]; if (session && session.token == user.token)
      {
        user = session; user.isLogin = true; if (user.email == 'jinmin.si@outlook.com') user.isSuper = true;
      } 
    }
  }  //console.log(user);
  return user;
}

lefa.dbInfo = {
  constr : {
    host: 'lefamin.xyz',
    user: 'lefa',
    password: 'Mar1adb!@#',
    database: 'lefamin'
  }
};

//------------file types--------------//
lefa.attachmentFileType="application/octet-stream";
lefa.mimes=
{
  "htm":"text/html",
  "css":"text/css",
  "js": "application/javascript",
  "json": "application/javascript",
  "jpg":"image/jpeg",
  "jpeg":"image/jpeg",
  "png":"image/png",
  "gif":"image/gif",
  "ico":"image/x-icon",
  "svg": "image/svg+xml",
  "mp4": "video/mp4"
  //

};
