#include "JsQtHandler.h"
#include "MainWindow.h"
#include "ui_MainWindow.h"
#include <QtGui/QVBoxLayout>

JsQtHandler::JsQtHandler(MainWindow *main, QWebView *webView) {
    this->main = main;
    this->webView = webView;
    inspector = new QWebInspector(webView);
    inspector->setVisible(false);
    inspector->setPage(webView->page());
    signalMapper = new QSignalMapper(this);
    connect(signalMapper,SIGNAL(mapped(QString)),this,SLOT(triggerMenu(QString)));
}

void JsQtHandler::triggerMenu(QString menuId) {
    emit(menuClicked(menuId));
}

QWidget* JsQtHandler::addMenu(const QString parentId,const QString id, const QString name) {
    QMenu *parent = menus[parentId];
    if (parent == 0)
        return 0;

    if (menus.contains(id)) {
        return menus[id];
    }

    QMenu *menu = parent->addMenu(name);
    menu->setObjectName(id);
    menus[id] = menu;
    return menu;
}
QWidget* JsQtHandler::addMenu(const QString id, const QString name) {
    QMenuBar *parent = main->menuBar();

    if (menus.contains(id)) {
        return menus[id];
    }

    QMenu *menu = parent->addMenu(name);
    menu->setObjectName(id);
    menus[id] = menu;
    return menu;
}

QObject* JsQtHandler::addMenuItem(const QString parentId,const QString id, const QString name) {
    QMenu *parent = menus[parentId];
    if (parent == 0)
        return 0;

    if (actions.contains(id)) {
        return actions[id];
    }


    QAction *menu = parent->addAction(name);
    signalMapper->setMapping(menu,id);
    connect(menu,SIGNAL(triggered()),signalMapper,SLOT(map()));
    menu->setObjectName(id);
    actions[id] = menu;
    return menu;
}

void JsQtHandler::removeMenu(const QString id) {
    if (menus.contains(id) && menus[id]->isVisible())
        menus[id]->setVisible(false);
    else if (actions.contains(id))
        actions[id]->setVisible(false);
}
void JsQtHandler::setTitle(const QString name) {
    main->setWindowTitle(name);
}

void JsQtHandler::toggleDebug() {
    if (inspector->isVisible()) {
        inspector->setVisible(false);
    } else {
        inspector->setVisible(true);
    }
}

