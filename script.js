
const SERVER_URL = "http://127.0.0.1:8080/data";

function createChart(id, label, color) {
    return new Chart(document.getElementById(id), {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Sample"
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

const speedChart = createChart(
    "speedChart", "Speed", "#2563eb"
);

const positionChart = createChart(
    "positionChart", "Position X", "#16a34a"
);

const headingChart = createChart(
    "headingChart", "Heading", "#dc2626"
);

const faultChart = createChart(
    "faultChart", "Fault Flag", "#9333ea"
);

let sample = 0;
let busy = false;

function addPoint(chart, value) {
    chart.data.labels.push(sample);
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > 100) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update("none");
}

async function updateDashboard() {
    if (busy) return;
    busy = true;

    try {
        const response = await fetch(SERVER_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        // Current server fields: speed and heading
        const speed = Number(data.matlab_value);
        const heading = Number(data.simulink_value);

        if (!Number.isFinite(speed) ||
            !Number.isFinite(heading)) {
            throw new Error("Invalid server values");
        }

        document.getElementById("speedValue").textContent =
            speed.toFixed(3);

        document.getElementById("headingValue").textContent =
            heading.toFixed(3);

        addPoint(speedChart, speed);
        addPoint(headingChart, heading);

        // These graphs need the additional server fields.
        if (Number.isFinite(Number(data.position_x))) {
            addPoint(positionChart, Number(data.position_x));
        }

        if (Number.isFinite(Number(data.fault_flag))) {
            const fault = Number(data.fault_flag);
            addPoint(faultChart, fault);

            document.getElementById("faultValue").textContent =
                fault === 0 ? "No fault" : "Fault detected";
        }

        document.getElementById("status").textContent =
            "Connected";

        sample++;

    } catch (error) {
        document.getElementById("status").textContent =
            "Server disconnected";

        console.error("Dashboard error:", error);

    } finally {
        busy = false;
    }
}

updateDashboard();
setInterval(updateDashboard, 200);
