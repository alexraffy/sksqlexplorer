import {
    Application,
    Bounds, Btn,
    DataSource, Fill, fillParentBounds, generateV4UUID,
    Label, NavigationController,
    NumberWithUnit, PropertyTextStyle, px,
    PXBounds, setProps, TreeLeaf,
    TreeView,
    TreeViewDelegate,
    View,
    ViewController, ViewStyle
} from "mentatjs";
import {SKSQLExplorerView} from "./SKSQLExplorerView";
import {cursorEOF, SKSQL, readFirst, readNext, readTableDefinition, readValue,
    TRegisteredFunction, instanceOfTQueryCreateFunction, TQueryCreateProcedure, columnTypeToString} from "sksql";

import {Theme} from "./Theme";
import {QueryAndResultsViewController} from "./QueryAndResultsViewController";
import {ResultsTableViewController} from "./ResultsTableViewController";



export class SKSQLExplorerViewController extends ViewController implements TreeViewDelegate {

    lastQueryIndex: number = 0;
    dbs: SKSQL[];

    tabs: {
        db: SKSQL;
        id: string;
        view: View;
        type: "TABLE" | "QUERY" | "FUNCTIONS" | "JSFUNCTION" | "FUNCTION" | "PROCEDURES" | "PROC";
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
        for (let c = 0; c < this.dbs.length; c++) {
            let text = "local";
            if (this.dbs[c].connections.length > 0) {
                text = this.dbs[c].connections[0].databaseHashId;
            }
            let d = {
                kind: "DATABASE",
                id: generateV4UUID(),
                text: text,
                children: []
            };
            ds.push(d);
            for (let i = 0; i < this.dbs[c].allTables.length; i++) {
                let td = readTableDefinition(this.dbs[c].allTables[i].data);
                let t = {
                    kind: "TABLE",
                    db: this.dbs[c],
                    id: generateV4UUID(),
                    text: td.name,
                    tableName: td.name,
                    children: []
                };
                for (let x = 0; x < td.columns.length; x++) {
                    let col = td.columns[x];
                    let column = {
                        kind: "COLUMN",
                        db: this.dbs[c],
                        id: generateV4UUID(),
                        columnName: col.name,
                        text: col.name,
                        type: columnTypeToString(col.type),
                        length: col.length,
                        decimal: col.decimal,
                        nullable: col.nullable === true,
                        invisible: col.invisible === true
                    }
                    t.children.push(column);
                }
                d.children.push(t);
            }
            let functions = {
                id: generateV4UUID(),
                kind: "FUNCTIONS",
                db: this.dbs[c],
                text: "Functions",
                children: []
            };
            for (let i = 0; i < this.dbs[c].functions.length; i++) {
                let fn: TRegisteredFunction = this.dbs[c].functions[i];
                functions.children.push({
                    id: generateV4UUID(),
                    db: this.dbs[c],
                    kind: instanceOfTQueryCreateFunction(fn.fn) ? "FUNCTION" : "JSFUNCTION",
                    text: fn.name,
                    children: []
                });
            }
            d.children.push(functions);

            let procedures = {
                id: generateV4UUID(),
                kind: "PROCEDURES",
                db: this.dbs[c],
                text: "Procedures",
                children: []
            };
            for (let i = 0; i < this.dbs[c].procedures.length; i++) {
                let fn: TQueryCreateProcedure = this.dbs[c].procedures[i];
                procedures.children.push({
                    id: generateV4UUID(),
                    db: this.dbs[c],
                    kind: "PROC",
                    text: fn.procName,
                    children: []
                });
            }
            d.children.push(procedures);


        }
        let v = this.view as SKSQLExplorerView;
        v.treeView.dataArray = ds;
        v.treeView.delegate = this;
        v.treeView.reloadData(undefined);

        v.viewTabBar.setActionDelegate(this, "onTabSelected");
    }

    onNewQuery() {
        this.lastQueryIndex++;
        this.addQuery(this.dbs, "Query #" + this.lastQueryIndex);
    }


    addQuery(db: SKSQL[], queryName: string, text: string = "") {
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
                (viewController as QueryAndResultsViewController).query = text;
                (viewController as QueryAndResultsViewController).db = db;
                this.tabs.push({
                    db: db[0],
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

    addPane(db: SKSQL, tableName: string, showAllColumns: boolean) {
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
                (viewController as ResultsTableViewController).db = db;
                this.tabs.push({
                    db: db,
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
        label.styles.push(setProps(new ViewStyle(), {
            cond: [{
                property: "cell.isSelected",
                op: "equals",
                value: true,
                fieldTargetForProperty: 3
            }],
            textStyle: setProps(new PropertyTextStyle(), {
                color: new Fill(true, "color", "normal", Theme.white),
                size: px(12)
            } as PropertyTextStyle),
        } as ViewStyle));

        label.fillLineHeight = true;

        if (["DATABASE", "TABLE", "FUNCTIONS", "FUNCTION", "PROCEDURES", "PROC"].includes(obj.kind)) {

            label.text = obj.text;

            let v = new Label();
            v.styles = Theme.labelStyleNormal;
            v.styles.push(setProps(new ViewStyle(), {
                cond: [{
                    property: "cell.isSelected",
                    op: "equals",
                    value: true,
                    fieldTargetForProperty: 3
                }],
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", Theme.white),
                    textAlignment: "center",
                    weightValue:'900',
                    weight: 'FontAwesome5FreeSolid',
                    size: px(12)
                } as PropertyTextStyle),
            } as ViewStyle));

            v.boundsForView = function(parentBounds: Bounds): Bounds {
                return this.keyValues["Bounds"];
            }
            v.keyValues["Bounds"] = new Bounds(5, 0, 20, 32);
            v.fillLineHeight = true;
            v.textAlignment = 'center';
            v.fontSize = 14;
            v.fontWeight = '900';
            v.fontFamily = 'FontAwesome5FreeSolid, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            v.fills = [];
            if (obj.kind === "TABLE") {
                v.text = "&#xf0ce;";
            } else if (obj.kind === "FUNCTIONS") {
                v.text = "&#xf121;"
            } else if (obj.kind === "FUNCTION") {
                v.text = "&#xf007;"
            } else if (obj.kind === "PROCEDURES") {
                v.text = "&#xf121;"
            } else if (obj.kind === "PROC") {
                v.text = "&#xf121;"
            } else if (obj.kind === "DATABASE") {
                v.text = "&#xf1c0;";
            }

            v.initView("cellIcon");
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

        if (obj.kind === "FUNCTIONS" || obj.kind === "JSFUNCTION" || obj.kind === "FUNCTION" || obj.kind === "PROCEDURES" || obj.kind === "PROC") {
            label.text = obj.text;
        }

        label.initView("cellTitle");
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
        return [treeView.bounds.width, px(32)];
    }

    treeViewLeafDoubleClicked(treeView: TreeView, leaf: TreeLeaf) {
        if (leaf.object.kind === "TABLE") {
            let exists = this.tabs.find((t) => { return t.tableName === leaf.object.tableName;});
            if (!exists) {
                this.addPane(leaf.object.db, leaf.object.tableName, true);
            }
        }
        if (leaf.object.kind === "FUNCTION") {
            let exists = this.tabs.find((t) => { return t.tableName === "function_" + leaf.object.text.toUpperCase();});
            if (!exists) {
                let routines = leaf.object.db.getTable("routines");
                let def = readTableDefinition(routines.data);
                let nameCol = def.columns.find((c) => { return c.name.toUpperCase() === "NAME";});
                let defCol = def.columns.find((c) => { return c.name.toUpperCase() === "DEFINITION";});
                let cursor = readFirst(routines, def);
                while (!cursorEOF(cursor)) {
                    let fr = new DataView(routines.data.blocks[cursor.blockIndex], cursor.offset, cursor.rowLength + 5);
                    let nameValue = readValue(routines, def, nameCol, fr, 5) as string;
                    if (nameValue !== undefined && nameValue.toUpperCase() === leaf.object.text.toUpperCase()) {
                        let defValue = readValue(routines, def, defCol, fr, 5) as string;
                        this.addQuery([leaf.object.db], "function_" + leaf.object.text.toUpperCase(), defValue);
                        return;
                    }
                    cursor = readNext(routines, def, cursor);
                }

            }
        }
        if (leaf.object.kind === "PROC") {
            let exists = this.tabs.find((t) => { return t.tableName === "proc_" + leaf.object.text.toUpperCase();});
            if (!exists) {
                let routines = leaf.object.db.getTable("routines");
                let def = readTableDefinition(routines.data);
                let nameCol = def.columns.find((c) => { return c.name.toUpperCase() === "NAME";});
                let defCol = def.columns.find((c) => { return c.name.toUpperCase() === "DEFINITION";});
                let cursor = readFirst(routines, def);
                while (!cursorEOF(cursor)) {
                    let fr = new DataView(routines.data.blocks[cursor.blockIndex], cursor.offset, cursor.rowLength + 5);
                    let nameValue = readValue(routines, def, nameCol, fr, 5) as string;
                    if (nameValue !== undefined && nameValue.toUpperCase() === leaf.object.text.toUpperCase()) {
                        let defValue = readValue(routines, def, defCol, fr, 5) as string;
                        this.addQuery([leaf.object.db], "proc_" + leaf.object.text.toUpperCase(), defValue);
                        return;
                    }
                    cursor = readNext(routines, def, cursor);
                }

            }
        }
    }

}