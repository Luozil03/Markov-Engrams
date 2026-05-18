// Middleware centralizzato per gestire errori in Express
export default function errorHandler(err, req, res, next) {
  // console.error(`[${req.method} ${req.path}] Errore:`, err.message);
  // Meglio stampare tutto lo stack trace per capire dove crasha
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Formato ID non valido",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Errore generico (fallback)
  res.status(500).json({
    success: false,
    error: "Errore interno del server",
  });
}
