
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

let latestData = null;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/data", (req, res) => {
    const data = req.body;

    if (!data || !Array.isArray(data.time)) {
        return res.status(400).json({
            error: "Invalid simulation data"
        });
    }

    latestData = data;

    console.log("Simulation received:", data.time.length, "samples");

    res.json({
        success: true,
        samples: data.time.length
    });
});

app.get("/api/data", (req, res) => {
    if (!latestData) {
        return res.status(404).json({
            error: "No simulation results received yet"
        });
    }

    res.json(latestData);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dashboard server listening on port ${PORT}`);
});
