// pages/api/dawa/validateAddress.js

export default async function handler(req, res) {
    const { address } = req.body;
  
    try {
      const response = await fetch(
        `https://api.dataforsyningen.dk/datavask/adresser?betegnelse=${encodeURIComponent(
          address
        )}`
      );
  
      const data = await response.json();
  
      // Check if the response contains a valid address
      if (
        data &&
        data.resultater &&
        data.resultater.length > 0 &&
        data.resultater[0].kategori === 'A' // Category A indicates a precise match
      ) {
        res.status(200).json({ data: data.resultater[0] });
      } else {
        res.status(400).json({ error: 'Adresse ikke fundet eller ikke præcis.' });
      }
    } catch (error) {
      console.error('Error validating address with DAWA:', error);
      res.status(500).json({ error: 'Fejl ved validering af adresse' });
    }
  }
  