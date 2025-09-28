const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let triggerNPK = false;
let latestData = null;

// Trigger endpoint (call this to request fresh NPK data)
app.get("/api/trigger-npk", (req, res) => {
  triggerNPK = true;
  res.json({ message: "ESP32 will send NPK data on next poll" });
});

// ESP32 checks this every few seconds
app.get("/api/check-trigger", (req, res) => {
  res.json({ trigger: triggerNPK });
});

// ESP32 sends data here
app.post("/api/npk", (req, res) => {
  const { nitrogen, phosphorus, potassium } = req.body;
  if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
    return res.status(400).json({ error: "Missing fields" });
  }

  latestData = { nitrogen, phosphorus, potassium, timestamp: new Date() };
  triggerNPK = false; // reset trigger
  console.log("Received from ESP32:", latestData);

  res.json({ success: true, data: latestData });
});

// Get latest stored value
app.get("/api/npk", (req, res) => {
  res.json(latestData || { message: "No data yet" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
