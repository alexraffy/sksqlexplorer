import {Application, NavigationControllerDelegate, ServiceGetter, ViewController} from "mentatjs";
import {SKSQLExplorerViewController} from "./SKSQLExplorerViewController";
import {SKSQL, TDBEventsDelegate, TAuthSession, WSRSQL, WSRDataRequest, TWSRDataResponse, WSROK} from "sksql";
import {SKDashboardViewController} from "./SKDashboardViewController";




class SKSQLExplorerApp extends Application implements NavigationControllerDelegate {

    db: SKSQL;

    applicationWillStart() {
        // init SKSQL

        this.db = new SKSQL();
        this.db.initWorkerPool(0, "");

        let queryString = window.location.pathname;
        if (queryString !== "" && queryString.startsWith("/")) {
            queryString = queryString.substr(1);
        }

        this.db.connectToServer("ws://localhost:30000", {
            authRequired(db: SKSQL, databaseHashId: string): TAuthSession {
                return { valid: true, name: "Alex", token: ""} as TAuthSession;
            },
            on(db: SKSQL, databaseHashId: string, message: string, payload: any) {

            },
            ready: (db: SKSQL, databaseHashId: string) => {
                this.loadDocument(queryString);
            },
            connectionLost(db: SKSQL, databaseHashId: string) {
                console.log("Connection Lost");
            },
            connectionError(db: SKSQL, databaseHashId: string, error: string): any {
                console.log("Connection Error: " + error);
            }
        })






    }

    showDashboard() {
        this.navigationController.instantiateViewController("SKDashboardViewController", SKDashboardViewController, this);
    }

    viewControllerWasLoadedSuccessfully(viewController: ViewController) {
        //@ts-ignore
        viewController.db = this.db;
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