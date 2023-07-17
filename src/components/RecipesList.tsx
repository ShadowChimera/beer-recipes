import { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import useStore from '../store';
import { LoadingIcon } from './icons';

import useScrollObservation from '../hooks/useScrollObservation';

export interface RecipesListProps {
  onRecipeOpen?: (itemId: number) => void;
}

const RecipesList = ({ onRecipeOpen: onItemOpen }: RecipesListProps) => {
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);

  const [renderedItems, renderPartSize] = useStore((state) => [
    state.renderedItems,
    state.renderPartSize,
  ]);

  const [
    fetchData,
    renderItems,
    pushRenderForward,
    pushRenderBack,
    removeItems,
  ] = useStore((state) => [
    state.fetchData,
    state.renderItems,
    state.pushRenderForward,
    state.pushRenderBack,
    state.removeItems,
  ]);

  const firstElementRef = useScrollObservation(
    () => void onScrollUp(),
    [isLoading, renderedItems, isStart]
  );

  const lastElementRef = useScrollObservation(
    () => void onScrollDown(),
    [isLoading, renderedItems, isEnd]
  );

  useEffect(() => {
    setIsLoading(true);

    const fetch = async () => {
      await fetchData();
      await renderItems();
      setIsLoading(false);
    };

    void fetch();
  }, []);

  const onScrollUp = async () => {
    if (isLoading || isStart) {
      return;
    }

    setIsLoading(true);
    setIsEnd(false);
    setIsStart(await pushRenderBack());
    setIsLoading(false);
  };

  const onScrollDown = async () => {
    if (isLoading || isEnd) {
      return;
    }

    setIsLoading(true);
    setIsStart(false);
    setIsEnd(await pushRenderForward());
    setIsLoading(false);
  };

  const handleRecipeOpen = (itemId: number) => {
    onItemOpen?.(itemId);
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItemsIds((prevSelectedItems) => {
      const isSelected = prevSelectedItems.find(
        (selectedItemId) => selectedItemId === itemId
      );

      if (isSelected) {
        return prevSelectedItems.filter(
          (selectedItemId) => selectedItemId !== itemId
        );
      }

      return [...prevSelectedItems, itemId];
    });
  };

  const handleRemoveItems = async () => {
    setIsLoading(true);
    setSelectedItemsIds([]);
    await removeItems(selectedItemsIds);
    setIsLoading(false);
  };

  return (
    <div>
      <CSSTransition
        in={selectedItemsIds.length !== 0}
        timeout={150}
        classNames={{
          enterActive: 'opacity-100 visible z-50',
          enterDone: 'opacity-100 visible z-50',
          exitActive: 'opacity-0 visible z-50',
          exitDone: 'opacity-0 -z-50 invisible',
        }}
        mountOnEnter
      >
        <div
          className={classNames(
            'fixed inset-x-0 top-0 z-50 flex justify-between p-4 bg-white shadow-md transition-opacity duration-150'
          )}
        >
          <div
            className={classNames(
              'flex justify-between items-center max-w-[72ch] w-full px-4 mx-auto'
            )}
          >
            <span className={classNames('text-lg')}>
              Selected items count: {selectedItemsIds.length}
            </span>
            <button
              onClick={() => void handleRemoveItems()}
              className={classNames(
                'px-4 py-2 rounded bg-black border border-opacity-50 bg-opacity-0 transition-colors',
                'hover:bg-opacity-5',
                'active:bg-opacity-10'
              )}
            >
              Remove
            </button>
          </div>
        </div>
      </CSSTransition>
      {isLoading && renderedItems.length > 0 && (
        <div className={classNames('w-fit mx-auto')}>
          <LoadingIcon />
        </div>
      )}
      <div className={classNames('max-w-[72ch] mx-auto')}>
        {renderedItems.map((item, index) => {
          let ref;

          if (index === renderedItems.length - 1) {
            ref = lastElementRef;
          }

          if (index === 0) {
            ref = firstElementRef;
          }

          return (
            <div
              ref={ref}
              key={item.id}
              style={{ height: `${100 / renderPartSize}vh` }}
              className={classNames('p-4 py-2 flex')}
            >
              <article
                onClick={() => handleRecipeOpen(item.id)}
                onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.preventDefault();

                  handleItemSelect(item.id);
                }}
                className={classNames(
                  'flex justify-between gap-8 bg-gray-400 bg-opacity-0 p-2 border rounded-md flex-grow transition-colors duration-100 cursor-pointer',
                  'hover:bg-opacity-5',
                  'lg:gap-16',
                  {
                    'border-sky-500': selectedItemsIds.find(
                      (selectedItemId) => selectedItemId === item.id
                    ),
                  }
                )}
              >
                <div
                  className={classNames(
                    'flex-1 w-full flex-shrink flex flex-col'
                  )}
                >
                  <h2
                    className={classNames('text-xl font-medium leading-6 mb-1')}
                  >
                    {item.name}
                  </h2>
                  <p className={classNames('text-sm font-medium opacity-50')}>
                    {item.tagline}
                  </p>
                  <p className={classNames('hidden flex-1 mt-2', 'lg:block')}>
                    {truncate(item.description, 100)}
                  </p>
                  <p
                    className={classNames(
                      'flex-1 flex flex-col justify-end text-xs underline',
                      'lg:flex-initial'
                    )}
                  >
                    {item.contributed_by}
                  </p>
                </div>
                <img
                  src={item.image_url}
                  alt="Image preview"
                  className={classNames('h-full')}
                />
              </article>
            </div>
          );
        })}
      </div>
      {isLoading && (
        <div className={classNames('w-fit mx-auto')}>
          <LoadingIcon />
        </div>
      )}
    </div>
  );
};

export default RecipesList;

const truncate = (text: string, maxLength = 300, end = '...') => {
  text = text.slice(0, maxLength);
  text = text.slice(0, text.lastIndexOf(' '));

  return `${text}${end}`;
};
