/*****  Global vars  *****/
var sGlobal = Snap("#drawing");
var startMousePosition = { x: 0, y: 0 };

class Viewport {
    node: HTMLElement;
    width: number;
    height: number;
    zoomRatio: number;
    mainPaper: Paper;

    constructor(element: HTMLElement) {
        this.node = element;
        this.width = element.offsetWidth;
        this.height = element.offsetHeight;

        let path = sGlobal.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
            stroke: "#D0E0E0",
            strokeWidth: 1
        });

        let backFill = sGlobal.rect(0, 0, "100%", "100%");
        backFill.attr({
            fill: path.pattern(0, 0, 10, 10)
        });

        // Register events
        this.node.addEventListener("mousewheel", function (e) {
            let event = (<MouseWheelEvent>e);

            var direction = (event.deltaY / 100);
            var mult = actual_ZoomLevel >= 100 ? 10 : 5;
            var newZoom = direction * mult + actual_ZoomLevel;

            actual_ZoomLevel = Math.min(Math.max(newZoom, VAL_MINZOOM), VAL_MAXZOOM);;

            (<HTMLInputElement>zoomLevelElement).value = actual_ZoomLevel + "%";
            viewport.applyZoom(actual_ZoomLevel / 100);
        }, { passive: true });
    }

    applyZoom(ratio: number) {
        this.zoomRatio = ratio;
        sGlobal.node.setAttribute("viewBox", `0 0 ${this.width / ratio} ${this.height / ratio}`);
        this.mainPaper.shape.attr({ strokeWidth: 1/ratio });    // Keep the border constant
    }

    saveImage(filename: string, type: string) {
        var link = document.createElement('a');

        paper.s.node.toDataURL(`image/${type}`, {
            callback: function (data) {
                // Convert image to 'octet-stream' (Just a download, really)
                var image = data.replace(`image/${type}`, "image/octet-stream");
                link.href = image;
            }
        });

        if (typeof link.download === 'string') {
            link.download = filename;

            // Firefox requires the link to be in the body
            document.body.appendChild(link);
        } else {
            window.open(link.href);
        }

        return link;
    }
};

enum Figure {
    Rect,
    Ellipse,
    Stadium,
    Rhombus
};

class Shape {
    position: { x: number, y: number };
    size: { w: number, h: number };
    movable: boolean;
    color: Color;
    figure: Figure;
    shape: any;
    textShape: any;
    parent: Paper;
    beingMoved: boolean;    // Knows if the shaped is being moved

    registerEvents() {
        this.shape.node.addEventListener("mousedown", this);
    }

    centerText(x?: number, y?: number) {
        if (x === undefined) x = this.position.x;
        if (y === undefined) y = this.position.y;

        let txtBBox = this.textShape.getBBox();
        this.textShape.node.setAttribute("x", x + (this.size.w / 2 - txtBBox.width / 2));
        this.textShape.node.setAttribute("y", y + ((38 / 75) * this.size.h + (20 / 3)));    // Magic, do not touch
    }

    handleEvent(event) {
        if (event.type == "mousedown") {
            if (this.movable && event.which == 2) {
                event.preventDefault();
                event.stopPropagation();
                startMousePosition = { x: event.clientX, y: event.clientY };
                this.beingMoved = true;

                paper.s.node.addEventListener("mouseup", this);
                paper.s.node.addEventListener("mousemove", this);
            }
        }
        else if (event.type == "mouseup") {
            if (event.which == 2) {
                this.position = { x: Number(this.shape.node.getAttribute("x")), y: Number(this.shape.node.getAttribute("y")) };
                this.beingMoved = false;

                paper.s.node.removeEventListener("mouseup", this);
                paper.s.node.removeEventListener("mousemove", this);
            }
        }
        else if (event.type == "mousemove") {
            if (this.beingMoved) {
                let deltaPos = { x: (event.clientX - startMousePosition.x) / viewport.zoomRatio, y: (event.clientY - startMousePosition.y) / viewport.zoomRatio };
                let shapeNewPos = {
                    x: this.position.x + deltaPos.x - (paper.gridSize == 0 ? 0 : ((this.position.x + deltaPos.x) % paper.gridSize)),
                    y: this.position.y + deltaPos.y - (paper.gridSize == 0 ? 0 : ((this.position.y + deltaPos.y) % paper.gridSize))
                };

                this.shape.node.setAttribute("x", shapeNewPos.x);
                this.shape.node.setAttribute("y", shapeNewPos.y);

                this.centerText(shapeNewPos.x, shapeNewPos.y);
            }
        }
    }
};

class Paper extends Shape {
    s: any;     // Special kind of S, it's a Snap object. You can draw on top of this one.
    viewport: Viewport;
    gridSize: number = 10;

    constructor(x: number, y: number, width: number, height: number, backcolor: Color, viewport: Viewport) {
        super();    // Obligatory

        this.color = backcolor;
        this.position = { x, y };
        this.size = { w: width, h: height };
        this.viewport = viewport;

        // Nest another SVG to work as the paper
        this.s = Snap(this.size.w, this.size.h);
        sGlobal.node.appendChild(this.s.node);

        this.s.node.setAttribute("viewBox", `0 0 ${this.size.w} ${this.size.h}`);
        this.s.node.setAttribute("x", this.position.x);
        this.s.node.setAttribute("y", this.position.y);

        this.s.node.getElementsByTagName("desc")[0].textContent = "Created with Flower. Thanks to Snap.js";

        // Set-up the shape of the paper
        this.shape = this.s.rect(0, 0, this.size.w, this.size.h, 1, 1);
        this.shape.attr({
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeWidth: 1
        });

        this.registerEvents();
    }

    alignXToCenter() {
        this.position.x = viewport.width / 2 - this.size.w / 2;
        this.s.node.setAttribute("x", this.position.x);
    }

    alignYToCenter() {
        this.position.y = viewport.height / 2 - this.size.h / 2;
        this.s.node.setAttribute("y", this.position.y);
    }

    drawFigure(figure: Figure, x: number | string, y: number | string, width: number, height: number, text: string, backcolor: Color | string) {
        var actualX, actualY;

        if (typeof x === "string") {
            if      (x == "left")   actualX = 0;
            else if (x == "center") actualX = (paper.size.w / 2 - width / 2);
            else if (x == "right")  actualX = (paper.size.w - width);
            else throw "error. 'x' must be either a number or a string containing 'left', 'center' or 'right'";
        }
        else actualX = x;
        if (typeof y === "string") {
            if      (y == "top")    actualY = 0;
            else if (y == "center") actualY = (paper.size.h / 2 - height / 2);
            else if (y == "bottom") actualY = (paper.size.h - height);
            else throw "error. 'y' must be either a number or a string containing 'top', 'center' or 'bottom'";
        }
        else actualY = y;

        var newShape = new Shape();
        newShape.position = { x: actualX, y: actualY };
        newShape.size = { w: width, h: height };
        newShape.color = (backcolor instanceof Color) ? <Color>backcolor : new Color(<string>backcolor)
        newShape.parent = this;
        newShape.figure = figure;

        switch (figure) {
            case Figure.Rect:
                newShape.shape = this.s.rect(actualX, actualY, width, height);
                newShape.shape.attr({
                    fill: newShape.color.toHex(),
                    stroke: "#000000",
                    strokeWidth: 1
                });
                break;
            case Figure.Ellipse:
                newShape.shape = this.s.ellipse(actualX + width / 2, actualY + height / 2, width/2, height/2);
                newShape.shape.attr({
                    fill: newShape.color.toHex(),
                    stroke: "#000000",
                    strokeWidth: 1
                });
                break;
            case Figure.Stadium:
                newShape.shape = this.s.rect(actualX, actualY, width, height, height / 2, height / 2);
                newShape.shape.attr({
                    fill: newShape.color.toHex(),
                    stroke: "#000000",
                    strokeWidth: 1
                });
                break;
            case Figure.Rhombus:
                newShape.shape = this.s.rect(actualX, actualY, width, height);
                newShape.shape.attr({
                    fill: newShape.color.toHex(),
                    stroke: "#000000",
                    strokeWidth: 1
                });
                newShape.shape.node.style['transform'] = "rotateZ(45deg)";
                break;
            default:
                break;
        }

        newShape.shape.node.style['cursor'] = 'pointer';

        var textShape = this.s.text(0, 0, text);
        textShape.attr({
            fill: '#FFFFFF',
            'font-size': 24,
            'font-family': "Roboto Condensed"
        });
        textShape.node.style['text-shadow'] = 'grey 0px 0px 20px';

        newShape.textShape = textShape;
        newShape.centerText();
        newShape.registerEvents();

        return newShape;
    }

    registerEvents() {
        viewport.node.addEventListener("mousedown", this);
    }

    // Events
    handleEvent(event) {
        if (event.type == "mousedown") {
            if (event.which == 2) {
                event.preventDefault();
                startMousePosition = { x: event.clientX, y: event.clientY };
                this.beingMoved = true;

                viewport.node.addEventListener("mouseup", this);
                viewport.node.addEventListener("mousemove", this);
            }
        }
        else if (event.type == "mouseup") {
            if (event.which == 2) {
                this.position = { x: Number(this.s.node.getAttribute("x")), y: Number(this.s.node.getAttribute("y")) };
                this.beingMoved = false;

                viewport.node.removeEventListener("mouseup", this);
                viewport.node.removeEventListener("mousemove", this);
            }
        }
        else if (event.type == "mousemove") {
            if (this.beingMoved) {
                let deltaPos = { x: event.clientX - startMousePosition.x, y: event.clientY - startMousePosition.y };

                this.s.node.setAttribute("x", this.position.x + deltaPos.x / viewport.zoomRatio);
                this.s.node.setAttribute("y", this.position.y + deltaPos.y / viewport.zoomRatio);
            }
        }
    }
};


let viewport: Viewport = new Viewport(document.getElementById("viewport"));
let paper: Paper = new Paper(0, 32, 800, 600, Color.white, viewport);
viewport.mainPaper = paper;

paper.alignXToCenter();
viewport.applyZoom(1);

/*****  Create root node  *****/
(function () {
    var x = "center", y = 32;
    var width = 200, height = 50;

    var rootShape = paper.drawFigure(Figure.Stadium, x, y, width, height, "Start", new Color("#8bc34a"));
    rootShape.movable = true;
})();


/*****  Events  *****/
// Adjust the viewport when resizing
window.addEventListener("resize", function () {
    viewport.width = viewport.node.offsetWidth;
    viewport.height = viewport.node.offsetHeight;

    sGlobal.node.setAttribute("viewBox", `0 0 ${viewport.width / viewport.zoomRatio} ${viewport.height / viewport.zoomRatio}`);
});
// Display context menu
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    var menu = document.getElementById("contextMenu");

    menu.style["display"] = 'block';
    menu.style["top"]  = event.clientY + "px";
    menu.style["left"] = event.clientX + "px";
}, false);
document.addEventListener("click", function (event) {
    var menu = document.getElementById("contextMenu");

    menu.style["display"] = 'none';
});
