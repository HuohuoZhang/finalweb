const template = await axios.get('/front/todo.htm');
const text2 = await require2("/common/text.js");
const lefa = global.lefamin;
const taskTemp = { content: null };
const todosTableName = 'todos';

if(!lefa.checkLogin()) module.exports=
{
  data: () => ({
    data:null, active: [], activeS:[],  past: [], pastS:[] , newTask: lefa.createNewItemV(taskTemp), searchKey:null
    , tabs: [{ title: '待办', content: 'tasks_activeCr', listData: [] }, { title: '已完成', content: 'tasks_pastCr', listData: [] }]
    , currentTabIndex: 0
  }),
  computed:
  {
    tabLists:
    {
      get: function ()
      {
        return [this.active2, this.past2];
      }
    },
    active2:
    {
      get: function ()
      {
        return this.searchKey ? this.activeS : this.active;
      }
    },
    past2:
    {
      get: function ()
      {
        return this.searchKey ? this.pastS : this.past;
      }
    },
    focusTask: 
    {
      get: function ()
      {
        return this.focusTask_;
      },
      set: function (newValue)
      {
        let cf = this.focusTask_; if (newValue == cf) return; if (cf)
        {
          cf.ui.focus = false; if (cf.data.content != cf.old.content)
          {
            this.updateTaskContent(cf);
          }
        }
        this.focusTask_ = newValue; if (this.focusTask_)this.focusTask_.ui.focus = true;
      }
    }
  },
  template: template.data,   
  methods:
  {
    getData()
    {
      axios.post('/api/db/get_equal/' + todosTableName, { name: 'owner', value: lefa.user.id, type: 'INTEGER' }).then(r =>
      {
        if (lefa.checkResult(r.data)) return; //console.log(r.data); 
        let data = r.data.map(t =>
        {
          if (!t.orderNo) t.orderNo = 99999; this[t.status ? t.status : 'active'].push(lefa.makeItemV(t)); return t;
        });
        this.data = data;
        this.active = Enumerable.from(this.active).orderBy(t => t.data.orderNo).toArray();
        this.past = this.past; this.newTask.data.orderNo = lefa.getItemOrderNo(this.active);
        this.tabs[0].listData = this.active; this.tabs[1].listData = this.past;
      });
    },
    clickTab(tabIndex)
    {
      this.currentTabIndex = tabIndex; this.focusTask = null;
    },
    search()
    {
      let key = this.searchKey;
      this.activeS = text2.search(this.active, key, 'data.content'); //console.log(this.activeS);
      this.pastS = text2.search(this.past, key, 'data.content');
    },
    createTask()
    {
      let taskObj = lefa.makeItemV(this.newTask.data); this.active.push(taskObj);// console.log(taskObj.data); 
      this.newTask = lefa.createNewItemV(taskTemp, this.active); //console.log(this.newTask.data); return;
      axios.post('/api/db/create/' + todosTableName, taskObj.data).then(r =>
      {
        r = r.data; if (lefa.checkResult(r)) return; //console.log('create task result: '); 
        console.log(r); taskObj.data.id = r.id; taskObj.old.id = r.id;
      });
    },
    updateTaskContent(taskObj)
    {
      let url = '/api/db/update/' + todosTableName+"/" + taskObj.data.id, content = taskObj.data.content;
      //console.log(`send update ${url} ${content}`);
      axios.post(url, { content}).then(r =>
      {
        taskObj.old.content = taskObj.data.content;
      });
    },
    deleteTask(taskObj, arr)
    {
      arr.splice(arr.indexOf(taskObj), 1);
      let url = '/api/db/disable/' + todosTableName+"/" + taskObj.data.id; // console.log(`send delete ${url}`);
      axios.get(url).then(r =>
      {
      });
    },
    completeTask(taskObj)
    {
      taskObj.status = 'past'; taskObj.ui.showMenu = false; this.focusTask = null;
      let arr = this.active; arr.splice(arr.indexOf(taskObj), 1); this.past.splice(0, 0, taskObj);
      let url = '/api/db/update/' + todosTableName+"/" + taskObj.data.id; //console.log(`send update ${url} ${taskObj.status}`);
      axios.post(url, { status: taskObj.status }).then(r =>
      {
      });
    },
    topTask(taskObj, arr)
    {
      let data = taskObj.data; data.orderNo = 1; taskObj.ui.showMenu = false; this.focusTask = null;
      arr.splice(arr.indexOf(taskObj), 1); arr.splice(0, 0, taskObj);
      let url = '/api/db/update/' + todosTableName+"/" + data.id; //console.log(`send update ${url} ${data.orderNo}`);
      axios.post(url, { orderNo: data.orderNo }).then(r =>
      {
      });
      arr.filter(t => t != taskObj).map(t =>
      {
        let data = t.data; data.orderNo++;
        let url = '/api/db/update/' + todosTableName +"/"+ data.id;// console.log(`send update ${url} ${data.orderNo }`);
        axios.post(url, { orderNo: data.orderNo }).then(r =>
        {
        });
      });
    }
  },
  mounted()
  {
    if (this.data) return;  this.getData();
    setInterval(() =>
    {

    }, 2000);
  } 
};


