const Counter = require('../models/Counter');

/**
 * Generates an atomic sequential movie code per release year.
 * Format: MV-<releaseYear>-<3-digit sequence>, e.g. MV-2019-004
 * @param {number} releaseYear 
 * @returns {Promise<string>}
 */
const generateMovieCode = async (releaseYear) => {
  const counter = await Counter.findOneAndUpdate(
    { year: releaseYear },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const formattedSeq = String(counter.seq).padStart(3, '0');
  return `MV-${releaseYear}-${formattedSeq}`;
};

module.exports = { generateMovieCode };
