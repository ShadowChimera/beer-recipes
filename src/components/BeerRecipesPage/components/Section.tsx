import classNames from 'classnames';

export interface SectionProps {
  title?: string;
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

const Section = ({
  title,
  children,
  className: customClassName,
}: SectionProps) => {
  return (
    <section
      className={classNames(
        customClassName,
        'text-lg py-6 border-b border-opacity-30',
        'last-of-type:border-none',
        'lg:border-b-0 lg:border-r lg:py-0 lg:px-6 lg:border-opacity-5 lg:border-gray-600'
      )}
    >
      <h2 className={classNames('text-2xl mb-2')}>{title}</h2>
      {children}
    </section>
  );
};

export default Section;
