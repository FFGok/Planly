const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname)
  )
);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Planly"
  });
});

app.get("*", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );
});

app.listen(PORT, () => {
  console.log(
    `Planly running on port ${PORT}`
  );
});
