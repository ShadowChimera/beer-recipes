import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { RecipeData } from '../../api/beerRecipesApi';
import useStore from '../../store';

import Ingredients from './components/Ingredients';
import Stats from './components/Stats';
import Preview from './components/Preview';
import Header from './components/Header';
import Method from './components/Method';
import FoodPairing from './components/FoodPairing';

export interface BeerRecipePageProps {
  id: number;
  onClose: () => void;
}

const BeerRecipePage = ({ id, onClose }: BeerRecipePageProps) => {
  const [data, setData] = useState<RecipeData | null>(null);

  const fetchData = useStore((state) => state.fetchDataWithoutUpdate);

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchData();
      setData(data?.find((item) => item.id === id) ?? null);
    };

    void fetch();
  }, [id]);

  if (!data) {
    return <></>;
  }

  console.log(data);

  return (
    <div className={classNames('absolute inset-0')}>
      <Header onClose={onClose} />
      <div
        className={classNames(
          'max-w-[72ch] mx-auto p-4 text-neutral-900',
          'lg:max-w-[65rem]'
        )}
      >
        <div className={classNames('lg:grid lg:grid-cols-2 lg:gap-16')}>
          <Preview data={data} />
          <Stats data={data} />
        </div>
        <div className={classNames('lg:grid lg:grid-cols-3 lg:gap-4 lg:mt-4')}>
          <Ingredients data={data} />
          <Method data={data} />
          <FoodPairing data={data} />
        </div>
      </div>
    </div>
  );
};

export default BeerRecipePage;
