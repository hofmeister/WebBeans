package com.vonhof.webbeans.demo;

import com.vonhof.babelshark.BabelShark;
import com.vonhof.babelshark.language.JsonLanguage;
import com.vonhof.webi.FileRequestHandler;
import com.vonhof.webi.Webi;
import com.vonhof.webi.mvc.MVCRequestHandler;
import com.vonhof.webi.session.CookieSessionHandler;
import com.vonhof.webi.websocket.SocketService;
import java.io.File;
import java.sql.SQLException;
import org.hsqldb.server.Server;

public class DemoServer {
    public static void main( String[] args ) throws SQLException, Exception {
        
        BabelShark.register(new JsonLanguage());
        
        Server server = new Server();
        server.setNoSystemExit(true);
        
        final Webi webi = new Webi(8081);
        webi.addBean(server);
        webi.add("/socket/data", new SocketService<DataClient>(DataClient.class));
        
        webi.add("/", new CookieSessionHandler("DEMO"));
        
        final MVCRequestHandler mvcHandler = webi.add("/rest/",new MVCRequestHandler());
        mvcHandler.expose(new DataController());
        
        final FileRequestHandler fileHandler = webi.add("/", FileRequestHandler.getStandardFileHandler());
        File root = new File("../");
        fileHandler.setDocumentRoot(root.getAbsolutePath());
        
        webi.start();
    }
}
