import { useEffect, useState } from 'react';
import classNames from 'classnames';
import useStore from '../store';

import useScrollObservation from '../hooks/useScrollObservation';

const RecipesList = () => {
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
      {selectedItemsIds.length !== 0 && (
        <div
          className={classNames(
            'fixed inset-x-0 top-0 z-50 flex justify-between p-4 bg-white shadow-md'
          )}
        >
          <span>Selected items count: {selectedItemsIds.length}</span>
          <button onClick={() => void handleRemoveItems()}>Remove</button>
        </div>
      )}
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
            className={classNames('p-4 py-8 flex')}
            onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => {
              e.preventDefault();

              handleItemSelect(item.id);
            }}
          >
            <div
              className={classNames('p-4 border flex items-center flex-grow', {
                'border-sky-500': selectedItemsIds.find(
                  (selectedItemId) => selectedItemId === item.id
                ),
              })}
            >
              {item.id} -- {item.name}
            </div>
          </div>
        );
      })}
      {isLoading && 'Loading...'}
    </div>
  );
};

export default RecipesList;
