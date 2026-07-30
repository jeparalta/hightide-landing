module.exports = {
  eleventyComputed: {
    title: (data) => data.industry.title,
    description: (data) => data.industry.description,
    ogImage: (data) => data.industry.image,
    jsonLd: (data) => {
      const page = data.exploreIndustryPages?.[data.industry?.slug];
      const faqItems = page?.faq?.items;
      if (!Array.isArray(faqItems) || faqItems.length === 0) {
        return "";
      }

      const mainEntity = faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }));

      return JSON.stringify({
        "@type": "FAQPage",
        "@id": `${data.site.url}/explore/industries/${data.industry.slug}/#faq`,
        mainEntity,
      });
    },
  },
};
