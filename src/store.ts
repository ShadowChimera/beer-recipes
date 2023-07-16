import { create } from 'zustand';
import { getRecipesData, RecipeData } from './api/beerRecipesApi';

interface RenderRangeItem {
  index: number;
  page: number;
  maxIndex: number | null;
}

export interface RenderRange {
  start: RenderRangeItem;
  end: RenderRangeItem;
}

export interface StoreState {
  page: number;
  data: RecipeData[] | null;
  isOutOfRange: boolean;
  removedItemsIds: number[];
  renderSize: number;
  renderPartSize: number;
  renderedItems: RecipeData[];
  renderRange: RenderRange | null;

  fetchData: (page?: number) => Promise<RecipeData[] | null>;
  fetchDataWithoutUpdate: (page?: number) => Promise<RecipeData[] | null>;
  setRenderSize: (renderSize: number) => void;
  renderItems: () => Promise<void>;
  pushRenderForward: () => Promise<boolean>;
  pushRenderBack: () => Promise<boolean>;
  pushRender: (direction: 'forward' | 'back') => Promise<boolean>;
}

const useStore = create<StoreState>((set, get) => ({
  page: 1,
  data: null,
  isOutOfRange: false,
  removedItemsIds: [],
  renderedItems: [],
  renderSize: 15,
  renderPartSize: 5,
  renderRange: null,

  fetchData: async (page) => {
    page = page ?? get().page;

    const data = await get().fetchDataWithoutUpdate(page);

    const isOutOfRange = !!data;

    set({ page, data, isOutOfRange });
    return data;
  },
  fetchDataWithoutUpdate: async (page) => {
    page = page ?? get().page;

    if (page === get().page && get().data) {
      return get().data;
    }

    const data = await getRecipesData(page);
    return data;
  },

  setRenderSize: (renderSize) => {
    const RENDER_PARTS = 3;
    const renderPartSize = Math.trunc(renderSize / 3);

    if (renderSize % RENDER_PARTS !== 0) {
      console.warn(
        `Render size must be able to split into ${RENDER_PARTS} equal parts, the size will be adjusted: new render size = ${
          renderPartSize * RENDER_PARTS
        }`
      );
    }

    renderSize = renderPartSize * RENDER_PARTS;

    set({ renderSize, renderPartSize });
  },
  renderItems: async () => {
    const data = get().data ?? (await get().fetchData());

    if (!data) {
      return;
    }

    const renderSize = get().renderSize;
    const page = get().page;

    let renderRange = get().renderRange;
    let renderedItems: RecipeData[] = [];

    // TODO: if renderRange already exists (not important)
    if (!renderRange) {
      renderRange = {
        start: {
          index: 0,
          page,
          maxIndex: data.length,
        },
        end: {
          index: renderSize,
          page,
          maxIndex: data.length,
        },
      };

      renderedItems = data.slice(
        renderRange.start.index,
        renderRange.end.index
      );

      if (
        renderRange.end.maxIndex &&
        renderRange.end.index > renderRange.end.maxIndex
      ) {
        do {
          const nextPage = renderRange.end.page + 1;
          const nextData = await get().fetchDataWithoutUpdate(nextPage);

          if (!nextData) {
            renderRange.end.index = renderRange.end.maxIndex;
            break;
          }

          renderRange.end.page = nextPage;
          renderRange.end.index -= renderRange.end.maxIndex ?? 0;
          renderRange.end.maxIndex = nextData.length;

          renderedItems = [
            ...renderedItems,
            ...nextData.slice(0, renderRange.end.index),
          ];
        } while (renderRange.end.index <= renderRange.end.maxIndex);
      }

      // console.log('newRenderRange', renderRange);
      // console.log('renderedItems', renderedItems);

      set({ renderRange, renderedItems });
    }
  },

  pushRender: async (direction) => {
    const renderRange = get().renderRange;

    if (!renderRange) {
      await get().renderItems();
      return false;
    }

    const [newRenderRange, newItems, isOverflow] = await pushRange(
      renderRange,
      get().renderedItems,
      get().renderPartSize,
      direction,
      get().fetchData
    );

    // if (
    //   renderRange.start.index === newRenderRange.start.index &&
    //   renderRange.start.page === newRenderRange.start.page &&
    //   renderRange.end.index === newRenderRange.end.index &&
    //   renderRange.end.page === newRenderRange.end.page
    // ) {
    //   return;
    // }

    set({
      renderRange: newRenderRange,
      renderedItems: newItems,
    });

    return isOverflow;
  },
  pushRenderForward: async () => {
    return await get().pushRender('forward');
  },
  pushRenderBack: async () => {
    return await get().pushRender('back');
  },
}));

export default useStore;

const pushRange: (
  range: RenderRange,
  items: RecipeData[],
  pushSize: number,
  direction: 'forward' | 'back',
  fetchData: (page?: number) => Promise<RecipeData[] | null>
) => Promise<[RenderRange, RecipeData[], boolean]> = async (
  range,
  items,
  pushSize,
  direction,
  fetchData
) => {
  let isOverflow = false;

  const isForward = direction === 'forward';
  const indexStart = range.start.index;
  const indexEnd = range.end.index;

  console.log('(pushRange) beginning items:', items);
  console.log('(pushRange) beginning range:', JSON.stringify(range));

  range = pushRangeIndexes(range, pushSize, direction);

  console.log(
    '(pushRange<-pushRangeIndexes) pushed range:',
    JSON.stringify(range)
  );

  let stayedRangeIndexStart = isForward ? pushSize : 0;
  let stayedRangeIndexEnd = isForward ? items.length : items.length - pushSize;

  let stayedItems = [...items];

  const data = await fetchData(isForward ? range.end.page : range.start.page);

  let newItems: RecipeData[] = [];

  if (data) {
    newItems = isForward
      ? data.slice(indexEnd, range.end.index)
      : data.slice(range.start.index > 0 ? range.start.index : 0, indexStart);
  }

  console.log('(pushRange) newItems:', newItems);

  const [adjustedRange, passedData] = await adjustRange(
    range,
    direction,
    fetchData,
    async (extraRangeSize) => {
      return new Promise((res) => {
        isOverflow = true;

        if (isForward) {
          stayedRangeIndexStart -= extraRangeSize;
          return res();
        }

        stayedRangeIndexEnd += extraRangeSize;

        res();
      });
    }
  );

  stayedItems = [
    ...stayedItems.slice(stayedRangeIndexStart, stayedRangeIndexEnd),
  ];

  console.log('(pushRange) stayedRangeItems:', stayedItems);

  console.log(
    '(pushRange<-adjustRange) adjustedRange:',
    JSON.stringify(adjustedRange)
  );
  console.log('(pushRange<-adjustRange) passedData:', passedData);

  range = adjustedRange;

  items = isForward
    ? [...stayedItems, ...newItems, ...passedData]
    : [...passedData, ...newItems, ...stayedItems];

  console.log('(pushRange) final items:', items);

  await fetchData(isForward ? range.end.page : range.start.page);

  return [range, items, isOverflow];
};

const pushRangeIndexes = (
  range: RenderRange,
  pushSize: number,
  direction: 'forward' | 'back'
) => {
  if (direction === 'back') {
    pushSize = -pushSize;
  }

  return {
    start: {
      ...range.start,
      index: range.start.index + pushSize,
    },
    end: {
      ...range.end,
      index: range.end.index + pushSize,
    },
  };
};

const adjustRange: (
  range: RenderRange,
  pushDirection: 'forward' | 'back',
  fetchData: (page?: number) => Promise<RecipeData[] | null>,
  onDataOverflow?: (extraRangeSize: number) => Promise<void>
) => Promise<[RenderRange, RecipeData[]]> = async (
  range,
  pushDirection,
  fetchData,
  onDataOverflow
) => {
  let passedData = [];

  const checkOverflowStart = (rangeItem: RenderRangeItem) =>
    rangeItem.index < 0;
  const checkOverflowEnd = (rangeItem: RenderRangeItem) =>
    !!rangeItem.maxIndex && rangeItem.index >= rangeItem.maxIndex;

  let [rangeStart, passedDataStart] = await adjustRangeItem(
    range.start,
    fetchData,
    checkOverflowStart,
    checkOverflowEnd,
    async (extraRangeSize) => {
      range.end.index += extraRangeSize;
      await onDataOverflow?.(extraRangeSize);
    }
  );

  const [rangeEnd, passedDataEnd] = await adjustRangeItem(
    range.end,
    fetchData,
    (rangeItem) => rangeItem.index <= 0,
    (rangeItem) => !!rangeItem.maxIndex && rangeItem.index > rangeItem.maxIndex,
    async (extraRangeSize) => {
      rangeStart.index -= extraRangeSize;
      [rangeStart, passedDataStart] = await adjustRangeItem(
        rangeStart,
        fetchData,
        checkOverflowStart,
        checkOverflowEnd
      );

      await onDataOverflow?.(extraRangeSize);
    }
  );

  if (pushDirection === 'forward') {
    passedData = passedDataEnd;
  } else {
    passedData = passedDataStart;
  }

  range = {
    start: rangeStart,
    end: rangeEnd,
  };

  return [range, passedData];
};

const adjustRangeItem: (
  rangeItem: RenderRangeItem,
  fetchData: (page?: number) => Promise<RecipeData[] | null>,
  checkOverflowStart: (rangeItem: RenderRangeItem) => boolean,
  checkOverflowEnd: (rangeItem: RenderRangeItem) => boolean,
  onDataOverflow?: (extraRangeSize: number) => Promise<void>
) => Promise<[RenderRangeItem, RecipeData[]]> = async (
  rangeItem,
  fetchData,
  checkOverflowStart,
  checkOverflowEnd,
  onDataOverflow
) => {
  let passedData: RecipeData[] = [];

  let isOverflowStart = checkOverflowStart(rangeItem);
  let isOverflowEnd = checkOverflowEnd(rangeItem);

  rangeItem = { ...rangeItem };

  while (isOverflowStart || (isOverflowEnd && rangeItem.maxIndex)) {
    if (isOverflowEnd && !rangeItem.maxIndex) {
      break;
    }

    const newPage = rangeItem.page + (isOverflowStart ? -1 : 1);
    const data = await fetchData(newPage);

    if (!data) {
      if (isOverflowStart) {
        await onDataOverflow?.(-rangeItem.index);
        rangeItem.index = 0;
      } else if (isOverflowEnd && rangeItem.maxIndex) {
        await onDataOverflow?.(rangeItem.index - rangeItem.maxIndex);
        rangeItem.index = rangeItem.maxIndex;
      }
      break;
    }

    rangeItem.index = isOverflowStart
      ? data.length + rangeItem.index
      : rangeItem.index - data.length;
    rangeItem.maxIndex = data.length;
    rangeItem.page = newPage;

    const passedDataIndexStart = isOverflowStart ? rangeItem.index : 0;
    const passedDataIndexEnd = isOverflowStart
      ? rangeItem.maxIndex
      : rangeItem.index;

    const newPassedData = data.slice(passedDataIndexStart, passedDataIndexEnd);

    passedData = isOverflowStart
      ? [...newPassedData, ...passedData]
      : [...passedData, ...newPassedData];

    isOverflowStart = checkOverflowStart(rangeItem);
    isOverflowEnd = checkOverflowEnd(rangeItem);
  }

  return [rangeItem, passedData];
};
