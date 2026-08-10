module.exports = {
  eleventyComputed: {
    jsonLdGraph: (data) => {
      const faqItems = data.pricingPage?.faq;
      if (!Array.isArray(faqItems) || faqItems.length === 0) {
        return [];
      }

      return [
        {
          "@type": "FAQPage",
          "@id": `${data.site.url}/pricing/#faq`,
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
      ];
    },
  },
};
