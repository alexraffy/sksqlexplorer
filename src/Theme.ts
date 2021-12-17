import {
    Border,
    BorderRadius,
    BorderSide,
    Color,
    Fill,
    kViewProperties,
    PropertyTextStyle,
    px,
    setProps,
    Shadow,
    ViewStyle
} from "mentatjs";


export class Theme {

    static get backgroundStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", "rgba(249,250,251,1.0)")]
                } as ViewStyle)
        ]
    }

    static get headerStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)")],
                    shadows: [new Shadow(true, 0, 1, 0, 0, "rgba(17, 24, 39, 0.05)", false)]
                } as ViewStyle)
        ]
    }

    static get systemFont(): string {
        return "Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,\"Noto Sans\",sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Noto Color Emoji\"";
        //return "'-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif'";
    }

    static get toolbarStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    //fills: [new Fill(true, "color", "normal", "rgba(72, 72, 72, 1.0)")]
                } as ViewStyle)
            ];
    }

    static get labelStyleSmall(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    weightValue: '400',
                    textAlignment: 'left',
                    size: px(12),
                    openTypeTags: ['liga'],
                    color: new Fill(true, "color", "normal", this.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ];
    }
    static get labelStyleTitle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(), {
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    textAlignment: "left",
                    color: new Fill(true, "color", "normal", "rgba(17,24,39,1.0)"),
                    size: px(14),
                    weightValue: "600"
                } as PropertyTextStyle)
            } as ViewStyle)
        ]
    }

    static get labelStyleNormal(): ViewStyle[] {
        return [
            setProps(new ViewStyle(), {
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: this.systemFont,
                    textAlignment: "left",
                    color: new Fill(true, "color", "normal", Theme.grey500),
                    size: px(14),
                    weightValue: "400"
                } as PropertyTextStyle)
            } as ViewStyle)
        ]
    }

    // colors
    static get textColor(): string {
        return "rgba(20, 25, 29, 1.0)";
    }
    static get panelBackgroundColor(): string {
        return "rgba(84, 84, 84, 1.0)";
        //return "rgba(58, 58, 58, 1.0)";
        //return "rgba(38, 54, 67, 1.0)";
        //return "rgba(51, 51, 51, 1.0)";
    }
    static get listBackgroundColor(): string {
        return "rgba(58, 58, 58, 1.0)";
    }
    static get listRowNormalColor(): string {
        return "rgba(60, 60, 60, 1.0)";
    }
    static get listRowSelectedColor(): string {
        return "rgba(82, 82, 82, 1.0)"
    }

    static get tabBackgroundColor(): string {
        // return "rgba(61, 80, 95, 1.0)"; // ol'bluey
        return "rgba(72, 72, 72, 1.0)"; // Logic
    }
    static get tabDarkerBackgroundColor(): string {
        return "rgba(44, 44, 44, 1.0)";
    }


    static get titleBarStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: [],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                fills: [new Fill(true, "color", "normal", "rgba(224, 231, 255, 1.0)")],
                borderRadius: new BorderRadius(6, 6, 6, 6),
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(12),
                    weightValue: '600',
                    color: new Fill(true, "color", "normal", "rgba(110, 103, 216,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(224, 231, 255, 0.8)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(12),
                    weightValue: '600',
                    color: new Fill(true, "color", "normal", "rgba(110, 103, 216,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                fills: [],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(12),
                    weightValue: '600',
                    color: new Fill(true, "color", "normal", "rgba(121, 128, 140,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(224, 231, 255, 0.8)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(12),
                    weightValue: '600',
                    color: new Fill(true, "color", "normal", "rgba(121, 128, 140,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },

        ];

    }


    static get codeEditorFunctionHeaderStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", "rgba(38, 38, 38, 1.0)")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        color: new Fill(true, "color", "normal", "rgba(250, 250, 250, 1.0)")
                    } as PropertyTextStyle)
                } as ViewStyle)
        ]
    }


    get treeViewStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                //fills: [new Fill(true, "color", "normal", Theme.listBackgroundColor)]
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [],
                //fills: [new Fill(true, "color", "normal", Theme.listRowNormalColor)],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")],
                userSelect: "none"
                // borders: [new Border(true, 2, "solid", "rgba(24, 144, 255, 1.0)")]
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", Theme.listRowSelectedColor)],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "expandCollapseIcon",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", Theme.textColor)
                } as PropertyTextStyle),
                userSelect: "none"
            }
        ]
    }

    static get white(): string {
        return "rgba(255, 255, 255, 1.0)"
    }

    static get borderOpacity(): number {
        return 1.0;
    }

    static get grey50(): string {
        return "rgba(249, 250, 251, 1.0)";
    }

    static get grey300(): string {
        return "rgba(209,213,219, 1.0)";
    }
    static get grey500(): string {
        return "rgba(107,114,128, 1.0)";
    }

    static get grey700(): string {
        return "rgba(55,65,81, 1.0)";
    }
    static get black005(): string {
        return "rgba(0, 0, 0, 0.05)"
    }

    static get buttonActionStyle(): ViewStyle[] {
        const background = "rgba(79,70,229, 1.0)";
        const borders = "rgba(79,70,229, 1.0)";
        const textColor = "rgba(255, 255, 255, 1.0)";
        const hoverBackground = "rgba(67,56,202, 1.0)";
        return Theme.buttonStyleWithParameters(background, borders, textColor, hoverBackground);
    }

    static get buttonStyle(): ViewStyle[] {
        const background = Theme.white;
        const borders = Theme.grey300;
        const textColor = Theme.grey700;
        const hoverBackground = Theme.grey50;
        return Theme.buttonStyleWithParameters(background, borders, textColor, hoverBackground);
    }

    static buttonStyleWithParameters(background: string, borders: string, textColor: string, hoverBackground: string) {
        return [
            setProps(new ViewStyle(),
                {
                    fills: [new Fill(true, "color", "normal", background)],
                    borders: [new Border(true, 1, "solid", borders, BorderSide.all)],
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    shadows: [new Shadow(true, 0, 1, 0, 0, Theme.black005, false)],
                    textStyle: setProps(new PropertyTextStyle(), {
                        size: px(12),
                        weightValue: '600',
                        capitalize: "uppercase",
                        textAlignment: "center",
                        color: new Fill(true, "color", "normal", textColor)
                    } as PropertyTextStyle)
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "color", "normal", hoverBackground)],
                    textStyle: setProps(new PropertyTextStyle(), {
                        size: px(12),
                        weightValue: '600',
                        capitalize: "uppercase",
                        textAlignment: "center",
                        color: new Fill(true, "color", "normal", textColor)
                    } as PropertyTextStyle)
                } as ViewStyle)
        ]
    }



    static get buttonStyleBLACK(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        textAlignment: "center",
                        color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)")
                    } as PropertyTextStyle)
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                } as ViewStyle)
        ]
    }

    static get dropdownStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],

                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                        size: px(10)
                    } as PropertyTextStyle)
                } as ViewStyle),
            {
                id: "glyph",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                    size: px(10),
                    textAlignment: "center",
                    weight: "FontAwesome5ProSolid",
                    fillLineHeight: true
                } as PropertyTextStyle)
            } as ViewStyle,
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: kViewProperties.hovered,
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(77, 77, 77, 1.0), rgba(61, 61, 61, 1.0))")],
                } as ViewStyle)
        ]
    }

    static get tableViewHeaderBackgroundColor(): string { return  "rgba(38, 38, 38, 1.0)"; }
    static get tableViewHeaderLabelColor(): string { return  "rgba(180, 180, 180, 1.0)"; }

    static get tableViewStyle(): ViewStyle[] {
        return [
            {
                kind: "ViewStyle",
                fills: [],
                borderRadius: new BorderRadius(3, 3, 3, 3),
                borders: [new Border(true, 1, "solid", "rgba(17,28,39,0.05)", BorderSide.all)]
            },
            {
                kind: "ViewStyle",
                id: "header",
                fills: [new Fill(true, "color", "normal", "rgba(249, 250, 251, 1.0)")],
                shadows: [new Shadow(true, 0, 1, 0, 0, "rgba(17,28,39,0.05)", false)]
                //borders: [new Border(true, 1, "solid", "rgb(232, 232, 232)", BorderSide.bottom)],

            },
            {
                kind: "ViewStyle",
                id: "column",
                fills: [],
                //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.right)]
            },
            {
                kind: "ViewStyle",
                id: "column.label",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(135, 141, 153, 1.0)"),
                    capitalize: "uppercase"
                } as PropertyTextStyle)
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: false}],
                fills: [new Fill(true, "color", "normal", "rgb(249, 250, 251)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgb(255,255,255)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 1.0)")]
            },

        ];
    }

    static get alertIconStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(), {
                fills: [new Fill(true, "color", "normal", "rgba(254,226,226,1.0)")],
                borderRadius: new BorderRadius(20, 20, 20, 20),
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: "FontAwesome5FreeSolid",
                    size: px(16),
                    color: new Fill(true, "color", "normal", "rgba(220,38,38,1.0)")
                } as PropertyTextStyle)
            } as ViewStyle)
        ]
    }

    static get modalStyle(): ViewStyle[] {
        return [
            setProps(new ViewStyle(), {
                fills: [new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)")],
                borders: [new Border(true, 1, "solid", "rgba(229,231,235,1.0)", BorderSide.all)],
                borderRadius: new BorderRadius(6, 6, 6, 6),
                overflow: "hidden"

            } as ViewStyle)
        ]
    }



}


