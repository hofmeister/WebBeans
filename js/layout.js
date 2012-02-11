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
    header.add('test 2',function() {alert('Hej')});
    
    var base = new $wb.ui.BasePane(topbar, header);
    
        var mainSplitPane = new $wb.ui.SplitPane({vertical:true,splitPosition:.2});

            var rightPane = new $wb.ui.SplitPane({vertical:false,splitPosition:.8});

                var topPane = new $wb.ui.Pane();
                topPane.html('Top right!');
                var bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom right!');

                rightPane.set(0, topPane);
                rightPane.set(1, bottomPane);

            var leftPane = new $wb.ui.SplitPane({vertical:false,splitPosition:.8});

                var topPane = new $wb.ui.Pane();
                topPane.html('Top left!');
                var bottomPane = new $wb.ui.Pane();
                bottomPane.html('Bottom left!');

                leftPane.set(0, topPane);
                leftPane.set(1, bottomPane);

            mainSplitPane.set(0, leftPane);
            mainSplitPane.set(1, rightPane);
    
    base.add(mainSplitPane);
    
    base.render($('body'));
});