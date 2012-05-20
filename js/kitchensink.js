/**
 * @fileOverview
 * Demo application using usually all elements available in webbeans
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */

$(function() {
    
    var prefPane = new $wb.ui.Pane();
    prefPane.html('Preferences!');
    var showPrefPane = function() {
        $wb.ui.Window.open({title:"Preferences",content:prefPane});
    };
    if (window.$qt) {
        $qt.setTitle($('title').html());
        $qt.addMenu("file","File");
            $qt.addMenuItem("file","open","Open...");
            $qt.addMenuItem("file","debug","Debug");
            $qt.addMenuItem("file","saveas","Save as..");
            $qt.addMenuItem("file","logout","Log out");
        $qt.addMenu("tools","Tools");
            $qt.addMenuItem("tools","prefs","Prefs");
            $qt.addMenuItem("tools","view","View");
        $qt.menuClicked.connect(function(menuId) {
            switch(menuId) {
                case 'open':
                    alert('OPEN!');
                    return;
                case 'logout':
                    alert('Log out!');
                    return;
                case 'view':
                    alert('View it!');
                    return;
                case 'prefs':
                    showPrefPane();
                    return;
            }
            
        });
            
    } else {
        var topbar = new $wb.ui.TopBar();

        topbar.add('File',[
            {title:"Open...",arg:function() {alert('OPEN!');}},
            {title:"Debug",arg:function() {
                    if (window.$qt) {
                        window.$qt.toggleDebug();
                    }
            }},
            {title:"Save as...",arg:function() {alert('Save ASS!');}},
            {title:"Log out",arg:function() {alert('Log out!');}}
        ]);

        topbar.add('Tools',[
            {title:"View",arg:function() {alert('OPEN!');}},
            {title:"Preferences...",arg:showPrefPane}
        ]);
    }

    var header = new $wb.ui.Header();
    header.add('Create',function() {alert('Action!');});
    
    var context = new $wb.ui.ContextMenu();
    context.add([
        {title:"Test",arg:function() {
            console.log(context.source());
        }},
        {title:"Save",arg:function() {alert('Save!');}},
        {title:"Save as...",arg:function() {alert('Save ASS!');}},
        {title:"Log out",arg:function() {alert('Log out!');}}
    ]);
    
    if (window.$qt) {
        context.add([{title:'Debug',arg:function() {
            window.$qt.toggleDebug();
        }}]);
        context.add([{title:'Reload',arg:function() {
            location.reload();
        }}]);
    }

    var base = new $wb.ui.BasePane(topbar, header);
    
        

        var mainSplitPane = new $wb.ui.SplitPane({vertical:true,splitPosition:.2,id:'main'});

            var rightPane = new $wb.ui.SplitPane({vertical:false,splitPosition:.8});
                rightPane.setContextMenu(context);
            
                var topPane = new $wb.ui.TabPane({orientation:'bottom'});
                
                    var htmlPane = new $wb.ui.HtmlPane({editable:true});
                    htmlPane.html('<p>All sorts of HTML</p><p style="color:blue;">All sorts of HTML</p><b>All sorts of HTML</b><p>All sorts of HTML</p><i>All sorts of HTML</i>');
                    
                    var form = new $wb.ui.form.Form();
                        var input = new $wb.ui.form.TextField(
                            {name:'textinput',
                                label:'Text Input',
                                labelPosition:'top'});
                        form.add(input);
                        
                        input = new $wb.ui.form.TextField(
                            {name:'textinput',
                                label:'Text Input label inside',
                                labelPosition:'inside'});
                        form.add(input);
                        
                        
                        input = new $wb.ui.form.CheckBox(
                            {
                                name:'checkinput',
                                label:'Checkbox',
                                labelPosition:'right'
                        });
                        form.add(input);
                        
                        input = new $wb.ui.form.RadioButton(
                            {
                                name:'radiobtn',
                                label:'Radio button',
                                labelPosition:'right'
                            }
                        );
                        form.add(input);
                        
                        input = new $wb.ui.form.TextArea(
                            {name:'thetext',
                                label:'Text Area',
                                labelPosition:'right'});
                        form.add(input);
                        
                        input = new $wb.ui.form.Select(
                            {name:'theselect',label:'Selector'});
                        input.add("first option");
                        input.add(2,"second option");
                        form.add(input);
                    
                    var model = new $wb.data.Model('entry',{
                        id:{name:"ID",valueType:"number",primary:true},
                        name:{name:"Name",valueType:"string"},
                        description:{name:"Description",valueType:"string"},
                        created:{name:"Created",valueType:"date",defaultValue:function() {return new Date();}},
                        tags:{name:"Tags",valueType:"string"}
                    });
                        
                    var tStore = new $wb.data.TableStore({model:model});
                    
                    window.entryService = new $wb.data.Service({
                        adder:function(rows) {
                            $.ajax({
                                type:"POST",
                                url:"/rest/data/add",
                                data:JSON.stringify(rows),
                                processData:false,
                                contentType:"application/json",
                                success:function(rows) {
                                    //tStore.addAll(rows);
                                }
                            });
                        },
                        updater:function(rows) {
                            $.ajax({
                                type:"POST",
                                url:"/rest/data/update",
                                processData:false,
                                data:JSON.stringify(rows),
                                contentType:"application/json",
                                success:function(rows) {
                                    //tStore.addAll(rows);
                                }
                            });
                        },
                        remover:function(keys) {
                            $.ajax({
                                type:"POST",
                                url:"/rest/data/delete",
                                processData:false,
                                data:JSON.stringify(keys),
                                contentType:"application/json",
                                success:function(rows) {
                                    //tStore.removeAll(keys);
                                }
                            });
                        },
                        loader:function() {
                            $.get("/rest/data/list",function(rows) {
                                tStore.addAll(rows);
                            });
                        },
                        getter:function(id) {
                            $.get("/rest/data/get",{id:id},function(row) {
                                tStore.add(row);
                            });
                        },
                        listener:function() {
                            var ws = new WebSocket("ws://localhost:8081/socket/data");
                            ws.onmessage = function(evt) {
                                var data = JSON.parse(evt.data);
                                var pl = data.args[0];
                                switch (data.type) {
                                    case 'added':
                                        tStore.addAll(pl);
                                        break;
                                    case 'updated':
                                        tStore.addAll(pl);
                                        break;
                                    case 'deleted':
                                        tStore.removeAll(pl);
                                        break;
                                }
                            };
                            

                            return ws;
                        }
                    });
                    
                    var table = new $wb.ui.Table({
                        store:tStore
                    });
                    
                    $wb.registry.register('entryStore',tStore);
                    $wb.registry.register('table',table);
                    
                    var tablePane = new $wb.ui.Pane();
                    tablePane.add(table);
                    
                    topPane.add("Html",htmlPane);
                    topPane.add("Form",form);
                    topPane.add("Table",tablePane);
                    
                var bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom right!');

                rightPane.set(0, topPane);
                rightPane.set(1, bottomPane);


            var leftPane = new $wb.ui.SplitPane({vertical:false,splitPosition:.8});

                topPane = new $wb.ui.TabPane({tabButtonFull:true});

                    var treeTab = new $wb.ui.Pane();
                        var tree = new $wb.ui.Tree({hideRoot:true});
                        tree.add('root',[
                            {title:'Servers',
                                arg:[
                                    {title:'eu cluster',
                                        arg:[
                                            {title:"service1"},
                                            {title:"service2"},
                                            {title:"web1"},
                                            {title:"web2"}
                                        ]
                                    }
                                ]},
                            {title:'Roles',
                                arg:[
                                    {title:"web"},
                                    {title:"couchdb"},
                                    {title:"rabbitmq"},
                                    {title:"worker"},
                                    {title:"service"}
                                ]}
                        ]);
                        treeTab.add(tree);

                    
                    form = new $wb.ui.Pane();
                    form.html('Tab 2!');
                    


                    var accordionTab = new $wb.ui.Pane();
                        var accordion = new $wb.ui.Accordion();

                        accordion.add('Mail',[
                            {title:"Inbox"},
                            {title:"Sent"},
                            {title:"Drafts"},
                            {title:"Spam"}
                        ]);
                        accordion.add('Calendar',[
                            {title:"Private"},
                            {title:"Public"},
                            {title:"Work"}
                        ]);

                        accordion.add('Tasks',[
                            {title:"Private"},
                            {title:"Public"},
                            {title:"Work"}
                        ]);
                    accordionTab.add(accordion);



                    table = new $wb.ui.Pane();
                    table.html('Tab 3!');

                    topPane.add("Tree",treeTab);
                    topPane.add("Accordion",accordion);
                    topPane.add("Tab 3",table);
                bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom left!');

                leftPane.set(0, topPane);
                leftPane.set(1, bottomPane);
                
            

            mainSplitPane.set(0, leftPane);
            mainSplitPane.set(1, rightPane);

    base.add(mainSplitPane);

    base.render($('body'));
});
