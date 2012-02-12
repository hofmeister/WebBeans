$(function() {
    
    var topbar = new $wb.ui.TopBar();
    
    topbar.add('File',[
        {title:"Open...",arg:function() {alert('OPEN!')}},
        {title:"Save",arg:function() {alert('Save!')}},
        {title:"Save as...",arg:function() {alert('Save ASS!')}},
        {title:"Log out",arg:function() {alert('Log out!')}}
    ]);
    
    topbar.add('Tools',[
        {title:"View",arg:function() {alert('OPEN!')}},
        {title:"Preferences...",arg:function() {alert('Save!')}}
    ]);
    
    
    var header = new $wb.ui.Header();
    header.add('Create',function() {alert('Action!')});
    
    var base = new $wb.ui.BasePane(topbar, header);
    
        var mainSplitPane = new $wb.ui.SplitPane({vertical:true,splitPosition:.2,id:'main'});

            var rightPane = new $wb.ui.SplitPane({vertical:false,splitPosition:.8});
            
                var topPane = new $wb.ui.TabPane({orientation:'bottom'});
                
                    var htmlPane = new $wb.ui.HtmlPane({editable:true});
                    htmlPane.html('<p>All sorts of HTML</p><p>All sorts of HTML</p><p>All sorts of HTML</p><p>All sorts of HTML</p><p>All sorts of HTML</p>');
                    
                    var tab2 = new $wb.ui.Pane();
                    tab2.html('Tab 2!');
                    
                    var tab3 = new $wb.ui.Pane();
                    tab3.html('Tab 3!');
                    
                    topPane.add("Html",htmlPane);
                    topPane.add("Tab 2",tab2);
                    topPane.add("Tab 3",tab3);
                    
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
                    
                    var tab2 = new $wb.ui.Pane();
                    tab2.html('Tab 2!');
                    
                    var tab3 = new $wb.ui.Pane();
                    tab3.html('Tab 3!');
                    
                    topPane.add("Tree",treeTab);
                    topPane.add("Tab 2",tab2);
                    topPane.add("Tab 3",tab3);
                var bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom left!');

                leftPane.set(0, topPane);
                leftPane.set(1, bottomPane);

            mainSplitPane.set(0, leftPane);
            mainSplitPane.set(1, rightPane);
    
    base.add(mainSplitPane);
    
    base.render($('body'));
});