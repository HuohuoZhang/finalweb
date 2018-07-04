const mariadb = require('../lib/mariadb.js');
const lefa = global.lefamin;
mariadb.dbInfo.constr = lefa.dbInfo.constr;

function auth1(user)
{
  if (user && user.isSuper) return null;
  if (!user.isLogin) return lefa.messages.unlogin;
}

function auth2(user, obj)
{
  if (user && user.isSuper) return null;
  if (user.id != obj.owner) return lefa.messages.notOwner;
}

function auth3(user, objs)
{
  if (user && user.isSuper) return null; let id = user.id;
  if (objs.some(obj => obj.owner != id)) return lefa.messages.notOwner;
}

exports.get_all = (parts, ps, user, callback)=>
{
  let table = parts[3]; let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    mariadb.getAll(table, rs =>
    {
      let msg = auth3(user, rs); if (msg) callback(new Error(msg), null); else callback(null, JSON.stringify(rs));
    });
  }
  catch (err) { callback(err, null); }
}

exports.get_equal = (parts, ps, user, callback) =>
{
  let table = parts[3]; let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    mariadb.getEqual(table, ps.name, ps.value , ps.type, rs =>
    {
      let msg = auth3(user, rs); if (msg) callback(new Error(msg), null); else callback(null, JSON.stringify(rs));
    });
  }
  catch (err) { callback(err, null); }
}

exports.get = (parts, ps, user, callback) =>
{
  let table = parts[3]; let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    mariadb.get(table, r =>
    {
      let msg = auth2(user, r); if (msg) callback(new Error(msg), null); else callback(null, JSON.stringify(r));
    });
  }
  catch (err) { callback(err, null); }
}

exports.create = (parts, ps, user, callback) =>
{
  let table = parts[3]; let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    mariadb.create(table, newId =>
    {
      ps.owner = user.id; for(let name in ps)
      {
        if (name != 'id') mariadb.update(table, newId, name, ps[name]);
      }
      mariadb.enable(table, newId, () =>
      {
        ps.id = newId; callback(null, JSON.stringify(ps));
      });
    });
  }
  catch (err) { callback(err, null); }
}

exports.update = (parts, ps, user, callback) =>
{
  let table = parts[3], id = parseInt(parts[4]); let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    for (let name in ps)
    {
      if (name != 'id') mariadb.update(table, id, name, ps[name]);
    }
    callback(null, "OK");
  }
  catch (err) { callback(err, null); }
}

exports.disable = (parts, ps, user, callback) =>
{
  let table = parts[3], id = parseInt(parts[4]); let ar = auth1(user); if (ar) { callback(new Error(ar), null); return; }
  try
  {
    mariadb.disable(table, id, () => { callback(null, "OK"); }); 
  }
  catch (err) { callback(err, null); }
}