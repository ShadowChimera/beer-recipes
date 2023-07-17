import { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { getShortUnit } from '../../../utils/units';
import { RecipeData } from '../../../api/beerRecipesApi';
import Section from './Section';
import Subsection from './Subsection';

export interface IngredientsProps {
  data: RecipeData;
}

interface Hop {
  name: string;
  amount: {
    value: number;
    unit: string;
  };
  add: string;
  attribute: string;
}

enum hopsOrder {
  start,
  middle,
  end,
}

const Ingredients = ({ data }: IngredientsProps) => {
  const ingredients = data.ingredients;

  const getHopItems = useCallback(() => {
    const sortedHops = ingredients.hops.sort(
      (a, b) =>
        hopsOrder[a.add as keyof typeof hopsOrder] -
        hopsOrder[b.add as keyof typeof hopsOrder]
    );

    let lastAdd: string | null = null;

    const sections: Array<Hop[]> = [];
    let lastSection: Hop[] = [];

    sortedHops.forEach((hop) => {
      const isNewSection = hop.add !== lastAdd;
      lastAdd = hop.add;

      if (isNewSection) {
        lastSection = [];
        sections.push(lastSection);
      }

      lastSection.push(hop);
    });

    return sections.map((section, index) => (
      <section key={index} className={classNames('mb-4')}>
        <h4 className={classNames('text-base uppercase opacity-70')}>
          Step {index + 1}
        </h4>
        <ul className={classNames('list-disc ml-6')}>
          {section.map((hop) => (
            <li key={hop.name}>
              <span className={classNames('flex items-end gap-4')}>
                <span>
                  <span>{hop.name}, </span>
                  <span>
                    <span>{hop.amount.value} </span>
                    <span>{getShortUnit(hop.amount.unit)}</span>
                  </span>
                </span>
                <span
                  className={classNames(
                    'flex-1 text-sm font-medium opacity-40'
                  )}
                >
                  for {hop.attribute}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    ));
  }, [ingredients]);

  const hopItems = useMemo(() => getHopItems(), [getHopItems]);

  return (
    <Section title="Ingredients">
      <Subsection title="Hops">{hopItems}</Subsection>
      <Subsection title="Malt">
        <ul className={classNames('list-disc ml-6')}>
          {ingredients.malt.map((malt) => (
            <li key={malt.name}>
              <span>{malt.name}, </span>
              <span>
                <span>{malt.amount.value} </span>
                <span>{getShortUnit(malt.amount.unit)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Subsection>
      <Subsection title="Yeast">{ingredients.yeast}</Subsection>
    </Section>
  );
};

export default Ingredients;
