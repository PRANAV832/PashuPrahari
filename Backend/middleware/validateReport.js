const validateReport = (req, res, next) => {
  const { farmerName, village, species, affectedAnimals, deaths, symptoms, rawInput, lat, lng } = req.body;

  const errors = [];

  if (!farmerName || typeof farmerName !== 'string' || farmerName.trim() === '') {
    errors.push('farmerName is required and must be a non-empty string.');
  }

  if (!village || typeof village !== 'string' || village.trim() === '') {
    errors.push('village is required and must be a non-empty string.');
  }

  if (!species || typeof species !== 'string' || species.trim() === '') {
    errors.push('species is required and must be a non-empty string.');
  }

  if (affectedAnimals !== undefined && affectedAnimals !== null) {
    const numAffected = Number(affectedAnimals);
    if (isNaN(numAffected) || numAffected < 0) {
      errors.push('affectedAnimals must be a non-negative number.');
    }
  }

  if (deaths !== undefined && deaths !== null) {
    const numDeaths = Number(deaths);
    if (isNaN(numDeaths) || numDeaths < 0) {
      errors.push('deaths must be a non-negative number.');
    }
  }

  if (symptoms !== undefined && symptoms !== null && typeof symptoms !== 'string' && !Array.isArray(symptoms)) {
    errors.push('symptoms must be a string or an array of strings.');
  }

  if (lat !== undefined && lat !== null) {
    const numLat = Number(lat);
    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
      errors.push('lat must be a valid latitude between -90 and 90.');
    }
  }

  if (lng !== undefined && lng !== null) {
    const numLng = Number(lng);
    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
      errors.push('lng must be a valid longitude between -180 and 180.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.join(' ')
    });
  }

  next();
};

module.exports = { validateReport };

