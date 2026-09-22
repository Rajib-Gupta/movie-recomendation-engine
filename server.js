import { configDotenv } from "dotenv";
import { movies } from "./movies.js";
import { embeddings } from "./embeddings.js";

configDotenv();


async function chat(message) {
  const userQueryEmbedding = await embeddings(message);

  const moviesWithEmbeddings = await Promise.all(
    movies.map(async (movie) => {
      const movieEmbedding = await embeddings(movie.description);
      return { ...movie, embedding: movieEmbedding };
    }),
  );

  const recommendations = moviesWithEmbeddings
    .map((movie) => {
      const dotProduct = movie.embedding.reduce(
        (total, value, dimension) =>
          total + value * userQueryEmbedding[dimension],
        0,
      );
      
      const movieMagnitude = Math.hypot(...movie.embedding);
      const queryMagnitude = Math.hypot(...userQueryEmbedding);

      const similarity =
        movieMagnitude === 0 || queryMagnitude === 0
          ? 0
          : dotProduct / (movieMagnitude * queryMagnitude);

      return { ...movie, similarity };
    })
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 5);

  console.log("Top 5 recommended movies based on your query:");

  recommendations.forEach((movie, index) => {
    console.log(
      `${index + 1}. ${movie.title} - Similarity: ${movie.similarity.toFixed(
        4,
      )}`,
    );
  });

}

await chat("recommend me a movie about Action.");
