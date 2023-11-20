var xBox, yBox, tableMatrix, lcsSet, lcsTable;
var table;
const svgns = "http://www.w3.org/2000/svg";

function setup() {
    xBox = document.getElementById("x-box");
    yBox = document.getElementById("y-box");
    tableMatrix = document.getElementById("table");
    lcsSet = document.getElementById("lcs-buttons");

    table = document.createElementNS(svgns, "svg");

    xBox.value = "";
    yBox.value = "";
    fillTable();
}

function fillTable() {
    var x = xBox.value;
    var y = yBox.value;

    // if more than 15 characters, only take the first 15
    if (x.length > 15) {
        x = x.substring(0, 15);
        xBox.value = x;
    }
    if (y.length > 15) {
        y = y.substring(0, 15);
        yBox.value = y;
    }

    tableMatrix.innerHTML = "";
    tableMatrix.appendChild(generateSVGTable(x, y, 50, 50));
}

function generateSVGTable(x, y, cellWidth, cellHeight) {
    // clear the table
    table.innerHTML = "";

    var rows = x.length + 2;
    var columns = y.length + 2;

    lcsTable = genLcsTable(x, y);
    var subsequences = findAllLCS(x, y, lcsTable);

    // create buttons for each lcs
    lcsSet.innerHTML = "";
    for (var i = 0; i < subsequences.length; i++) {
        var subsequence = subsequences[i];

        if (subsequence.length > 0) {
            var button = document.createElement("button");
            button.innerHTML = subsequences[i] + "\t";
            button.setAttribute("onclick", "animateBacktracking(\"" + subsequences[i] + "\")");
            lcsSet.appendChild(button);
        }
    }

    table.setAttributeNS(null, "width", columns * cellWidth + 50);
    table.setAttributeNS(null, "height", rows * cellHeight + 50);

    const outline = document.createElementNS(svgns, "rect");
    outline.setAttributeNS(null, "x", 25);
    outline.setAttributeNS(null, "y", 25);
    outline.setAttributeNS(null, "width", columns * cellWidth);
    outline.setAttributeNS(null, "height", rows * cellHeight);
    outline.setAttributeNS(null, "fill", "white");
    outline.setAttributeNS(null, "stroke", "black");
    outline.setAttributeNS(null, "stroke-width", "2");
    table.appendChild(outline);

    const horizontalLine = document.createElementNS(svgns, "line");
    horizontalLine.setAttributeNS(null, "x1", 25);
    horizontalLine.setAttributeNS(null, "y1", 25 + cellHeight);
    horizontalLine.setAttributeNS(null, "x2", 25 + columns * cellWidth);
    horizontalLine.setAttributeNS(null, "y2", 25 + cellHeight);
    horizontalLine.setAttributeNS(null, "stroke", "black");
    horizontalLine.setAttributeNS(null, "stroke-width", "2");
    table.appendChild(horizontalLine);

    const verticalLine = document.createElementNS(svgns, "line");
    verticalLine.setAttributeNS(null, "x1", 25 + cellWidth);
    verticalLine.setAttributeNS(null, "y1", 25);
    verticalLine.setAttributeNS(null, "x2", 25 + cellWidth);
    verticalLine.setAttributeNS(null, "y2", 25 + rows * cellHeight);
    verticalLine.setAttributeNS(null, "stroke", "black");
    verticalLine.setAttributeNS(null, "stroke-width", "2");
    table.appendChild(verticalLine);

    // draw the remaining horizontal lines
    for (var i = 2; i < rows; i++) {
        const line = document.createElementNS(svgns, "line");
        line.setAttributeNS(null, "x1", 25);
        line.setAttributeNS(null, "y1", 25 + i * cellHeight);
        line.setAttributeNS(null, "x2", 25 + columns * cellWidth);
        line.setAttributeNS(null, "y2", 25 + i * cellHeight);
        line.setAttributeNS(null, "stroke", "black");
        line.setAttributeNS(null, "stroke-width", "1");
        table.appendChild(line);
    }

    // draw the remaining vertical lines
    for (var i = 2; i < columns; i++) {
        const line = document.createElementNS(svgns, "line");
        line.setAttributeNS(null, "x1", 25 + i * cellWidth);
        line.setAttributeNS(null, "y1", 25);
        line.setAttributeNS(null, "x2", 25 + i * cellWidth);
        line.setAttributeNS(null, "y2", 25 + rows * cellHeight);
        line.setAttributeNS(null, "stroke", "black");
        line.setAttributeNS(null, "stroke-width", "1");
        table.appendChild(line);
    }

    // draw the y values in the first row starting at column 2
    for (var i = 2; i < columns; i++) {
        const text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "x", 25 + i * cellWidth + 25);
        text.setAttributeNS(null, "y", 25 + cellHeight / 2 + 10);
        text.setAttributeNS(null, "font-size", "20");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "alignment-baseline", "middle");
        text.innerHTML = y[i - 2];
        table.appendChild(text);
    }

    // draw the x values in the first column starting at row 2
    for (var i = 2; i < rows; i++) {
        const text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "x", 25 + cellWidth / 2);
        text.setAttributeNS(null, "y", 25 + i * cellHeight + 25);
        text.setAttributeNS(null, "font-size", "20");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "alignment-baseline", "middle");
        text.innerHTML = x[i - 2];
        table.appendChild(text);
    }

    // fill the second row with 0s
    for (var i = 2; i < rows; i++) {
        const text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "x", 75 + cellWidth / 2);
        text.setAttributeNS(null, "y", 25 + i * cellHeight + 25);
        text.setAttributeNS(null, "font-size", "20");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "alignment-baseline", "middle");
        text.innerHTML = "0";
        table.appendChild(text);
    }

    // fill the second column with 0s
    for (var i = 2; i < columns; i++) {
        const text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "x", 25 + i * cellWidth + 25);
        text.setAttributeNS(null, "y", 75 + cellHeight / 2 + 10);
        text.setAttributeNS(null, "font-size", "20");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "alignment-baseline", "middle");
        text.innerHTML = "0";
        table.appendChild(text);
    }

    // fill the first cell with 0
    const text = document.createElementNS(svgns, "text");
    text.setAttributeNS(null, "x", 75 + cellWidth / 2);
    text.setAttributeNS(null, "y", 75 + cellHeight / 2 + 10);
    text.setAttributeNS(null, "font-size", "20");
    text.setAttributeNS(null, "text-anchor", "middle");
    text.setAttributeNS(null, "alignment-baseline", "middle");
    text.innerHTML = "0";
    table.appendChild(text);

    // draw the lcs values in the table
    for (var i = 2; i < rows; i++) {
        for (var j = 2; j < columns; j++) {
            const text = document.createElementNS(svgns, "text");
            text.setAttributeNS(null, "x", 25 + j * cellWidth + 25);
            text.setAttributeNS(null, "y", 25 + i * cellHeight + 25);
            text.setAttributeNS(null, "font-size", "20");
            text.setAttributeNS(null, "text-anchor", "middle");
            text.setAttributeNS(null, "alignment-baseline", "middle");
            text.innerHTML = lcsTable[i - 1][j - 1];
            table.appendChild(text);
        }
    }

    return table;
}

function animateBacktracking(lcs) {
    var backtracking = findBacktracking(lcsTable, lcs);
    clearBlueObjects();
    var backChild = table.childNodes[1];

    // disable the buttons
    var buttons = document.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
    
    // animate the line
    var i = 0;
    var interval = setInterval(function () {
        var x1 = 50 + (backtracking[i][0] + 1) * 50;
        var y1 = 50 + (backtracking[i][1] + 1) * 50;
        var x2 = 50 + (backtracking[i + 1][0] + 1) * 50;
        var y2 = 50 + (backtracking[i + 1][1] + 1) * 50;

        var line = document.createElementNS(svgns, "line");
        line.setAttributeNS(null, "x1", x1);
        line.setAttributeNS(null, "y1", y1);
        line.setAttributeNS(null, "x2", x1);
        line.setAttributeNS(null, "y2", y1);
        line.setAttributeNS(null, "stroke", "blue");
        line.setAttributeNS(null, "stroke-width", "25");
        line.setAttributeNS(null, "stroke-linecap", "round");
        table.insertBefore(line, backChild);

        var anim = document.createElementNS(svgns, "animate");
        anim.setAttributeNS(null, "attributeName", "x2");
        anim.setAttributeNS(null, "from", x1);
        anim.setAttributeNS(null, "to", x2);
        anim.setAttributeNS(null, "dur", "1s");
        anim.setAttributeNS(null, "fill", "freeze");
        line.appendChild(anim);

        var anim = document.createElementNS(svgns, "animate");
        anim.setAttributeNS(null, "attributeName", "y2");
        anim.setAttributeNS(null, "from", y1);
        anim.setAttributeNS(null, "to", y2);
        anim.setAttributeNS(null, "dur", "0.1s");
        anim.setAttributeNS(null, "fill", "freeze");
        line.appendChild(anim);

        // if line was diagonal, draw a rect at the row and column
        if (x1 != x2 && y1 != y2) {
            var rect = document.createElementNS(svgns, "rect");
            rect.setAttributeNS(null, "x", x1 - 25);
            rect.setAttributeNS(null, "y", 25);
            rect.setAttributeNS(null, "width", "50");
            rect.setAttributeNS(null, "height", "50");
            rect.setAttributeNS(null, "opacity", "0.5");
            rect.setAttributeNS(null, "fill", "blue");
            rect.setAttributeNS(null, "stroke", "blue");
            rect.setAttributeNS(null, "stroke-width", "2");
            table.insertBefore(rect, backChild);

            var rect2 = document.createElementNS(svgns, "rect");
            rect2.setAttributeNS(null, "x", 25);
            rect2.setAttributeNS(null, "y", y1 - 25);
            rect2.setAttributeNS(null, "width", "50");
            rect2.setAttributeNS(null, "height", "50");
            rect2.setAttributeNS(null, "opacity", "0.5");
            rect2.setAttributeNS(null, "fill", "blue");
            rect2.setAttributeNS(null, "stroke", "blue");
            rect2.setAttributeNS(null, "stroke-width", "2");
            table.insertBefore(rect2, backChild);
        }

        i++;
        if (i == backtracking.length - 1) {
            clearInterval(interval);
        }
    }, 500);

    // enable the buttons
    setTimeout(function() {
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }
    }, 500 * (backtracking.length - 1) + 1000);
}

function clearBlueObjects() {
    var blueObjects = document.querySelectorAll("[stroke='blue']");
    for (var i = 0; i < blueObjects.length; i++) {
        blueObjects[i].remove();
    }

}

// lcs dynamic programming algorithm    
function genLcsTable(x, y) {
    var rows = x.length + 1;
    var columns = y.length + 1;

    // create the table
    var table = new Array(rows);
    for (var i = 0; i < rows; i++) {
        table[i] = new Array(columns);
    }

    // fill the table
    for (var i = 0; i < rows; i++) {
        table[i][0] = 0;
    }
    for (var i = 0; i < columns; i++) {
        table[0][i] = 0;
    }
    for (var i = 1; i < rows; i++) {
        for (var j = 1; j < columns; j++) {
            if (x[i - 1] == y[j - 1]) {
                table[i][j] = table[i - 1][j - 1] + 1;
            } else {
                table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
            }
        }
    }

    // return the table
    return table;
}

// find all lcs
function findAllLCS(x, y, lcsTable) {
    // find all lcs
    var lcs = [];
    findAllLCSHelper(lcsTable, x, y, x.length, y.length, lcs, "");

    // remove duplicates
    var uniqueLCS = [];
    for (var i = 0; i < lcs.length; i++) {
        if (!uniqueLCS.includes(lcs[i])) {
            uniqueLCS.push(lcs[i]);
        }
    }

    // sort the lcs
    uniqueLCS.sort(function(a, b) {
        // sort by lexographical order
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }
    });

    // return the lcs
    return uniqueLCS;
}

// helper function for findAllLCS
function findAllLCSHelper(table, x, y, i, j, lcs, currentLCS) {
    if (i == 0 || j == 0) {
        lcs.push(currentLCS);
        return;
    }

    if (x[i - 1] == y[j - 1]) {
        findAllLCSHelper(table, x, y, i - 1, j - 1, lcs, x[i - 1] + currentLCS);
    } else {
        if (table[i - 1][j] >= table[i][j - 1]) {
            findAllLCSHelper(table, x, y, i - 1, j, lcs, currentLCS);
        }
        if (table[i][j - 1] >= table[i - 1][j]) {
            findAllLCSHelper(table, x, y, i, j - 1, lcs, currentLCS);
        }
    }
}

function getSubsequenceIndices(str, lcs) {
    var indices = [];
    // find last index of each character in the lcs
    for (var i = lcs.length - 1; i >= 0; i--) {
        var index = str.lastIndexOf(lcs[i]);
        indices.push(index);
        str = str.substring(0, index);
    }
    indices.reverse();
    return indices;
}

function findBacktracking(table, lcs) {
    var x = xBox.value;
    var y = yBox.value;

    var xIndices = getSubsequenceIndices(x, lcs);
    var yIndices = getSubsequenceIndices(y, lcs);

    var backtracking = [[0,0]];
    var last = [0,0];

    // find specific lcs
    for (var i = 0; i < xIndices.length; i++) {
        var xIndex = xIndices[i] + 1;
        var yIndex = yIndices[i] + 1;

        // find the path from the last index to the current index
        if (xIndex == last[0] + 1 && yIndex == last[1] + 1) {
            backtracking.push([yIndex, xIndex]);
        } else {
            var badX = (xIndex - 1 != last[1]);
            var badY = (yIndex - 1 != last[0]);
            if (badX && badY) {
                backtracking.push([last[0], xIndex - 1]);
                backtracking.push([yIndex - 1, xIndex - 1]);
            } else if (badX) {
                backtracking.push([last[0], xIndex - 1]);
            } else if (badY) {
                backtracking.push([yIndex - 1, last[1]]);
            }
            backtracking.push([yIndex, xIndex]);
        }

        last = [yIndex, xIndex];
    }

    // if there is not a connection to the last cell, add it
    var atFinalX = (last[1] == x.length);
    var atFinalY = (last[0] == y.length);
    if (!atFinalX && !atFinalY) {
        backtracking.push([last[0], x.length]);
        backtracking.push([y.length, x.length]);
    } else if (!atFinalX) {
        backtracking.push([last[0], x.length]);
    } else if (!atFinalY) {
        backtracking.push([y.length, last[1]]);
    }

    // return the backtracking
    backtracking.reverse();
    return backtracking;
}