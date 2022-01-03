import {Application, NavigationControllerDelegate, ServiceGetter, ViewController} from "mentatjs";
import {SKSQLExplorerViewController} from "./SKSQLExplorerViewController";
import {DBData, TDBEventsDelegate, TAuthSession, WSRSQL, WSRDataRequest, TWSRDataResponse} from "sksql";
import {CWebSocket} from "../../sksql/build/WebSocket/CWebSocket";



class SKSQLExplorerApp extends Application implements NavigationControllerDelegate, TDBEventsDelegate {

    applicationWillStart() {
        // init SKSQL
        let _ = new DBData(this, "ws://localhost:30000");
        _.initWorkerPool(0, "");

        this.navigationController.instantiateViewController("SKSQLExplorerViewController", SKSQLExplorerViewController, this);
    }

    viewControllerWasLoadedSuccessfully(viewController: ViewController) {
        this.navigationController.present(viewController);
    }

    on(message: string, payload: any) {
        if (message === WSRSQL) {
            Application.instance.notifyAll(this, "refreshTables");
        }
        if (message === WSRDataRequest) {
            let p = payload as TWSRDataResponse;
            if (p.type === "T") {
                Application.instance.notifyAll(this, "refreshTables");
            }
        }
    }

    authRequired(): TAuthSession {
        return {
            valid: true,
            name: "User"
        }
    }

    connectionLost() {

    }

}

window.onload = () => {
    ServiceGetter.instance.initWeb();
    let a = new SKSQLExplorerApp();
    a.launch();
}