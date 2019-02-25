var sGlobal = Snap("#drawing");
var viewport = document.getElementById("viewport");
viewport = {
    node: viewport,
    width: viewport.offsetWidth,
    height: viewport.offsetHeight,
    zoomRatio: 1
};

var paper = {
    width: 800,
    height: 600,
    topPadding: 32,
    shape: null,    // Added on creation
    s: null
};

canvas_ApplyZoom(1);

/*****  Create background  *****/
(function() {
    var background = sGlobal.rect(0, 0, "100%", "100%");

    var p = sGlobal.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
        stroke: "#D0E0E0",
        strokeWidth: 1
    });

    p = p.pattern(0, 0, 10, 10);

    background.attr({
        fill: p
    });
}
)();


/*****  Create paper  *****/
(function () {
    // Nest another SVG to work as the paper
    paper.s = Snap(paper.width, paper.height);
    sGlobal.node.appendChild(paper.s.node);

    paper.s.node.setAttribute("viewBox", `0 0 ${paper.width} ${paper.height}`);
    paper.s.node.setAttribute("x", viewport.width / 2 - paper.width / 2);
    paper.s.node.setAttribute("y", paper.topPadding);

    paper.s.node.getElementsByTagName("desc")[0].textContent = "Created with Flower. Thanks to Snap.js";

    // Set-up the shape of the paper
    paper.shape = paper.s.rect(0, 0, paper.width, paper.height, 1, 1);

    paper.shape.attr({
        fill: "#FFFFFF",
        stroke: "#000000",
        strokeWidth: 1
    });
})();

/*****  Add default font *****/
(function () {
	// No idea yet
})();

/*****  Create root node  *****/
(function () {
	var x = "center", y = 32;
	var width = 200, height = 50;
	
    canvas_DrawStad(x, y, width, height, "Start")
})();


/*****  FUNCTIONS  *****/
function canvas_ApplyZoom(ratio) {
    viewport.zoomRatio = ratio;
    sGlobal.node.setAttribute("viewBox", `0 0 ${viewport.width/ratio} ${viewport.height/ratio}`);
}

function canvas_SaveImage(filename, type)
{
    var link = document.createElement('a');

    paper.s.node.toDataURL(`image/${type}`, {
        callback : function(data) {
            // Convert image to 'octet-stream' (Just a download, really)
            var image = data.replace(`image/${type}`, "image/octet-stream");
            link.href = image;
        }
    });

    if (typeof link.download === 'string') {
       link.download = filename;

       //Firefox requires the link to be in the body
       document.body.appendChild(link);
    } else {
        window.open(link.href);
    }

    return link;
}

/***** DRAWING *****/
function canvas_DrawStad(x, y, width, height, text) {
	var actualX, actualY;
	
	if (x == "center" || x == null) actualX = (paper.width/2 - width/2);
	else actualX = x;
	if (y == "center" || y == null) actualY = (paper.height/2 - height/2);
	else actualY = y;
	
    var shape = paper.s.rect(
		actualX, actualY,	// Position of the element
		width, height,		// Size of the element
		height/2, height/2	// Rounded borders
	);
    shape.attr({
        fill: "#8bc34a",
        stroke: "#000000",
        strokeWidth: 1
    });
	shape.node.style['cursor'] = 'pointer';

	var textShape = paper.s.text(0, 0, text);
    textShape.attr({
		fill: '#ffffff',
        'font-size': 24,
		'font-family': "Roboto Condensed"
    });
	textShape.node.style['text-shadow'] = 'grey 0px 0px 20px';
	// Now that the text has been created, center it
	var txtBBox = textShape.getBBox();
	textShape.node.setAttribute("x", actualX + (width/2 - txtBBox.width/2));
	textShape.node.setAttribute("y", actualY + ((38/75)*height+(20/3)) );	// Magic, do not touch
}

/*****  EVENTS  *****/
// Adjust the viewport when resizing
window.addEventListener("resize", function() {
    viewport.width  = viewport.node.offsetWidth;
    viewport.height = viewport.node.offsetHeight;

    sGlobal.node.setAttribute("viewBox", `0 0 ${viewport.width/viewport.zoomRatio} ${viewport.height/viewport.zoomRatio}`);
});


/*****  DRAG PAPER ACTION  *****/
var dragDown = false;
var startMousePos = { x: 0, y: 0 };
var startPaperPos = { x: 0, y: 0 };

viewport.node.addEventListener("mousedown", function (e) {
    if (e.which == 2) {     // If it's middle-click
        e.preventDefault();
        startMousePos = { x: e.clientX, y: e.clientY };
        startPaperPos = { x: Number(paper.s.node.getAttribute("x")), y: Number(paper.s.node.getAttribute("y")) };
        dragDown = true;
    }
});
viewport.node.addEventListener("mouseup", function (e) {
    if (e.which == 2) dragDown = false;
});
viewport.node.addEventListener("mousemove", function (e) {
    if (dragDown) {
        deltaPos = { x: e.clientX - startMousePos.x, y: e.clientY - startMousePos.y };

        paper.s.node.setAttribute("x", startPaperPos.x + deltaPos.x / viewport.zoomRatio);
        paper.s.node.setAttribute("y", startPaperPos.y + deltaPos.y / viewport.zoomRatio);
    }
});

viewport.node.addEventListener("mousewheel", function (e) {
	var direction = (e.deltaY/100);
	var mult = actual_ZoomLevel >= 100 ? 10 : 5;
	var newZoom = direction*mult + actual_ZoomLevel;
	
	actual_ZoomLevel = Math.min(Math.max(newZoom, VAL_MINZOOM), VAL_MAXZOOM);;
	
    zoomLevelElement.value = actual_ZoomLevel + "%";
    canvas_ApplyZoom(actual_ZoomLevel/100);
}, {passive: true});
