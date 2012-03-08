#include "MainWindow.h"
#include "ui_MainWindow.h"
#include <QtWebKit>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow) {

    QWebSettings* defaultSettings = QWebSettings::globalSettings();
    defaultSettings->setAttribute(QWebSettings::JavascriptEnabled, true);
    defaultSettings->setAttribute(QWebSettings::PluginsEnabled,true);
    defaultSettings->setAttribute(QWebSettings::DeveloperExtrasEnabled,true);

    ui->setupUi(this);
    QApplication::setApplicationName("Webbeans");
    jsQt = new JsQtHandler(this,ui->mainView);
    ui->verticalLayout->addWidget(jsQt->inspector);
    connect(ui->mainView->page(),SIGNAL(frameCreated(QWebFrame*)),this,SLOT(frameCreated(QWebFrame*)));

    connect(ui->mainView->page()->mainFrame(),SIGNAL(javaScriptWindowObjectCleared()),this,SLOT(loadFinished()));

    ui->mainView->page()->mainFrame()->addToJavaScriptWindowObject("$qt",jsQt);
}
void MainWindow::frameCreated(QWebFrame *frame) {
    frame->addToJavaScriptWindowObject("$qt",jsQt);
}
void MainWindow::loadFinished() {
    ui->mainView->page()->mainFrame()->addToJavaScriptWindowObject("$qt",jsQt);
}

MainWindow::~MainWindow() {
    delete jsQt;
    delete ui;
}
