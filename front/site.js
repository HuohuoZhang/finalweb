const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
async function require2(url) 
{
  if(!url || typeof url !='string' || url.length==0) return;
  let u=url, rs=global.modules; if (!rs[u]) 
  {      
    rs[u]={exports:{}}; let x = await axios.get(u); if (x.statusText === 'OK') 
    { 
      let fnBody = x.data; console.log(url);
      await new AsyncFunction('exports','module',fnBody)(rs[u].exports,rs[u]); 
    } 
    else throw new Error(`require ${u} failed: ${x.statusText}`);
  }
  return rs[u].exports;
};

function require(url) 
{
  if(!url || typeof url !='string' || url.length==0) return;
  let u=url, rs=global.modules; if (!rs[u]) 
  {        
    rs[u]={exports:{}}; let x = new XMLHttpRequest(); x.open('get', u, false); x.send(); 
    if (x.status === 200 && x.readyState == XMLHttpRequest.DONE) 
    {
      let fnBody = x.responseText; 
      new Function('exports','module',fnBody)(rs[u].exports,rs[u]); 
    }
    else throw new Error(`require ${u} failed: ${x.status}`);
  }
  return rs[u].exports;
};



//------------------login-------------
lefamin.checkLogin = () =>
{
  console.log('check login:'); console.log(lefamin.user);
  if (!lefamin.user.token) { lefamin.gotoLogin(); return true; } return false;
};
lefamin.checkResult = r =>
{
  console.log('check result: ');
  console.log(lefamin.user);
  if (r.lefaError == lefa.messages.unlogin) { lefamin.gotoLogin(); return true; } return false;
};
lefamin.gotoLogin = function ()
{
  location.href = '/login';
};
lefamin.setLoginCookies=function(email, pd, token,autoLogin,userId)
{
  Cookies.set("userid", userId.toString());
  Cookies.set("email", email); Cookies.set("pd", pd); Cookies.set("token", token);
  Cookies.set("autoLogin",autoLogin?"1":"");
};

lefamin.user = { id: (Cookies.get("userid") ? parseInt(Cookies.get("userid")) : 0), email: Cookies.get("email"), pd: Cookies.get("pd"), token: Cookies.get("token"), autoLogin: (Cookies.get("autoLogin")=="1") };

lefamin.login = function (email, pd, done = msg => { })
{
  let user = lefamin.user; if(!email || !pd)
  {
    if (user.autoLogin == '1')
    {
      //console.log('start auto login');
      email = user.email; pd = user.pd;
    }
    else done(''); return;
  }  
  if(email && pd)
  {
    //console.log('start user click login');
    //console.log(email);   console.log(password); console.log('begin login request'); return;
    axios.post('/api/user/login',{email, pd}).then(r=>
    {
      r = r.data; console.log('/api/user/login', r); if (r.userId && r.token)
      {
        lefamin.setLoginCookies(email, pd, r.token, user.autoLogin, r.userId);
        //lefamin.showDebug(lefamin.text.json(lefamin.user))
        user.token = r.token; user.id = r.userId;
      }
      done(r);
    });
  }
  else 
  {
    done("缺少登录账号");
  }
};



//------------vue---------------------
function getData()
{
  axios.all(['head', 'foot'].map(p => axios.get(`/front/${p}.htm`)))
    .then(axios.spread((head, foot) =>
    {
      let ts = [head, foot]; if (!ts.every(t => t.statusText === "OK"))
      { console.log('get templates failed'); return; }
      VueComponents(ts.map(t => t.data));
      startVue();
    }));
}

function startVue()
{
  const routes = lefamin.routes.map(r =>
  { return { path: r.path, component: () => require2(`/front/${r.name}.js`) } }); //console.log(routes);
  const router = new VueRouter({ mode: 'history', routes });
  const app = new Vue(
    {
      el: '#pageCr',
      data:
      {
        site: lefamin,
        ui: { width: $(window).width(), height: $(window).height(), fontSize: 16, showSiteMenu: false }
      },
      router,
      methods:
      {
        goBack() { history.length > 1 ? this.$router.go(-1) : this.$router.push('/'); }
      },
      mounted: function ()
      {

      }
    });
}

function VueComponents([head, foot])
{  
  Vue.component('LefaminHead', 
  {
    props: { 'site': Object, 'ui': Object },
    data:function(){return {siteNameCrMarginLeft:"0",siteMenuCrWidth:"0"}},
    template: head, 
    methods:
    {
      setupUI()
      {
        if(this.siteNameCrMarginLeft!=0) return;
        let userCrWidth= $("#userCr").outerWidth()+1;
        let menuEntryCrWidth= $("#menuEntryCr").outerWidth()+1;
        let siteNameCrWidth= $("#siteNameCr").outerWidth()+1; 
        let r= this.ui.width-userCrWidth-menuEntryCrWidth-siteNameCrWidth; r=r/2-this.ui.fontSize*1.2;
        if(r==0) r=1; this.siteNameCrMarginLeft = r+"px";   
        this.siteMenuCrWidth=(this.ui.width-this.ui.fontSize*2.3)+"px";        
      },
      menuItemClick() { this.ui.showSiteMenu = false;}
    }, 
    mounted:function()
    {
      this.setupUI();
    }
  });
  Vue.component('LefaminFoot', 
  {
    props: { 'site': Object, 'ui': Object},
    template: foot, 
    methods:
    {
    
    }, 
    mounted:function()
    {    

    }
  }); 
  Vue.component('LefaminErrors', 
  {
    props: { 'errors': Array },
    template: '<div v-if="errors.length>0" class="errors"><div v-for="error in errors">{{error}}</div></div>'
  });
}



//---------------list--------------------
lefamin.getItemOrderNo = function (arr)
{
  let orderNo = 1; if (arr && arr.length > 0) orderNo = arr[arr.length - 1].data.orderNo + 1;
  return orderNo;
}
lefamin.makeItemV = function (item)
{
  return { data: item, old: {}, ui: { focus: false, unsaved: false, showMenu: false } };
}
lefamin.createNewItemV = function (temp, arr)
{
  return lefamin.makeItemV(Object.assign({ orderNo: lefamin.getItemOrderNo(arr) }, temp));
}



//----------------startup--------------
$(function ()
{
  document.title = lefamin.name;
  //lefamin.login(null, null, r => );
  getData();
});
