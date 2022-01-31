import {Application, Btn, View, ViewController} from "mentatjs";
import {SKDashboardView} from "./SKDashboardView";


export class SKDashboardViewController extends ViewController {
    viewForViewController(): View {
        let v = new SKDashboardView();
        return v;
    }

    viewWasPresented() {


    }


}