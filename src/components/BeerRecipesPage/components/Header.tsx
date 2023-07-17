import classNames from 'classnames';
import { CloseIcon } from '../../icons';

export interface HeaderProps {
  onClose?: () => void;
}

const Header = ({ onClose }: HeaderProps) => {
  return (
    <header
      className={classNames(
        'sticky top-0 inset-x-0 z-50 px-4 py-2 bg-white border-b border-opacity-20'
      )}
    >
      <div
        className={classNames(
          'max-w-[72ch] w-full mx-auto',
          'lg:max-w-[65rem]'
        )}
      >
        <button
          onClick={onClose}
          className={classNames(
            'flex items-center w-10 h-10 p-2 rounded-md bg-neutral-950 bg-opacity-0 transition-colors',
            'hover:bg-opacity-5',
            'active:bg-opacity-10'
          )}
        >
          <CloseIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
