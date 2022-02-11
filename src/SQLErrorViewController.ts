import {Bounds, fillParentBounds, Label, NUConvertToPixel, View, ViewController} from "mentatjs";
import {Theme} from "./Theme";
import {SKSQL} from "../../sksql";


export class SQLErrorViewController extends ViewController {
    db: SKSQL;
    message: string;
    private label: Label;
    viewForViewController() {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        v.viewWasAttached = () => {
            let label = new Label();
            label.boundsForView = function (parentBounds) {
                return new Bounds(5, 5, NUConvertToPixel(parentBounds.width).amount - 10, NUConvertToPixel(parentBounds.height).amount - 10);
            }
            label.styles = Theme.labelStyleSmall;
            label.initView(v.id + ".label");
            v.attach(label);
            this.label = label;
        }
        return v;
    }

    viewWasPresented() {
        this.label.setText(this.message);
    }

}