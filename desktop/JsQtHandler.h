#ifndef JSMENUHANDLER_H
#define JSMENUHANDLER_H

#include <QObject>
#include <QtWebKit>
#include <QMenu>
#include <QMenuBar>

class MainWindow;

class JsQtHandler : public QObject
{
    Q_OBJECT
public:
    QWebInspector *inspector;
    MainWindow* main;
    QWebView *webView;
    QMap<QString, QMenu*> menus;
    QMap<QString, QAction*> actions;
    QSignalMapper* signalMapper;

    JsQtHandler(MainWindow *main,QWebView *webView);

    Q_INVOKABLE QWidget* addMenu(const QString id,const QString name);
    Q_INVOKABLE QWidget* addMenu(const QString parentId,const QString id,const QString name);
    Q_INVOKABLE QObject* addMenuItem(const QString parentId,const QString id, const QString name);
    Q_INVOKABLE void removeMenu(const QString id);
    Q_INVOKABLE void toggleDebug();
    Q_INVOKABLE void setTitle(const QString name);
public slots:
    void triggerMenu(QString menuId);
signals:
    void menuClicked(QString menuId);

};

#endif // JSMENUHANDLER_H
