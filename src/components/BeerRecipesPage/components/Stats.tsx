import classNames from 'classnames';
import { RecipeData } from '../../../api/beerRecipesApi';
import Section from './Section';
import Card from './Card';

export interface StatsProps {
  data: RecipeData;
}

const Stats = ({ data }: StatsProps) => {
  return (
    <Section title="Beer Stats" className={classNames('!py-0')}>
      <div className={classNames('mb-4')}>
        <div className={classNames('grid grid-cols-2 gap-4')}>
          <Card title="Acidity (pH)" text={data.ph} />
          <Card title="Alcohol (abv)" text={data.abv} />
        </div>
        <div className={classNames('grid grid-cols-2 gap-4')}>
          <Card title="Bitterness (ibu)" text={data.ibu} />
          <Card title="Attenuation" text={data.attenuation_level} />
        </div>
      </div>

      <div className={classNames('mb-8')}>
        <Card
          sections={[
            {
              title: 'Volume',
              text: data.volume.value,
            },
            {
              title: 'Pre boil volume',
              text: data.boil_volume.value,
            },
          ]}
        />
        <Card
          sections={[
            {
              title: 'original gravity',
              text: data.target_og,
            },
            {
              title: 'final gravity',
              text: data.target_fg,
            },
          ]}
        />
        <Card
          sections={[
            {
              title: 'Color (srm)',
              text: data.srm,
            },
            {
              title: 'Color (ebc)',
              text: data.ebc,
            },
          ]}
        />
      </div>

      <Card title="First brewed" text={data.first_brewed} />
    </Section>
  );
};

export default Stats;
