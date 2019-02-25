const STR_TITLEEMPTY = "You must enter a title to the document.";
const STR_DEFTITLE   = "New project";
const VAL_MINZOOM    = 25;
const VAL_DEFZOOM    = 100;
const VAL_MAXZOOM    = 500;

var docTitleElement  = document.getElementById("docName");
var zoomLevelElement = document.getElementById("zoomLevel");

var actual_ZoomLevel = VAL_DEFZOOM;
var actual_ProjName  = STR_DEFTITLE;

/* Executed after the page has been loaded. */
(function() {
    docTitleElement.value = STR_DEFTITLE;

    cur = docTitleElement.value.length * 9;
    docTitleElement.style.width = cur + "px";

    zoomLevelElement.value = actual_ZoomLevel + "%";
})();


/*  HEADER  */
docTitleElement.addEventListener("change", function() {
    var cur = docTitleElement.value.length * 9;

    if (cur == 0) {
        alert(STR_TITLEEMPTY);
        docTitleElement.value = STR_DEFTITLE;

        cur = docTitleElement.value.length * 9;
    }

    docTitleElement.style.width = cur + "px";

    actual_ProjName = docTitleElement.value;
});


/*  TOOLBAR  */
zoomLevelElement.addEventListener("focus", function() {
    zoomLevelElement.value = "";
});
zoomLevelElement.addEventListener("blur", function() {
    var newZoom = Number(zoomLevelElement.value.replace("%", ""));

    if (zoomLevelElement.value != "" && newZoom == newZoom) {
        actual_ZoomLevel = Math.min(Math.max(newZoom, VAL_MINZOOM), VAL_MAXZOOM);
    }

    zoomLevelElement.value = actual_ZoomLevel + "%";
    canvas_ApplyZoom(actual_ZoomLevel/100);
});


// Save to png
var prepairedFile;
document.getElementById("snapshotPNGBtn").addEventListener("mousedown", function() {
    prepairedFile = canvas_SaveImage(actual_ProjName + ".png", "png");
});
document.getElementById("snapshotPNGBtn").addEventListener("mouseup", function() {
    prepairedFile.click();
    
    document.body.removeChild(prepairedFile);
});

// Save to svg
document.getElementById("snapshotSVGBtn").addEventListener("mousedown", function() {
    prepairedFile = canvas_SaveImage(actual_ProjName + ".svg", "svg+xml");
});
document.getElementById("snapshotSVGBtn").addEventListener("mouseup", function() {
    prepairedFile.click();
    
    document.body.removeChild(prepairedFile);
});
/*************/
