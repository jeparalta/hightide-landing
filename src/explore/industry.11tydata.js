module.exports = {
  eleventyComputed: {
    title: (data) => data.industry.title,
    description: (data) => data.industry.description,
  },
};
