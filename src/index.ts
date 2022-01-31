import {Application, NavigationControllerDelegate, ServiceGetter, ViewController} from "mentatjs";
import {SKSQLExplorerViewController} from "./SKSQLExplorerViewController";
import {SKSQL, TDBEventsDelegate, TAuthSession, WSRSQL, WSRDataRequest, TWSRDataResponse, WSROK} from "sksql";
import {SKDashboardViewController} from "./SKDashboardViewController";




class SKSQLExplorerApp extends Application implements NavigationControllerDelegate {

    applicationWillStart() {
        // init SKSQL

        let db = new SKSQL();
        db.initWorkerPool(0, "");

        let queryString = window.location.pathname;
        if (queryString !== "" && queryString.startsWith("/")) {
            queryString = queryString.substr(1);
        }

        this.loadDocument(queryString);




    }

    showDashboard() {
        this.navigationController.instantiateViewController("SKDashboardViewController", SKDashboardViewController, this);
    }

    viewControllerWasLoadedSuccessfully(viewController: ViewController) {
        this.navigationController.present(viewController);
    }

    loadDocument(doc: string) {
        this.navigationController.instantiateViewController("SKSQLExplorerViewController", SKSQLExplorerViewController, this);
    }


    on(message: string, payload: any) {
        if (message === WSRSQL) {
            Application.instance.notifyAll(this, "refreshTables");
        }
        if (message === WSROK) {
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