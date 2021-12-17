import {
    Application,
    BorderRadius,
    Bounds, Btn,
    centerParentBounds, Fill,
    fillParentBounds,
    generateV4UUID, isDefined,
    Label, NavigationController, NavigationControllerDelegate,
    NUConvertToPixel, setProps,
    View,
    ViewController, ViewStyle
} from "mentatjs";
import {Theme} from "./Theme";

export function modalView(faicon: string, title: string, message: string, button1: string, button2: string, callback: (action: "button1" | "button2" | "dismissed") => void) {
    let rootView = new View();
    rootView.boundsForView = function (parentBounds) {
        return fillParentBounds(parentBounds);
    }
    rootView.initView(generateV4UUID());
    Application.instance.rootView.attach(rootView);
    let nav = new NavigationController();

    nav.initNavigationControllerWithRootView(generateV4UUID(), rootView);

    let delegate: NavigationControllerDelegate & { modalDismissed: (action: "button1" | "button2" | "dismissed") => void, rootView: View, nav: NavigationController} = {
        rootView: rootView,
        nav: nav,
        modalDismissed: (action: "button1" | "button2" | "dismissed") => {
            nav.clear();
            rootView.detachItSelf();
            callback(action);
        },
        viewControllerWasLoadedSuccessfully(viewController: ViewController) {
            let vc = viewController as ModalViewController;
            vc.button1Text = button1;
            vc.button2Text = button2;
            vc.title = title;
            vc.message = message;
            vc.modalDelegate = delegate.modalDismissed;
            this.nav.present(vc, {animated: false});
        }
    }

    nav.instantiateViewController(generateV4UUID(), ModalViewController, delegate);

}


export class ModalViewController extends ViewController {

    modalDelegate: (action: "button1" | "button2" | "dismissed") => void;

    button1Text: string;
    button2Text: string;
    title: string;
    message: string;

    viewForViewController(): View {
        let background = new View();
        background.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        }
        background.viewWasAttached = () => {
            let v = new View();
            v.boundsForView = function (parentBounds) {
                return centerParentBounds(parentBounds, 512, 194);
            }
            v.viewWasAttached = () => {
                let icon = new Label();
                icon.boundsForView = function (parentBounds) {
                    return new Bounds(20, 20, 40, 40);
                }
                icon.styles = Theme.alertIconStyle;
                icon.textAlignment = "center";
                icon.fillLineHeight = true;
                icon.text = "&#xf071;"
                icon.initView(v.id + ".icon");
                v.attach(icon);

                let title = new Label("h3");
                title.boundsForView = function (parentBounds) {
                    return new Bounds(80, 20, 412, 24);
                }
                title.styles = Theme.labelStyleTitle;
                title.text = this.title;
                title.initView(v.id + ".title");
                v.attach(title);

                let message = new Label("p");
                message.boundsForView = function (parentBounds) {
                    return new Bounds(80, 54, 412, 88);
                }
                message.styles = Theme.labelStyleNormal;
                message.text = this.message;
                message.initView(v.id + ".message");
                v.attach(message);


                let greyBottom = new View();
                greyBottom.boundsForView = function (parentBounds) {
                    const height = 62;
                    return new Bounds(0, NUConvertToPixel(parentBounds.height).amount - height, NUConvertToPixel(parentBounds.width).amount, height);
                }
                greyBottom.styles = [
                    setProps(new ViewStyle(), {
                        fills: [new Fill(true, "color", "solid", Theme.grey50)],
                    } as ViewStyle)
                ];
                greyBottom.initView(v.id + ".greyBottom");
                v.attach(greyBottom);


                let btn2 = new Btn();
                btn2.styles = Theme.buttonActionStyle;
                btn2.boundsForView = (parentBounds) => {
                    let rightPadding = 10;
                    let textLength = this.button2Text.length * 9 + 20;
                    return new Bounds(
                        NUConvertToPixel(parentBounds.width).amount - rightPadding - textLength,
                        NUConvertToPixel(parentBounds.height).amount - 42 + 5 - 10,
                        textLength,
                        32
                    );
                }
                btn2.text = this.button2Text;
                btn2.initView(v.id + ".button2");
                v.attach(btn2);
                btn2.setAction(() => {
                    this.onButton("button2");
                });

                let btn1 = new Btn();
                btn1.styles = Theme.buttonStyle;
                btn1.boundsForView = (parentBounds) => {
                    let rightPadding = 10;
                    let text2Length = this.button2Text.length * 9 + 20;
                    let text1Length = this.button1Text.length * 9 + 20;
                    return new Bounds(
                        NUConvertToPixel(parentBounds.width).amount - rightPadding - text2Length - rightPadding - text1Length,
                        NUConvertToPixel(parentBounds.height).amount - 42 + 5 - 10,
                        text1Length,
                        32
                    );
                }
                btn1.text = this.button1Text;
                btn1.initView(v.id + ".button1");
                v.attach(btn1);
                btn1.setAction(() => {
                    this.onButton("button1");
                });



            }
            v.styles = Theme.modalStyle;
            v.initView(generateV4UUID());
            background.attach(v);
        }
        background.initView(generateV4UUID());
        return background;
    }

    onButton(action: "button1" | "button2" | "dismissed") {
        if (isDefined(this.modalDelegate)) {
            this.modalDelegate(action);
        }
    }

}