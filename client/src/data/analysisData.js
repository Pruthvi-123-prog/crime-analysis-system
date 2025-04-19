import crimeData from './crime_dataset.json';

export const analysisData = {
  hotspots: processCrimeHotspots(),
  genderAnalysis: processGenderData(),
  weaponAnalysis: processWeaponData()
};

function processCrimeHotspots() {
  return crimeData.map(crime => ({
    Latitude: parseFloat(crime.Latitude),
    Longitude: parseFloat(crime.Longitude),
    intensity: calculateIntensity(crime),
    cases: 1,
    crimeType: crime.crime_description,
    city: crime.city
  }));
}

function processGenderData() {
  const genderCounts = crimeData.reduce((acc, crime) => {
    acc[crime.victim_gender] = (acc[crime.victim_gender] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(genderCounts),
    values: Object.values(genderCounts)
  };
}

function processWeaponData() {
  const cities = [...new Set(crimeData.map(crime => crime.city))];
  const weapons = [...new Set(crimeData.map(crime => crime.weapon_used))];
  
  const values = cities.map(city => 
    weapons.map(weapon => 
      crimeData.filter(crime => 
        crime.city === city && crime.weapon_used === weapon
      ).length
    )
  );

  return {
    cities,
    weapons,
    values
  };
}

function calculateIntensity(crime) {
  // Normalize based on multiple factors
  let baseIntensity = 0;
  
  // Higher intensity for violent crimes
  if (crime.crime_domain === 'Violent Crime') baseIntensity += 0.3;
  if (crime.crime_domain === 'Fire Accident') baseIntensity += 0.2;
  
  // Higher intensity for dangerous weapons
  if (['Firearm', 'Explosives', 'Knife'].includes(crime.weapon_used)) {
    baseIntensity += 0.2;
  }
  
  // Higher intensity for crimes with more police deployed
  const policeDeployed = parseInt(crime.police_deployed);
  baseIntensity += Math.min(policeDeployed / 20, 0.3);
  
  // Cap the intensity between 0 and 1
  return Math.min(Math.max(baseIntensity, 0.1), 1);
}