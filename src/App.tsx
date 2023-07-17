import RecipesList from './components/RecipesList';
import BeerRecipePage from './components/BeerRecipesPage';
import { useState } from 'react';
import classNames from 'classnames';

function App() {
  const [openedRecipeId, setOpenedRecipeId] = useState<number | null>(null);

  const handleRecipeOpen = (itemId: number) => {
    setOpenedRecipeId(itemId);
  };

  const handleRecipeClose = () => {
    setOpenedRecipeId(null);
  };

  return (
    <>
      <BeerRecipePage
        id={openedRecipeId ?? undefined}
        onClose={handleRecipeClose}
      />

      <div
        className={classNames('max-h-screen overflow-auto', {
          'overflow-hidden relative z-[1]': openedRecipeId !== null,
        })}
      >
        <RecipesList onRecipeOpen={handleRecipeOpen} />
      </div>
    </>
  );
}

export default App;
