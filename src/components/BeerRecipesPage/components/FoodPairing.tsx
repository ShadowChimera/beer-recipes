import classNames from 'classnames';
import { RecipeData } from '../../../api/beerRecipesApi';
import Section from './Section';

export interface FoodPairingProps {
  data: RecipeData;
}

const FoodPairing = ({ data }: FoodPairingProps) => {
  const foodPairing = data.food_pairing;

  return (
    <Section title="Tastes good with">
      <ul className={classNames('list-disc pl-6')}>
        {foodPairing.map((pair) => (
          <li key={pair}>{pair}</li>
        ))}
      </ul>
    </Section>
  );
};

export default FoodPairing;
