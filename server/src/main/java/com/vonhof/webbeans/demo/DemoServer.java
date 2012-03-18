package com.vonhof.webbeans.demo;

import com.vonhof.babelshark.BabelShark;
import com.vonhof.babelshark.language.JsonLanguage;
import com.vonhof.webi.FileRequestHandler;
import com.vonhof.webi.Webi;
import com.vonhof.webi.rest.RESTRequestHandler;
import java.io.File;
import java.sql.SQLException;

public class DemoServer {
    public static void main( String[] args ) throws SQLException, Exception {
        
        BabelShark.getInstance().register(new JsonLanguage());
        
        final Webi server = new Webi(8081);
        final RESTRequestHandler restHandler = new RESTRequestHandler();
        
        restHandler.expose(new DataController());
        
        server.add("/rest/",restHandler);
        
        final FileRequestHandler fileHandler = FileRequestHandler.getStandardFileHandler();
        
        File root = new File("../");
        
        fileHandler.setDocumentRoot(root.getAbsolutePath());
        
        server.add("/", fileHandler);
        
        server.start();
    }
}
