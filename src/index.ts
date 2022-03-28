import {Application, NavigationControllerDelegate, ServiceGetter, ViewController} from "mentatjs";
import {SKSQLExplorerViewController} from "./SKSQLExplorerViewController";
import {SKSQL, TDBEventsDelegate, TAuthSession, WSRSQL, WSRDataRequest, TWSRDataResponse, WSROK} from "sksql";
import {SKDashboardViewController} from "./SKDashboardViewController";




class SKSQLExplorerApp extends Application implements NavigationControllerDelegate {

    dbs: SKSQL[];

    applicationWillStart() {
        this.navigationController.instantiateViewController("SKSQLExplorerViewController", SKSQLExplorerViewController, this);

    }

    showDashboard() {
        this.navigationController.instantiateViewController("SKDashboardViewController", SKDashboardViewController, this);
    }

    viewControllerWasLoadedSuccessfully(viewController: ViewController) {
        //@ts-ignore
        viewController.dbs = this.dbs;
        this.navigationController.present(viewController);
    }

    loadDocument(doc: string) {

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

    // init SKSQL
    let db = new SKSQL();
    db.initWorkerPool(0, "");

    let queryString = window.location.pathname;
    if (queryString !== "" && queryString.startsWith("/")) {
        queryString = queryString.substr(1);
    }
    if (queryString.indexOf('/') > -1) {
        let arr = queryString.split("/");
        queryString = arr[arr.length -1];
    }
    if (queryString.startsWith("index.html")) {
        queryString = "wss://sksql.com/ws/30000";
    }
    let connectionString = queryString;


    db.connectToDatabase(connectionString, {
        authRequired(db: SKSQL, databaseHashId: string): TAuthSession {
            return { valid: true, name: "User", token: ""} as TAuthSession;
        },
        on(db: SKSQL, databaseHashId: string, message: string, payload: any) {

        },
        ready: (db: SKSQL, databaseHashId: string) => {
            Application.instance.notifyAll(this, "refreshTables");
        },
        connectionLost(db: SKSQL, databaseHashId: string) {
            console.log("Connection Lost");
        },
        connectionError(db: SKSQL, databaseHashId: string, error: string): any {
            console.log("Connection Error: " + error);
        }
    });

    ServiceGetter.instance.initWeb();
    let a = new SKSQLExplorerApp();
    a.dbs = [db];
    a.launch();
}