import { configDotenv } from "dotenv";
import { movies } from "./movies.js";
import { embeddings } from "./embeddings.js";

configDotenv();

function getRecommendations(a, b) {
  let dotProduct = 0;
  let normalA = 0;
  let normalB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normalA += a[i] * a[i];
    normalB += b[i] * b[i];
  }

  if (normalA === 0 || normalB === 0) {
    return 0;
  } else {
    return dotProduct / (Math.sqrt(normalA) * Math.sqrt(normalB));
  }
}

async function chat(message) {
  const userQueryEmbedding = await embeddings(message);

  const scoredMovies = await Promise.all(
    movies.map(async (movie) => {
      const movieEmbedding = await embeddings(movie.description);
      const similarity = getRecommendations(userQueryEmbedding, movieEmbedding);
      return { ...movie, similarity };
    }),
  );

  console.log("Top 5 recommended movies based on your query:");

  scoredMovies
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .forEach((movie, index) => {
      console.log(
        `${index + 1}. ${movie.title} - Similarity: ${movie.similarity.toFixed(
          4,
        )}`,
      );
    });
}

await chat("recommend me a movie about Action.");
