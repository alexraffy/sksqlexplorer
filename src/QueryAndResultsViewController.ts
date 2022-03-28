import {
    Application,
    Bounds,
    Btn, Drp,
    fillParentBounds, generateV4UUID, Label,
    NavigationController,
    NUConvertToPixel,
    px,
    Tabs,
    Toolbar,
    View,
    ViewController
} from "mentatjs";
import {Theme} from "./Theme";
import * as codemirror from "codemirror";
import {SKSQL, SQLResult, SQLStatement} from "sksql";
import {SKSQLExplorerView} from "./SKSQLExplorerView";
import {ResultsTableViewController} from "./ResultsTableViewController";
import {SQLErrorViewController} from "./SQLErrorViewController";

export class QueryAndResultsViewController extends ViewController {

    queryID: string;
    query: string;
    db: SKSQL[];
    private toolbarActions: Toolbar;
    private codeMirror: any;
    private resultsTab: Tabs;
    private resultsView: View;

    private tabs: {
        id: string;
        view: View;
        nav: NavigationController;
        viewController: ViewController;
        tableName: string;
        type: "QUERY" | "MESSAGE" | "EXECUTIONPLAN"
    }[] = [];

    constructor() {
        super();
    }

    viewForViewController(): View {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        v.viewWasAttached = () => {
            let toolbar = new Toolbar();
            toolbar.styles = Theme.toolbarStyle;
            toolbar.boundsForView = function (parentBounds) {
                return new Bounds(10, 5, NUConvertToPixel(parentBounds.width).amount - 20, 32);
            }
            toolbar.controls = [{
                id: "execute",
                width: 100,
                isSpace: false,
                viewFn: () => {
                    let b = new Btn();
                    b.styles = Theme.buttonActionStyle;
                    b.text = "Execute";
                    b.setActionDelegate(this, "onExecute");
                    return b;
                }
            },{
                id: "selectDB",
                width: 150,
                isSpace: false,
                viewFn: () => {
                    if (this.db.length > 1) {
                        let v = new Drp();
                        v.styles = Theme.dropdownStyle;
                        v.dataSource = [];
                        for (let i = 0; i < this.db.length; i++) {
                            if (this.db[i].connections.length > 0) {
                                v.dataSource.push(
                                    {
                                        id: this.db[i].connections[0].databaseHashId,
                                        text: this.db[i].connections[0].databaseHashId
                                    }
                                );
                            }
                        }
                        return v;
                    } else {
                        let v = new View();
                        return v;
                    }
                }
            }];
            toolbar.initView(v.id + ".toolbar");
            v.attach(toolbar);
            this.toolbarActions = toolbar;

            let fnBody = new View();
            fnBody.boundsForView = function (parentBounds) {
                return new Bounds(5, 42, NUConvertToPixel(parentBounds.width).amount - 10, 300 );
            }
            fnBody.viewWasAttached = () => {
                let status = new Label();
                let myCodeMirror = codemirror(fnBody.getDiv(), {
                    lineNumbers: true,
                    lineWrapping: true,
                    readOnly: false,
                    value: this.query,
                    mode: "text/javascript"
                });
                let bounds = fnBody.getBounds("");
                myCodeMirror.setOption("theme", "idea");
                myCodeMirror["fnID"] = "";
                myCodeMirror.on("change", () => {
                    let newCode = myCodeMirror.getValue();
                });
                myCodeMirror.on("cursorActivity", () => {
                    let pos = myCodeMirror.getCursor();
                    let str = "Line " + pos.line + " Column " + pos.ch;
                    status.setText(str);
                });
                myCodeMirror.setSize(NUConvertToPixel(bounds.width).amount + "px", 280 + "px");
                myCodeMirror.refresh();
                this.codeMirror = myCodeMirror;


                status.boundsForView = function (parentBounds) {
                    return new Bounds(0, NUConvertToPixel(parentBounds.height).amount - 20, NUConvertToPixel(parentBounds.width).amount, 20);
                }
                status.styles = Theme.labelStyleSmall;
                status.initView(fnBody.id + ".status");
                fnBody.attach(status);


            }
            fnBody.initView("body");
            v.attach(fnBody);

            let resultTabs = new Tabs();
            resultTabs.boundsForView = function (parentBounds) {
                let y = 342 + 5;
                return new Bounds(5,
                    y,
                    NUConvertToPixel(parentBounds.width).amount - 10,
                    32
                    );
            }
            resultTabs.dataSource = [
                {
                    id: "message",
                    width: 100,
                    text: "Messages"
                }
            ];
            resultTabs.selectedId = "message";
            resultTabs.styles = Theme.titleBarStyle;
            resultTabs.initView(this.id + ".resultTabs");
            v.attach(resultTabs);
            this.resultsTab = resultTabs;

            let resultsContainer = new View();
            resultsContainer.boundsForView = function (parentBounds) {
                let y = 342 + 5 + 32 + 5;
                return new Bounds(
                    5,
                    y,
                    NUConvertToPixel(parentBounds.width).amount - 10,
                    NUConvertToPixel(parentBounds.height).amount - y - 5
                    );
            }
            resultsContainer.initView(this.id + ".resultsContainer");
            v.attach(resultsContainer);
            this.resultsView = resultsContainer;



        }
        return v;
    }

    getCurrentDB() {

        if (this.db.length === 0) {
            return undefined;
        }
        if (this.db.length === 1) {
            return this.db[0];
        } else if (this.db.length > 1) {
            let drp = this.toolbarActions.findControlForId("selectDB") as Drp;
            let conn = drp.selectedID;
            for (let i = 0; i < this.db.length; i++) {
                if (this.db[i].connections.length > 0) {
                    if (this.db[i].connections[0].databaseHashId === conn) {
                        return this.db[i];
                        break;
                    }
                }
            }
        }
        return undefined;
    }


    viewWasPresented() {

    }


    onExecute() {

        let gotErrors = false;
        let gotMessages = false;
        let gotResults = false;
        let gotExecutionPlan = false;
        let error = "";
        let message = "";

        requestAnimationFrame( () => {
            let btn = this.toolbarActions.findControlForId("execute") as Btn;
            btn.setText("<span style='font-family: FontAwesome5FreeSolid'>&#xf110;</span>&nbsp;Execute")
            btn.setEnabled(false);
            this.resultsTab.dataSource = [];
            this.resultsTab.processStyleAndRender("", []);

            for (let i = this.tabs.length - 1; i > 0; i--) {
                let t = this.tabs[i];
                t.nav.clear();
                t.nav.destroy();
                t.view.detachItSelf();
                this.tabs.splice(i, 1);
            }
            requestAnimationFrame( () => {
                let value = this.codeMirror.getValue();
                let db = this.getCurrentDB();
                let sql = new SQLStatement(db, value, true);
                let ret: SQLResult;
                try {
                    ret = sql.run() as SQLResult;
                } catch (excep) {
                    ret = {
                        error: excep.message + "\r\n<br/>" + JSON.stringify(excep.stack),
                        rowCount: 0,
                        rowsDeleted: 0,
                        rowsInserted: 0,
                        rowsModified: 0,
                        resultTableName: "",
                        messages: excep.stack,
                        queries: [],
                        totalRuntime: 0,
                        parserTime: 0
                    } as SQLResult;
                }
                if (ret.error !== undefined) {
                    gotErrors = true;
                    error = ret.error;
                }
                if (ret.resultTableName !== "") {
                    gotResults = true;
                }


                if (gotErrors) {
                    let id = generateV4UUID();
                    this.resultsTab.dataSource.push(
                        {
                            id: id,
                            width: 100,
                            text: "Error"
                        }
                    );
                    this.resultsTab.selectedId = id;
                    this.resultsTab.processStyleAndRender("", []);

                    this.addErrorPane(id, this.resultsView, error);
                }


                if (gotResults) {
                    let id = generateV4UUID();

                    this.resultsTab.dataSource.push(
                        {
                            id: id,
                            width: 150,
                            text: "" + ret.resultTableName
                        }
                    );
                    this.resultsTab.selectedId = id;
                    this.resultsTab.processStyleAndRender("", []);
                    this.addResultPane(id, this.resultsView, ret.resultTableName, false);


                }


                if (gotMessages) {
                    let id = generateV4UUID();
                    this.resultsTab.dataSource.push(
                        {
                            id: id,
                            width: 100,
                            text: "Messages"
                        }
                    );
                    this.resultsTab.processStyleAndRender("", []);
                    this.addErrorPane(id, this.resultsView, message);
                }
                this.resultsTab.processStyleAndRender("", []);


                this.resultsTab.setActionDelegate(this, "onTabSelected");

                sql.close();

                btn.setText("Execute")
                btn.setEnabled(true);

                Application.instance.notifyAll(this, "refreshTables");
            });
        });

    }


    onTabSelected() {

        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].view.setVisible(this.tabs[i].id === this.resultsTab.selectedId);
        }
    }

    addErrorPane(id: string, container: View, message: string) {
        let pane = new View();
        pane.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        pane.initView(id);
        container.attach(pane);

        let nav = new NavigationController();
        nav.initNavigationControllerWithRootView("nav" + id, pane);
        nav.instantiateViewController(generateV4UUID(), SQLErrorViewController, {
            viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                (viewController as SQLErrorViewController).message = message;
                (viewController as SQLErrorViewController).db = this.getCurrentDB();
                this.tabs.push({
                    id: id,
                    view: pane,
                    tableName: "",
                    viewController: viewController,
                    type: "MESSAGE",
                    nav: nav
                })
                nav.present(viewController, {animated: false});
                this.onTabSelected();
            }
        });
    }

    addResultPane(id: string, container: View,  tableName: string, showAllColumns: boolean) {

        let pane = new View();
        pane.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        pane.initView(id);
        container.attach(pane);

        let nav = new NavigationController();
        nav.initNavigationControllerWithRootView("nav" + id, pane);
        nav.instantiateViewController(generateV4UUID(), ResultsTableViewController, {
            viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                (viewController as ResultsTableViewController).tableName = tableName;
                (viewController as ResultsTableViewController).showAllColumns = showAllColumns;
                (viewController as ResultsTableViewController).db = this.getCurrentDB();
                this.tabs.push({
                    id: id,
                    view: pane,
                    tableName: tableName,
                    viewController: viewController,
                    type: "QUERY",
                    nav: nav
                })
                nav.present(viewController, {animated: false});
                this.onTabSelected();
            }
        });

    }

}