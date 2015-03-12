/**
 * Created by linh on 3/9/2015.
 */
// Dữ liệu mẫu
var Months = new Array();
var price=document.getElementById("txtPrice");
var months= document.getElementById("cboxMonths");
var percents = [];
percents[0] = 'A, ' + 81;
percents[1] = 'B, ' +11;
percents[2] = 'C, ' +5;
percents[3] = 'D, ' +3;

Months[0] = "1, 1000000";
Months[1] = "2, 2200000";
Months[2] = "3, 3700000";
Months[3] = "4, 3900000";
Months[4] = "5, 3400000";
Months[5] = "6, 3600000";
Months[6] = "7, 3750000";
Months[7] = "8, 3000000";
Months[8] = "9, 3500000";
Months[9] = "10, 2700000";
Months[10] = "11, 3600000";
Months[11] = "12, 4000000";

var canvas;
var context;
// chart properties
var cWidth, cHeight, cMargin, cSpace;
var cMarginSpace, cMarginHeight;
// bar properties
var bWidth, bMargin, totalBars, maxDataValue;
var bWidthMargin;
// bar animation
var ctr, numctr, speed;
// axis property
var totLabelsOnYAxis;

// hàm khởi tạo biểu đồ
function barChart() {
    canvas = document.getElementById('bchart');
    if (canvas && canvas.getContext) {
        context = canvas.getContext('2d');
    }
    chartSettings();
    drawAxisLabelMarkers();
    drawChartWithAnimation();
}

// Cài đặt khởi tạo biểu đồ
function chartSettings() {
    // chart properties
    cMargin = 25;
    cSpace = 60;
    cHeight = canvas.height - 2 * cMargin - cSpace;
    cWidth = canvas.width - 2 * cMargin - cSpace;
    cMarginSpace = cMargin + cSpace;
    cMarginHeight = cMargin + cHeight;
    // bar properties
    bMargin = 15;
//                        totalBars = Months.length;
    totalBars = percents.length;
    bWidth = (cWidth / totalBars) - bMargin;
    // find maximum value to plot on chart
    maxDataValue = 0;
    for (var i = 0; i < totalBars; i++) {
//                            var arrVal = Months[i].split(",");
        var arrVal = percents[i].split(",");

        var barVal = parseInt(arrVal[1]);
        if (parseInt(barVal) > parseInt(maxDataValue))
            maxDataValue = barVal;
    }
    totLabelsOnYAxis = 8;
    context.font = "9pt Arial";


    // initialize Animation variables
    ctr = 0;
    numctr = 100;
    speed = 10;
}

// draw chart axis, labels and markers
function drawAxisLabelMarkers() {
    context.lineWidth = "2.0";
    // draw y axis
    drawAxis(cMarginSpace, cMarginHeight, cMarginSpace, cMargin);
    // draw x axis
    drawAxis(cMarginSpace, cMarginHeight, cMarginSpace + cWidth, cMarginHeight);
    context.lineWidth = "1.0";
    drawMarkers();
}

// Vẽ hệ trục toạ độ
function drawAxis(x, y, X, Y) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(X, Y);
    context.closePath();
    context.stroke();
}

// draw chart markers on X and Y Axis
function drawMarkers() {
    var numMarkers = parseInt(maxDataValue / totLabelsOnYAxis);
    context.textAlign = "right";
    context.fillStyle = "#000"; ;

    // Y Axis
    for (var i = 0; i <= totLabelsOnYAxis; i++) {
        markerVal = i * numMarkers;
        markerValHt = i * numMarkers * cHeight;
        var xMarkers = cMarginSpace - 5;
        var yMarkers = cMarginHeight - (markerValHt / maxDataValue);
        context.fillText(markerVal, xMarkers, yMarkers, cSpace);
    }

    // X Axis
    context.textAlign = 'center';
    for (var i = 0; i < totalBars; i++) {
//                            arrval = Months[i].split(",");
        arrval = percents[i].split(",");

        name = arrval[0];


        markerXPos = cMarginSpace + bMargin + (i * (bWidth + bMargin)) + (bWidth / 2);
        markerYPos = cMarginHeight+13;
        context.fillText(name, markerXPos, markerYPos, bWidth);
    }
    context.save();
    // Add Y Axis title
    context.translate(cMargin, cHeight / 2);
    context.rotate(Math.PI * -90 / 180);
    context.fillText('', 0, 0);
    context.restore();
    // Add X Axis Title
    context.fillText('', cMarginSpace + (cWidth / 2), cMarginHeight + 30);
}


function drawChartWithAnimation() {
    // Loop through the total bars and draw
    for (var i = 0; i < totalBars; i++) {
//                            var arrVal = Months[i].split(",");
        var arrVal = percents[i].split(",");

        bVal = parseInt(arrVal[1]);
        bHt = (bVal * cHeight / maxDataValue) / numctr * ctr;
        bX = cMarginSpace + (i * (bWidth + bMargin)) + bMargin;
        bY = cMarginHeight - bHt - 2;
        drawRectangle(bX, bY, bWidth, bHt, true);
    }
    // timeout runs and checks if bars have reached the desired height
    // if not, keep growing
    if (ctr < numctr) {
        ctr = ctr + 1;
        setTimeout(arguments.callee, speed);
    }
}


function drawRectangle(x, y, w, h, fill) {
    context.beginPath();
    context.rect(x, y, w, h);
    context.closePath();
    context.stroke();

    if (fill) {
        var gradient = context.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(1, 'rgba(67,203,36,.15)');
        context.fillStyle = gradient;
        context.strokeStyle = gradient;
        context.fill();
    }
}