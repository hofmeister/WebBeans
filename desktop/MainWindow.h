#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include "JsQtHandler.h"
#include <QtWebKit>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT
    
public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();
    
public slots:
    void frameCreated(QWebFrame* frame);
    void loadFinished();
private:
    Ui::MainWindow *ui;
    JsQtHandler *jsQt;


};

#endif // MAINWINDOW_H
