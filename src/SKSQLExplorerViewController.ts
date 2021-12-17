import {
    Application,
    Bounds, Btn,
    DataSource, fillParentBounds, generateV4UUID,
    Label, NavigationController,
    NumberWithUnit, px,
    PXBounds, TreeLeaf,
    TreeView,
    TreeViewDelegate,
    View,
    ViewController
} from "mentatjs";
import {SKSQLExplorerView} from "./SKSQLExplorerView";
import {DBData, readTableDefinition} from "sksql";
import {columnTypeToString} from "sksql/build/Table/columnTypeToString";
import {Theme} from "./Theme";
import {QueryAndResultsViewController} from "./QueryAndResultsViewController";
import {ResultsTableViewController} from "./ResultsTableViewController";


export class SKSQLExplorerViewController extends ViewController implements TreeViewDelegate {

    lastQueryIndex: number = 0;

    tabs: {
        id: string;
        view: View;
        type: "TABLE" | "QUERY";
        tableName: string;
        nav: NavigationController;
        vc: ViewController | QueryAndResultsViewController | ResultsTableViewController
    }[] = [];


    viewForViewController(): View {
        let v = new SKSQLExplorerView();
        return v;
    }

    viewWasPresented() {
        const toolbar = (this.view as SKSQLExplorerView).toolbarTop;
        const btnNewQuery = toolbar.findControlForId("newQuery") as Btn;
        btnNewQuery.setActionDelegate(this, "onNewQuery");

        this.refreshTables();
        this.onNewQuery();

        Application.instance.registerForNotification("refreshTables", this);

    }

    refreshTables() {
        let ds = [];
        for (let i = 0; i < DBData.instance.allTables.length; i++) {
            let td = readTableDefinition(DBData.instance.allTables[i].data);
            let t = {
                kind: "TABLE",
                id: td.name,
                text: td.name,
                children: []
            };
            for (let x = 0; x < td.columns.length; x++) {
                let col = td.columns[x];
                let c = {
                    kind: "COLUMN",
                    id: col.name,
                    text: col.name,
                    type: columnTypeToString(col.type),
                    length: col.length,
                    decimal: col.decimal,
                    nullable: col.nullable === true,
                    invisible: col.invisible === true
                }
                t.children.push(c);
            }
            ds.push(t);
        }

        let v = this.view as SKSQLExplorerView;
        v.treeView.dataArray = ds;
        v.treeView.delegate = this;
        v.treeView.reloadData(undefined);

        v.viewTabBar.setActionDelegate(this, "onTabSelected");
    }

    onNewQuery() {
        this.lastQueryIndex++;
        this.addQuery("Query #" + this.lastQueryIndex);
    }


    addQuery(queryName: string) {
        let id = generateV4UUID();
        let v = this.view as SKSQLExplorerView;
        v.viewTabBar.dataSource.push(
            {
                id: id,
                text: queryName,
                width: 100
            }
        );
        v.viewTabBar.processStyleAndRender("", []);
        v.viewTabBar.setSelectedId(id);

        let pane = new View();
        pane.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        pane.initView(id);
        v.contentView.attach(pane);

        let nav = new NavigationController();
        nav.initNavigationControllerWithRootView("nav" + id, pane);
        nav.instantiateViewController(generateV4UUID(), QueryAndResultsViewController, {
            viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                (viewController as QueryAndResultsViewController).queryID = id;

                this.tabs.push({
                    id: id,
                    view: pane,
                    tableName: queryName,
                    vc: viewController,
                    type: "QUERY",
                    nav: nav
                })
                nav.present(viewController, {animated: false});
                this.onTabSelected();
            }
        });
    }

    addPane(tableName: string, showAllColumns: boolean) {
        let id = tableName + generateV4UUID();
        let v = this.view as SKSQLExplorerView;
        v.viewTabBar.dataSource.push(
            {
                id: id,
                text: tableName,
                width: 100
            }
        );
        v.viewTabBar.processStyleAndRender("", []);
        v.viewTabBar.setSelectedId(id);

        let pane = new View();
        pane.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        pane.initView(id);
        v.contentView.attach(pane);

        let nav = new NavigationController();
        nav.initNavigationControllerWithRootView("nav" + id, pane);
        nav.instantiateViewController(generateV4UUID(), ResultsTableViewController, {
            viewControllerWasLoadedSuccessfully: (viewController: ViewController) => {
                (viewController as ResultsTableViewController).tableName = tableName;
                (viewController as ResultsTableViewController).showAllColumns = showAllColumns;
                this.tabs.push({
                    id: id,
                    view: pane,
                    tableName: tableName,
                    vc: viewController,
                    type: "TABLE",
                    nav: nav
                })
                nav.present(viewController, {animated: false});
                this.onTabSelected();
            }
        });

    }

    onTabSelected() {
        let v = this.view as SKSQLExplorerView;
        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].view.setVisible(this.tabs[i].id === v.viewTabBar.selectedId);
        }
    }

    treeViewLeafWasAttached(treeView: TreeView, leafObject: any, leafCell: View, index: number, depth: number) {
        let obj = leafObject.object;

        let label = new Label();
        label.pxBoundsForView = function(parentBounds: PXBounds): PXBounds {
            return {
                x: 30,
                y: 0,
                width: parentBounds.width - 30,
                height: parentBounds.height,
                unit: "px",
                position:"absolute"
            };
        };

        label.styles = Theme.labelStyleSmall;
        label.fillLineHeight = true;

        if (obj.kind === "TABLE") {

            label.text = obj.text;

            let v = new Label();
            v.boundsForView = function(parentBounds: Bounds): Bounds {
                return this.keyValues["Bounds"];
            }
            v.keyValues["Bounds"] = new Bounds(5, 0, 20, 20);
            v.fillLineHeight = true;
            v.textAlignment = 'center';
            v.fontSize = 12;
            v.fontWeight = '900';
            v.fontFamily = 'FontAwesome5FreeSolid, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            v.fills = [];
            v.text = "&#xf0ce;";

            v.initView(obj.id + ".listIcon");
            leafCell.attach(v);
        }
        if (obj.kind === "COLUMN") {
            label.text = obj.text + " " + obj.type;
            if (obj.type === "VARCHAR") {
                label.text += " (" + obj.length + ")";
            }
            if (obj.type === "DECIMAL") {
                label.text = " (" + obj.length + ", "+ obj.decimal + ")";
            }
        }


        label.initView(leafObject.object.id + ".title");
        leafCell.attach(label);
        leafCell.keyValues["Label"] = label;

    }


    treeViewChildrenForObject(treeView, object) {
        return (object).children;
    }


    treeViewIdForObject(treeView, object) {
        return object.id;
    }

    treeViewCellSizeForLeaf(treeView, leafObject, index, depth): NumberWithUnit[] {
        return [treeView.bounds.width, px(20)];
    }

    treeViewLeafDoubleClicked(treeView: TreeView, leaf: TreeLeaf) {
        if (leaf.object.kind === "TABLE") {
            let exists = this.tabs.find((t) => { return t.tableName === leaf.object.id;});
            if (!exists) {
                this.addPane(leaf.object.id, true);
            }
        }
    }

}