$(function() {
    
    var topbar = new $wb.ui.TopBar();
    topbar.add('test',function() {alert('Hej')});
    
    var header = new $wb.ui.Header();
    header.add('test 2',function() {alert('Hej')});
    
    var base = new $wb.ui.BasePane(topbar, header);
    
    var mainSplitPane = new $wb.ui.SplitPane({vertical:true});
    
    var leftPane = new $wb.ui.Pane();
    leftPane.html('Left!');
    
    
    var rightPane = new $wb.ui.SplitPane({vertical:true});
    
    var topPane = new $wb.ui.Pane();
    topPane.html('Top!');
    var bottomPane = new $wb.ui.Pane();
    bottomPane.html('Bottom!');
    
    rightPane.set(0, topPane);
    rightPane.set(1, bottomPane);
    
    mainSplitPane.set(0, leftPane);
    mainSplitPane.set(1, rightPane);
    
    base.add(mainSplitPane);
    
    base.render($('body'));
});