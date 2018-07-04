const template = await axios.get('/front/login.htm'); 
const lefa = global.lefamin;

module.exports=
{
  data: () =>
  {
    console.log(lefa.user);
    return { user: lefa.user, errors: [], ui: {}};
  },
  methods:
  {
    login()
    {
      if(this.checkInputs()) 
      {
        let email = lefa.user.email, pd = lefa.user.pd; lefa.login(email, pd, r=>
        {
          if (r.err) this.errors.push(r.err); else location.href='/todo';
        });
      }
    },
    checkInputs()
    {
      console.log(lefa.user); console.log(this.user); 
      let errors = [], u=this.user, email=u.email, pd=u.pd;
      if (email.indexOf("@") == -1) errors.push('请输入正确的email');
      else if (email.length<lefa.emailMin) errors.push(`email至少为${lefa.emailMin}位`);
      else if (email.length>lefa.emailMav) errors.push(`email最多为${lefa.emailMax}位`);
      else if (pd.length<lefa.passwordMin) errors.push(`password至少为${lefa.passwordMin}位`);
      else if (pd.length>lefa.passwordMav) errors.push(`password最多为${lefa.passwordMax}位`);
      this.errors = errors; if (errors.length) return false; else return true;
    }
  },
  template: template.data
};

