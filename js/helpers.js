var Color = /** @class */ (function () {
    function Color(hex, r, g, b, a) {
        if (hex != undefined) {
            var cleanHex = hex.replace("#", "");
            this.r = parseInt(cleanHex.substr(0, 2), 16);
            this.g = parseInt(cleanHex.substr(2, 2), 16);
            this.b = parseInt(cleanHex.substr(4, 2), 16);
            if (cleanHex.length == 8)
                this.a = parseInt(cleanHex.substr(6, 2), 16);
            else
                this.a = 255;
        }
        else {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = (a == null) ? 255 : a;
        }
    }
    Color.prototype.toHex = function () {
        return '#' + this.r.toString(16) + this.g.toString(16) + this.b.toString(16) + this.a.toString(16);
    };
    Color.white = new Color(undefined, 255, 255, 255, 255);
    Color.black = new Color(undefined, 0, 0, 0, 255);
    return Color;
}());
