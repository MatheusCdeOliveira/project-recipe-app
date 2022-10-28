import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import copy from 'clipboard-copy';
import RecipeDetails from '../components/RecipeDetails';
import '../css/App.css';
import ShareIcon from '../images/shareIcon.svg';

const RECOMENDATION_NUMBER = 6;

function DrinksDetails({ match: { params: { id } } }) {
  const [recipe, setRecipe] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [recomendationFood, setRecomendationFood] = useState([]);
  const [renderBtn, setRenderBtn] = useState(false);
  const [renderContinue, setRenderContinue] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const history = useHistory();

  function getIngredients(item) {
    const recipeEntries = Object.entries(item);
    const ingredientList = recipeEntries
      .filter((entry) => entry[0].includes('Ingredient'))
      .filter((entry) => entry[1] !== null);
    setIngredients(ingredientList);
  }

  function getMeasures(item) {
    const recipeEntries = Object.entries(item);
    const measureList = recipeEntries
      .filter((entry) => entry[0].includes('Measure'))
      .filter((entry) => entry[1] !== ' ');
    setMeasures(measureList);
  }

  useEffect(() => {
    async function getRecipeById() {
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
      const { drinks } = await response.json();
      setRecipe(drinks[0]);
    }
    getRecipeById();
    setFavorites(JSON.parse(localStorage.getItem('favoriteRecipes')) || []);
  }, [id]);

  useEffect(() => {
    getIngredients(recipe);
    getMeasures(recipe);
  }, [recipe]);

  useEffect(() => {
    async function getRecomendationFood() {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
      const { meals } = await response.json();
      setRecomendationFood(meals.slice(0, RECOMENDATION_NUMBER));
    }
    getRecomendationFood();
  }, []);

  useEffect(() => {
    const doneRecipe = JSON.parse(localStorage.getItem('doneRecipes')) || [];
    const result = !doneRecipe.some((item) => item.id === id);
    setRenderBtn(result);
    const inProgressRecipe = JSON
      .parse(localStorage.getItem('inProgressRecipes')) || { meals: {}, drinks: {} };

    if (!Object.keys(inProgressRecipe).includes('drinks')) {
      setRenderContinue(null);
    } else {
      setRenderContinue(inProgressRecipe.drinks[id]);
    }
  }, [id]);

  const handleClick = () => {
    if (!renderContinue) {
      history.push(`/drinks/${id}/in-progress`);
    }
  };

  const handleShareBtn = () => {
    copy(`http://localhost:3000${history.location.pathname}`);
    setIsCopied(true);
  };

  const handleFavoriteBtn = () => {
    const newFavorites = [...favorites, {
      id: recipe.idDrink,
      type: 'drink',
      nationality: '',
      category: recipe.strCategory,
      alcoholicOrNot: recipe.strAlcoholic,
      name: recipe.strDrink,
      image: recipe.strDrinkThumb }];

    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
  };

  return (
    <div>
      <h1>{id}</h1>
      <RecipeDetails
        src={ recipe.strDrinkThumb }
        name={ recipe.strDrink }
        category={ recipe.strAlcoholic }
        ingredients={ ingredients }
        measures={ measures }
        instructions={ recipe.strInstructions }
      />
      <h2>Recomendation:</h2>
      <div className="carousel">
        {recomendationFood
          .map((e, index) => (
            <div
              className="carouselItem"
              key={ e.idMeal }
              data-testid={ `${index}-recommendation-card` }
            >
              <h3 data-testid={ `${index}-recommendation-title` }>{e.strMeal}</h3>
              <img src={ e.strMealThumb } alt={ e.strMeal } width="250px" />
            </div>))}

      </div>
      <div>
        {renderBtn
      && (
        <button
          className="fixed"
          type="button"
          data-testid="start-recipe-btn"
          onClick={ handleClick }
        >
          {renderContinue ? 'Continue Recipe' : 'Start Recipe'}
        </button>
      )}
        {isCopied && <p>Link copied!</p>}
        <button
          type="button"
          onClick={ handleShareBtn }
          className="btns"
          data-testid="share-btn"
        >
          <img src={ ShareIcon } alt="share button" />
        </button>
        <button
          className="btns"
          type="button"
          data-testid="favorite-btn"
          onClick={ handleFavoriteBtn }
        >
          Favorite

        </button>
      </div>
    </div>
  );
}

DrinksDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default DrinksDetails;
