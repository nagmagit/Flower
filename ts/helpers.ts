declare var Snap: any;

class Color {
    r: Number;
    g: Number;
    b: Number;
    a: Number;

    static white: Color = new Color(undefined, 255, 255, 255, 255);
    static black: Color = new Color(undefined, 0, 0, 0, 255);

    constructor(hex?: string, r?: Number, g?: Number, b?: Number, a?: Number) {
        if (hex != undefined) {
            var cleanHex = hex.replace("#", "");

            this.r = parseInt(cleanHex.substr(0, 2), 16);
            this.g = parseInt(cleanHex.substr(2, 2), 16);
            this.b = parseInt(cleanHex.substr(4, 2), 16);

            if (cleanHex.length == 8)
                this.a = parseInt(cleanHex.substr(6, 2), 16);
            else
                this.a = 255;
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = (a == null) ? 255 : a;
        }
    }

    toHex() {
        return '#' + this.r.toString(16) + this.g.toString(16) + this.b.toString(16) + this.a.toString(16);
    }
}
