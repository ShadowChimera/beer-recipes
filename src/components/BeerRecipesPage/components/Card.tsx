import classNames from 'classnames';

export interface CardProps {
  title?: string | number;
  text?: string | number;
  sections?: Array<{
    title?: string | number;
    text?: string | number;
  }>;
}

const Card = ({ title, text, sections }: CardProps) => {
  if (!sections) {
    sections = [
      {
        title,
        text,
      },
    ];
  }

  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${sections.length}, 1fr)`,
      }}
      className={classNames(
        'grid mb-4 p-2 rounded bg-neutral-100 bg-opacity-50 text-lg'
      )}
    >
      {sections &&
        sections.map((data) => (
          <div
            key={String(data.title)}
            className={classNames(
              'flex flex-col justify-between px-2 border-l border-opacity-5',
              'first:border-none'
            )}
          >
            <p
              className={classNames(
                'mb-2 text-xs font-medium opacity-60 uppercase tracking-widest'
              )}
            >
              {data.title}
            </p>
            <p>{data.text}</p>
          </div>
        ))}
    </div>
  );
};

export default Card;
