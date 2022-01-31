import {Theme} from "./Theme";
import {Bounds, Btn, fillParentBounds, ImageView, NUConvertToPixel, Toolbar, View} from "mentatjs";


export class SKDashboardView extends View {
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
            }
        ]
        v.initView(this.id + ".top");
        this.attach(v);


    }


}