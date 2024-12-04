const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Omogućuje parsiranje JSON tijela zahtjeva

// Putanja do data.json datoteke
const dataFile = path.join(__dirname, "data.json");

// Inicijalizacija podataka ako data.json postoji
let schedules = [];
if (fs.existsSync(dataFile)) {
  const fileData = fs.readFileSync(dataFile, "utf-8");
  schedules = JSON.parse(fileData);
}

// 1. POST - Dodavanje novog grada i rasporeda
app.post("/api/schedules", (req, res) => {
  const { city, dates } = req.body;

  if (!city || !dates || !Array.isArray(dates)) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  schedules.push({ city, dates });

  // Ažuriranje data.json datoteke
  fs.writeFileSync(dataFile, JSON.stringify(schedules, null, 2));

  res
    .status(201)
    .json({ message: `Schedule for city ${city} added successfully` });
});

// 2. GET - Dohvati sve rasporede
app.get("/api/schedules", (req, res) => {
  res.json(schedules);
});

// 3. GET - Dohvati raspored za određeni grad
app.get("/api/schedules/:city", (req, res) => {
  const city = req.params.city;

  // Filtriraj podatke prema gradu
  const cityData = schedules.find(
    (schedule) => schedule.city.toLowerCase() === city.toLowerCase()
  );

  if (!cityData) {
    return res.status(404).json({ message: `City "${city}" not found` });
  }

  res.json(cityData);
});

// 4. DELETE - Brisanje grada i njegovog rasporeda
app.delete("/api/schedules/:city", (req, res) => {
  const city = req.params.city;

  const initialLength = schedules.length;
  schedules = schedules.filter(
    (schedule) => schedule.city.toLowerCase() !== city.toLowerCase()
  );

  if (schedules.length === initialLength) {
    return res.status(404).json({ message: `City "${city}" not found` });
  }

  // Ažuriranje data.json datoteke
  fs.writeFileSync(dataFile, JSON.stringify(schedules, null, 2));

  res.json({ message: `City "${city}" deleted successfully` });
});

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
