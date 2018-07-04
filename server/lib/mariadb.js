const mysql = require('mysql');
const types = ['BINARY', 'CHAR', 'DATE', 'DATETIME', 'DECIMAL', 'DOUBLE', 'INTEGER', 'UNSIGNED', 'TIME'];
const dbInfo = {};
exports.dbInfo = dbInfo;

function connect()
{
  const connection = mysql.createConnection(dbInfo.constr);
  connection.connect();
  return connection;
}

function checkType(type)
{
  if (!type) type = 'char(512)'; return type;
  let type2 = type.replace(/[()\s\d]/g, '').toUpperCase();
  if (!types.includes(type2)) { throw new Error(`invalid data type: ${type}`); } return type;
}

function makeObj(r)
{
  let r2 = JSON.parse(r.ps2); r2.id = r.id; return r2;
}

function makeObjs(rs)
{
  return rs.map(r => makeObj(r));
}

function getAll(table, callback = rs => { })
{
  let connection = connect();
  let sql = `SELECT COLUMN_JSON(ps) ps2, id from ?? where COLUMN_GET(ps, 'enabled' as INTEGER)=1`;
  //console.log(`select all from ${table}`);
  connection.query(sql,[table], function (error, results, fields)
  {
    if (error) throw error; callback(makeObjs(results));
    //console.log(`results:`); console.log(results[0]); console.log(`fields:`); console.log(fields);
  });
  connection.end();
};
exports.getAll = getAll;

function get(table, id, callback = json => { })
{
  let connection = connect();
  let sql = `SELECT COLUMN_JSON(ps) ps2, id from ?? where id=?`; //console.log(`select ${id} from ${table}`);
  connection.query(sql, [table, id], function (error, results, fields)
  {
    if (error) throw error; let r = ( results && results.length > 0 ? makeObj(results[0]) : null ); callback(r);
    //console.log(`results:`); console.log(results[0]); console.log(`fields:`); console.log(fields);
  });
  connection.end();
};
exports.get = get;


function getEqual(table, name, value, type, callback = rs => { })
{
  type = checkType(type); let connection = connect();
  let sql = `SELECT COLUMN_JSON(ps) ps2, id from ?? where COLUMN_GET(ps, ? as ${type})=? and COLUMN_GET(ps, 'enabled' as INTEGER)=1`;
  //console.log(`select equal ${name} = ${value} from ${table}`);
  connection.query(sql, [table, name, value], function (error, results, fields)
  {
    if (error) throw error; callback(makeObjs(results));
    //console.log(`results:`); console.log(results); //console.log(`fields:`); console.log(fields);    
  });
  connection.end();
};
exports.getEqual = getEqual;


function create(table, callback = newId => { })
{
  let connection = connect();
  let sql = `INSERT INTO ?? (ps) VALUES (COLUMN_CREATE('enabled',false))`; //console.log(sql);
  connection.query(sql, [table], function (error, results, fields)
  {
    if (error) throw error; let newId = results.insertId; callback(newId);// console.log(`created newId=${newId}`);
  });
  connection.end();
};
exports.create = create;


function update(table, id, name, value, callback = () => { })
{
  if (name == 'id') { callback(); return; } let connection = connect();
  let sql = `UPDATE ?? SET ps = COLUMN_ADD(ps,?,?) where id=?`;
  //console.log(`update ${id} ${name} ${value} ${table}`);
  connection.query(sql,[table,name, value,id], function (error, results, fields)
  {
    if (error) throw error; callback();
    //console.log(`results:`); console.log(results); console.log(`fields:`); console.log(fields);
  });
  connection.end();
};
exports.update = update;


function disable(table, id, callback = () => { })
{
  update(table, id, 'enabled', 0, callback); //console.log(`disabled ${id}`);
};
exports.disable = disable;
function enable(table, id, callback = () => { })
{
  update(table, id, 'enabled', 1, callback);//console.log(`enabled ${id}`);
};
exports.enable = enable;
