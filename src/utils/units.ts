const units: {
  [key: string]: string;
} = {
  litres: 'l',
  grams: 'g',
  kilograms: 'kg',
  gallons: 'gal',
  celsius: '°C',
};

export const getShortUnit = (unit: string) => {
  const key = unit.toLocaleLowerCase();

  if (key in units) {
    return units[key];
  }

  return unit;
};
