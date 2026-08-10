module.exports = {
  eleventyComputed: {
    jsonLdGraph: (data) => {
      const siteUrl = data.site.url;
      const faqItems = [
        {
          question: "How is Hightide different from other booking systems?",
          answer:
            "We're built for businesses that got frustrated with existing options. Most booking software is either too rigid (forcing you into one way of selling) or overly complex and expensive. Hightide gives you simple, flexible tools whether you're managing just accommodation, just activities, or both together.",
        },
        {
          question: "What actually makes Hightide flexible?",
          answer:
            "Hightide's unique multi-listing approach lets you sell the same resource in completely different ways. One room becomes: nightly accommodation + weekly surf packages + fixed-date retreats. Customers see 3 different options in your store, but they're booking the same physical unit. And by \"room\" we mean anything — tipis, boats, lessons, whatever you're selling.",
        },
        {
          question: "Is Hightide easy to set up and start using?",
          answer:
            "Yes. Hightide is designed for DIY setup, with no technical skills required. Smaller or simpler businesses can get started quickly, while larger or more complex setups may take a bit more time. We offer a free onboarding call and a 30-day free trial to explore everything at your own pace.",
        },
        {
          question: "Can I turn off instant bookings and approve requests instead?",
          answer:
            "Yes! You can choose between instant booking (with full or partial payment) or request-only mode. With requests, you approve each booking and send a payment link when you're ready — giving you full control.",
        },
        {
          question: "How do I share my Online Store with customers?",
          answer:
            "Your online store has its own unique URL — hightide.app/bookings/your-business — which you can add to your website as a \"Book Now\" button, link from your social media, or even use as a standalone mini-site.",
        },
        {
          question: "Can I connect to a channel manager?",
          answer:
            "Yes. Hightide supports channel manager integrations for Airbnb, Booking.com, and similar platforms, allowing you to manage availability and rates all in one place.",
        },
        {
          question: "What is Linked Availability?",
          answer:
            "Linked availability allows you to connect two services, so that when one gets booked the other is blocked. Perfect if you only have one guide or instructor, but offer multiple tour types.",
        },
      ];

      return [
        {
          "@type": "SoftwareApplication",
          "@id": `${siteUrl}/#software`,
          name: "Hightide",
          applicationCategory: "BusinessApplication",
          applicationSubCategory: "Booking and operations software",
          operatingSystem: "Web",
          url: `${siteUrl}/`,
          description:
            "Booking and operations software for accommodation, activities and packages. Sell directly with a customisable Online Store, manage bookings and payments, and run day-to-day operations without commission on Online Store bookings.",
          provider: { "@id": `${siteUrl}/#organization` },
          publisher: { "@id": `${siteUrl}/#organization` },
          offers: [
            {
              "@type": "Offer",
              name: "Basic",
              url: `${siteUrl}/pricing/`,
              price: "59.00",
              priceCurrency: "EUR",
              description: "Up to 15 bookable units. Complete Hightide platform. Monthly price excluding VAT.",
              availability: "https://schema.org/InStock",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "59.00",
                priceCurrency: "EUR",
                billingDuration: "P1M",
                referenceQuantity: {
                  "@type": "QuantitativeValue",
                  value: "1",
                  unitCode: "MON",
                },
              },
            },
            {
              "@type": "Offer",
              name: "Pro",
              url: `${siteUrl}/pricing/`,
              price: "99.00",
              priceCurrency: "EUR",
              description:
                "Up to 40 bookable units, additional team access and Custom Store colors. Monthly price excluding VAT.",
              availability: "https://schema.org/InStock",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "99.00",
                priceCurrency: "EUR",
                billingDuration: "P1M",
                referenceQuantity: {
                  "@type": "QuantitativeValue",
                  value: "1",
                  unitCode: "MON",
                },
              },
            },
            {
              "@type": "Offer",
              name: "30-day free trial",
              url: data.site.signupUrl,
              price: "0",
              priceCurrency: "EUR",
              description: "Full platform trial. No credit card required.",
              availability: "https://schema.org/InStock",
            },
          ],
          featureList: [
            "Customisable Online Store",
            "Accommodation, activities and packages",
            "Connected booking calendar",
            "Stripe and PayPal payments",
            "Linked availability",
            "Day Planner and reports",
            "No commission on direct Online Store bookings",
          ],
        },
        {
          "@type": "FAQPage",
          "@id": `${siteUrl}/#faq`,
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
