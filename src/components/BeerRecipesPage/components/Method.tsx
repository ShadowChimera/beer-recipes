import classNames from 'classnames';
import { RecipeData } from '../../../api/beerRecipesApi';
import { getShortUnit } from '../../../utils/units';
import Section from './Section';
import Subsection from './Subsection';

export interface MethodProps {
  data: RecipeData;
}

const Method = ({ data }: MethodProps) => {
  const method = data.method;

  return (
    <Section title="Method">
      {method.fermentation && (
        <Subsection title="Step: Mash">
          <ul className={classNames('list-disc pl-6')}>
            {method.mash_temp.map((mash, index) => (
              <li key={index}>
                <span>Temperature: </span>
                <span>{mash.temp.value} </span>{' '}
                <span>{getShortUnit(mash.temp.unit)}</span>
                {mash.duration !== null && (
                  <span>; duration: {mash.duration}</span>
                )}
              </li>
            ))}
          </ul>
        </Subsection>
      )}
      {method.mash_temp.length > 0 && (
        <Subsection title="Step: Fermentation">
          <p>
            Temperature: <span>{method.fermentation.temp.value} </span>{' '}
            <span>{getShortUnit(method.fermentation.temp.unit)} </span>
          </p>
        </Subsection>
      )}
      {method.twist && (
        <Subsection title="Step: Twist">
          <p>{method.twist}</p>
        </Subsection>
      )}
    </Section>
  );
};

export default Method;
