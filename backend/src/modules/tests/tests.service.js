import { CardModel } from "../cards/card.model.js";

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function generateTest(setId) {
  const cards = await CardModel.find({ setId });
  const jsonCards = cards.map((card) => card.toJSON());

  return jsonCards.map((card, index) => {
    const choices = shuffle([
      card.definition,
      ...shuffle(jsonCards.filter((item) => item.id !== card.id)).slice(0, 3).map((item) => item.definition)
    ]);

    return {
      id: `${card.id}-${index}`,
      cardId: card.id,
      type: index % 3 === 0 ? "written" : index % 3 === 1 ? "choice" : "trueFalse",
      prompt: card.term,
      answer: card.definition,
      choices,
      statement: `${card.term} = ${index % 2 === 0 ? card.definition : choices.find((choice) => choice !== card.definition) || card.definition}`
    };
  });
}
