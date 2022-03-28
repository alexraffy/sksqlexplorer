import {
    Border,
    BorderRadius,
    Bounds, Btn, Fill,
    fillParentBounds,
    ImageView,
    NUConvertToPixel, px, Tabs,
    Toolbar,
    TreeView,
    View
} from "mentatjs";
import {Theme} from "./Theme";
import {SKSQL} from "sksql";


export class SKSQLExplorerView extends View {

    toolbarTop: Toolbar;
    treeView: TreeView;
    contentView: View;
    viewTabBar: Tabs;
    db: SKSQL;

    constructor() {
        super();
        this.styles = Theme.backgroundStyle;
    }

    boundsForView(parentBounds: Bounds): Bounds {
        return fillParentBounds(parentBounds);
    }

    viewWasAttached() {
        super.viewWasAttached();
        this.setTop();
        this.setExplorer();
        this.setContentTab();
    }

    setTop() {
        let v = new Toolbar();
        v.boundsForView = function (parentBounds) {
            return new Bounds(0, 0, NUConvertToPixel(parentBounds.width).amount, 36);
        }
        v.styles = Theme.headerStyle;
        v.controls = [
            {
                id: "logo",
                width: 32,
                isSpace: false,
                viewFn: () => {
                    let i = new ImageView();
                    i.imageWidth = 24;
                    i.imageHeight = 24;
                    i.fit = "none";
                    i.imageURI = "assets/icons/png/24x24.png";
                    return i;
                }
            },
            {
                id: "space",
                width: 10,
                isSpace: false,
                viewFn: () => {
                    return new View();
                }
            },
            {
                id: "newQuery",
                width: 100,
                isSpace: false,
                viewFn: () => {
                    let b = new Btn();
                    b.styles = Theme.buttonStyle;
                    b.text = "New Query";
                    return b;
                }
            },
            {
                id: "LoadExemple",
                width: 100,
                isSpace: false,
                viewFn: () => {
                    let b = new Btn();
                    b.styles = Theme.buttonStyle;
                    b.text = "Load Example";
                    return b;
                }
            }
        ]
        v.initView(this.id + ".top");
        this.attach(v);
        this.toolbarTop = v;

    }

    setExplorer() {
        let treeView = new TreeView();
        treeView.styles = Theme.treeViewStyle;
        treeView.boundsForView = function (parentBounds) {
            return new Bounds(
                0,
                36,
                250,
                NUConvertToPixel(parentBounds.height).amount - 36
            );
        }
        treeView.initView(this.id + ".treeView");
        this.attach(treeView);
        this.treeView = treeView;
    }

    setContentTab() {

        this.viewTabBar = new Tabs();
        this.viewTabBar.boundsForView = function (parentBounds) {
            return new Bounds(250, 41, NUConvertToPixel(parentBounds.width).amount - 250,
                px(32));
        }
        this.viewTabBar.dataSource = [];
        this.viewTabBar.dontCacheStyle = true;
        this.viewTabBar.styles = Theme.titleBarStyle;
        this.viewTabBar.initView("tabs");
        this.attach(this.viewTabBar);
        this.viewTabBar.setActionDelegate(this, "onPanelSelectedChanged");



        let v = new View();
        v.boundsForView = function (parentBounds) {
            let y = 41+32+5;
            return new Bounds(250, y, NUConvertToPixel(parentBounds.width).amount - 250, NUConvertToPixel(parentBounds.height).amount - y);
        }
        v.getDefaultStyle().fills = [new Fill(true, "color", "normal", "rgba(243, 244, 246, 1.0)")];
        v.initView(this.id + ".contentView");
        this.attach(v);
        this.contentView = v;
    }

}