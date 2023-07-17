import classNames from 'classnames';

export interface SectionProps {
  title?: string;
  children?: React.ReactNode | React.ReactNode[];
}

const Subsection = ({ title, children }: SectionProps) => {
  return (
    <section className={classNames('mb-4', 'last:mb-0')}>
      <h3 className={classNames('text-xl mb-2')}>{title}</h3>
      {children}
    </section>
  );
};

export default Subsection;
