import {
    Application,
    Bounds,
    Btn,
    DataSource,
    fillParentBounds,
    Label,
    NUConvertToPixel,
    SelectionMode,
    TableView,
    TableViewDelegate,
    Toolbar,
    View,
    ViewController
} from "mentatjs";
import {Theme} from "./Theme";
import {
    cursorEOF,
    SKSQL, instanceOfTDateTime,
    instanceOfTTime,
    isRowDeleted,
    ITable,
    ITableDefinition,
    kBlockHeaderField,
    numericDisplay, padLeft,
    readFirst,
    readNext,
    readTableAsJSON,
    readTableDefinition,
    readValue,
    TableColumnType
} from "sksql";
import {columnTypeIsNumeric} from "sksql/build/Table/columnTypeIsNumeric";
import {isNumeric} from "sksql/build/Numeric/isNumeric";
import {columnTypeIsBoolean} from "sksql/build/Table/columnTypeIsBoolean";
import {columnTypeIsDate} from "sksql/build/Table/columnTypeIsDate";
import {instanceOfTDate} from "sksql/build/Query/Guards/instanceOfTDate";
import {modalView} from "./ModalViewController";


export class ResultsTableViewController extends ViewController implements TableViewDelegate {

    showAllColumns: boolean;
    tableName: string;
    tableView: TableView;

    viewForViewController(): View {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        v.viewWasAttached = () => {
            let t = new Toolbar();
            t.styles = Theme.toolbarStyle;
            t.boundsForView = function (parentBounds) {
                return new Bounds(5, 5, NUConvertToPixel(parentBounds.width).amount - 10, 32);
            }
            t.controls = [{
                id: "refresh",
                width: 100,
                isSpace: false,
                viewFn: () => {
                    let b: Btn = new Btn();
                    b.styles = Theme.buttonStyle;
                    b.text = "<span style='font-family:FontAwesome5FreeSolid'>&#xf2f1;</span> Refresh";
                    b.setActionDelegate(this, "onRefresh");
                    return b;
                }
            },{
                id: "space",
                isSpace: true
            }, {
                id: "delete",
                width: 100,
                isSpace: false,
                viewFn: () => {
                    let b: Btn = new Btn();
                    b.styles = Theme.buttonStyle;
                    b.text = "<span style='font-family:FontAwesome5FreeSolid'>&#xf2ed;</span> Delete";
                    b.setActionDelegate(this, "onDelete");
                    return b;
                }

            }];
            t.initView(v.id + ".toolbar");
            v.attach(t);

            let tv = new TableView();
            tv.styles = Theme.tableViewStyle;
            tv.boundsForView = function (parentBounds) {
                return new Bounds(5, 42, NUConvertToPixel(parentBounds.width).amount - 10, NUConvertToPixel(parentBounds.height).amount - 42 - 5);
            }
            tv.rowMargin = 0;
            tv.separateRows = false;
            tv.dontCacheStyle = true;
            tv.selectionMode = SelectionMode.noSelection;
            tv.delegate = this;
            tv.initView(v.id + ".tableView");
            v.attach(tv);
            this.tableView = tv;
        }

        return v;
    }

    viewWasPresented() {
        this.onRefresh();
    }

    onDelete() {
        modalView("&#xf071;", "Delete table", "Are you sure you want to delete this table ? The table definition and all its data will be deleted. This action cannot be undone. ", "CANCEL", "DELETE TABLE", (action) => {
            if (action === "button2") {
                SKSQL.instance.dropTable(this.tableName);
                Application.instance.notifyAll(this, "refreshTables");
            }
        });
    }

    onRefresh() {
        if (this.tableName === "") {
            return;
        }
        let t: ITable = SKSQL.instance.getTable(this.tableName);
        if (t === undefined) {
            return;
        }
        let tb: ITableDefinition = readTableDefinition(t.data, false);
        let data = readTableAsJSON(this.tableName);

        this.tableView.jsonColumns = [];
        let idx = 0;
        if (this.showAllColumns) {
            this.tableView.jsonColumns.push(
                {
                    id: "system_rowid",
                    width: 70,
                    title: "ROW",
                    defaultCell: "Label",
                    field: "system_rowid"
                }
            );
            this.tableView.jsonColumns.push(
                {
                    id: "system_flag",
                    width: 70,
                    title: "FLAG",
                    defaultCell: "Label",
                    field: "system_flag"
                }
            );
            idx = 2;
        }
        for (let i = 0; i < tb.columns.length; i++) {
            let c = tb.columns[i];
            if (c.invisible === true && this.showAllColumns === false) {
                continue;
            }
            this.tableView.jsonColumns.push({
                id: c.name,
                width: -1,
                title: c.name,
                defaultCell: "Label",
                field: "field_" + (idx + i)
            });
        }
        this.tableView.dataSource = new DataSource();
        let rows = [];
        let cursor = readFirst(t, tb);
        while (!cursorEOF(cursor)) {
            let r = {};
            let dv = new DataView(t.data.blocks[cursor.blockIndex], cursor.offset, cursor.rowLength + 5);
            for (let i = 0; i < this.tableView.jsonColumns.length; i++) {
                let c = this.tableView.jsonColumns[i];
                if (c.id === "system_rowid") {
                    r["system_rowid"] = dv.getUint32(kBlockHeaderField.DataRowId);
                } else if (c.id === "system_flag") {
                    r["system_flag"] = isRowDeleted(t.data, cursor);
                } else {
                    let col = tb.columns.find((t) => { return t.name.toUpperCase() === c.id.toUpperCase();});
                    if (col === undefined) {
                        continue;
                    }
                    let val = readValue(t, tb, col, dv, 5);
                    if (columnTypeIsNumeric(col.type) && isNumeric(val)) {
                        r["field_" + i] = numericDisplay(val);
                    } else if (columnTypeIsBoolean(col.type)) {
                        r["field_" + i] = (val === true) ? "true" : false;
                    } else if (columnTypeIsDate(col.type) && instanceOfTDate(val)) {
                        r["field_" + i] = padLeft(val.year.toString(), 4, "0") + "-" +
                            padLeft(val.month.toString(), 2, "0") + "-" +
                            padLeft(val.day.toString(), 2, "0");
                    } else if (col.type === TableColumnType.time && instanceOfTTime(val)) {
                        r["field_" + i] = padLeft(val.hours.toString(), 2, "0") + ":" +
                            padLeft(val.minutes.toString(), 2, "0") + ":" +
                            padLeft(val.seconds.toString(), 2, "0") + "." +
                            padLeft(val.millis.toString(), 3, "0");
                    } else if (col.type === TableColumnType.datetime && instanceOfTDateTime(val)) {
                        r["field_" + i] = padLeft(val.date.year.toString(), 4, "0") + "-" +
                            padLeft(val.date.month.toString(), 2, "0") + "-" +
                            padLeft(val.date.day.toString(), 2, "0") + "T" +
                            padLeft(val.time.hours.toString(), 2, "0") + ":" +
                            padLeft(val.time.minutes.toString(), 2, "0") + ":" +
                            padLeft(val.time.seconds.toString(), 2, "0") + "." +
                            padLeft(val.time.millis.toString(), 3, "0");

                    } else {
                        r["field_" + i] = val;
                    }

                }
            }
            rows.push(r);
            cursor = readNext(t, tb, cursor);
        }

        this.tableView.dataSource.initWithData({rows: rows});
        this.tableView.dontCacheStyle = true;
        this.tableView.processStyleAndRender("", []);

    }

    tableViewHeightForHeader(tableView: TableView): number {
        return 40;
    }

    tableViewHeightForRow(tableView: TableView, index: number): number {
        return 54;
    }

    tableViewControlCellWasAttached(tableView: TableView, cell: View, control: View, item: any, columnInfo: any, path: { row: number; col: number }) {

    }

    tableViewControlCellWillInit(tableView: TableView, cell: View, control: View, item: any, columnInfo: any, path: { row: number; col: number }) {
        let label = control as Label;
        if (label.fontColor) {
            //label.fontColor = "rgba(255, 255, 255, 1.0)";
        }
    }


}