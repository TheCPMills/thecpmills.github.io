var nBox, mBox, chart;

function setup() {
    nBox = document.getElementById("n");
    mBox = document.getElementById("m");
    chart = document.getElementById('chart');

    nBox.value = "1";
    mBox.value = "1";

    setupDefaultCanvas();
}

function setupDefaultCanvas() {
    // make chart fill the screen minus the header
    chart.width = window.innerWidth;
    chart.height = window.innerHeight - 150;


    // put text that says "Enter values for n and m to generate a distribution"
    var ctx = chart.getContext('2d');
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Enter values for n and m to generate a distribution", chart.width / 2, chart.height / 2);
}

function generateDistribution() {
    var n = parseInt(nBox.value);
    var m = parseInt(mBox.value);

    var strings = [];
    var occurrences = [];
    $.getJSON("https://thecpmills.com/mqp/res/files/" + n + "x" + m + ".json", function (data) {
        strings = data.stringOccurences.map(function (e) {
            return e[0];
        });
        occurrences = data.stringOccurences.map(function (e) {
            return e[1];
        });
    });

    new Chart(chart, {
        type: 'bar',
        data: {
            labels: strings,
            datasets: [{
                label: '# of Occurrences',
                data: occurrences,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}