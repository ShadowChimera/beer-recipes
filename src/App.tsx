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
      {openedRecipeId !== null && (
        <BeerRecipePage id={openedRecipeId} onClose={handleRecipeClose} />
      )}
      <div
        className={classNames({
          'overflow-hidden relative z-[1]': openedRecipeId !== null,
        })}
      >
        <RecipesList onRecipeOpen={handleRecipeOpen} />
      </div>
    </>
  );
}

export default App;
