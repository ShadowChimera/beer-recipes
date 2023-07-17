import classNames from 'classnames';
import { RecipeData } from '../../../api/beerRecipesApi';

export interface PreviewProps {
  data: RecipeData;
}

const Preview = ({ data }: PreviewProps) => {
  return (
    <div>
      <h1 className={classNames('mb-2 font-medium text-4xl')}>{data.name}</h1>
      <p className={classNames(' mb-4 font-medium opacity-60 text-base')}>
        {data.tagline}
      </p>
      <p className={classNames('text-lg mb-4')}>{data.description}</p>
      <p className={classNames('mb-4 text-sm')}>
        By:{' '}
        <span className={classNames('underline')}>{data.contributed_by}</span>
      </p>
      <img
        className={classNames('max-h-[30rem] mx-auto mb-6')}
        src={data.image_url}
        alt="Beer image preview"
      />
    </div>
  );
};

export default Preview;
