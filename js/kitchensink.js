$(function() {

    var topbar = new $wb.ui.TopBar();

    topbar.add('File',[
        {title:"Open...",arg:function() {alert('OPEN!');}},
        {title:"Save",arg:function() {alert('Save!');}},
        {title:"Save as...",arg:function() {alert('Save ASS!');}},
        {title:"Log out",arg:function() {alert('Log out!');}}
    ]);

    topbar.add('Tools',[
        {title:"View",arg:function() {alert('OPEN!');}},
        {title:"Preferences...",arg:function() {alert('Save!');}}
    ]);


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
                        
                        var input = new $wb.ui.form.TextField(
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
                            {   name:'thetext',
                                label:'Text Area',
                                labelPosition:'right'});
                        form.add(input);
                        
                        input = new $wb.ui.form.Select(
                            {name:'theselect',label:'Selector'});
                        input.add("first option");
                        input.add(2,"second option");
                        form.add(input);
                        
                    var tStore = new $wb.data.TableStore();
                    tStore.setColumns("id","name");
                    tStore.addAll([
                        {id:"marx",name:"Karl",age:28},
                        {id:"jimbo",name:"Jim",age:54},
                        {id:"jfk",name:"Johnny",age:54},
                        {id:"fil",name:"Schopenhauer",age:54}
                    ]);
                    
                    var table = new $wb.ui.Table({
                        store:tStore
                    });
                    
                    $wb.registry.register('tstore',tStore);
                    $wb.registry.register('table',table);
                    
                    var tablePane = new $wb.ui.Pane();
                    tablePane.add(table)
                    
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

                    
                    var form = new $wb.ui.Pane();
                    form.html('Tab 2!');
                    


                    var accordionTab = new $wb.ui.Pane();
                        var accordion = new $wb.ui.Accordion();

                        accordion.add('Mail',[
                            {title:"Inbox"},
                            {title:"Sent"},
                            {title:"Drafts"},
                            {title:"Spam"},
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



                    var table = new $wb.ui.Pane();
                    table.html('Tab 3!');

                    topPane.add("Tree",treeTab);
                    topPane.add("Accordion",accordion);
                    topPane.add("Tab 3",table);
                var bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom left!');

                leftPane.set(0, topPane);
                leftPane.set(1, bottomPane);
                
            

            mainSplitPane.set(0, leftPane);
            mainSplitPane.set(1, rightPane);

    base.add(mainSplitPane);

    base.render($('body'));
});
