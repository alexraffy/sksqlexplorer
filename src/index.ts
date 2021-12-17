import {Application, NavigationControllerDelegate, ServiceGetter, ViewController} from "mentatjs";
import {SKSQLExplorerViewController} from "./SKSQLExplorerViewController";
import {DBData} from "sksql";


class SKSQLExplorerApp extends Application implements NavigationControllerDelegate {

    applicationWillStart() {
        // init SKSQL
        let _ = new DBData();
        _.initWorkerPool(4, "");

        this.navigationController.instantiateViewController("SKSQLExplorerViewController", SKSQLExplorerViewController, this);
    }

    viewControllerWasLoadedSuccessfully(viewController: ViewController) {
        this.navigationController.present(viewController);
    }

}

window.onload = () => {
    ServiceGetter.instance.initWeb();
    let a = new SKSQLExplorerApp();
    a.launch();
}