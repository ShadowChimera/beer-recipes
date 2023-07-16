const API_URL = 'https://api.punkapi.com/v2/beers?page=';

export interface RecipeData {
  id: number;
  name: string;
  tagline: string;
  first_brewed: string;
  description: string;
  image_url: string;
  abv: number;
  ibu: number;
  target_fg: number;
  target_og: number;
  ebc: number;
  srm: number;
  ph: number;
  attenuation_level: number;
  volume: { value: number; unit: string };
  boil_volume: { value: number; unit: string };
  method: {
    mash_temp: Array<{
      temp: { value: number; unit: string };
      duration: number;
    }>;
    fermentation: {
      temp: { value: number; unit: string };
    };
    twist: string;
  };
  ingredients: {
    malt: Array<{
      name: string;
      amount: { value: number; unit: string };
    }>;
    hops: Array<{
      name: string;
      amount: { value: number; unit: string };
      add: string;
      attribute: string;
    }>;
    yeast: string;
  };
  food_pairing: string[];
  brewers_tips: string;
  contributed_by: string;
}

export const getRecipesData = async (pageIndex: number) => {
  if (pageIndex < 1) {
    return null;
  }

  const response = await fetch(`${API_URL}${pageIndex}`);

  if (!response.ok) {
    console.error('HTTP error:', response.status, response);
    return null;
  }

  const data = (await response.json()) as RecipeData[];

  if (!data.length) {
    return null;
  }

  return data;
};
