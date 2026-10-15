// Site settings: edit this file to change the book, projects and links.
// Anything marked TODO is a placeholder waiting for your real details.

window.SITE = {
  instagram: "https://www.instagram.com/explorewarsaw", // TODO: confirm handle
  email: "hello@example.com", // TODO: your contact email

  book: {
    title: "Your Book Title", // TODO
    subtitle: "A short line on what the reader gets", // TODO
    blurb:
      "Two or three sentences about the book: who it's for, what it helps them do, and why you're the person to write it. TODO.",
    price: "79 PLN", // TODO: must match the price in Stripe
    format: "Paperback · Ships within Poland", // TODO: or "E-book (PDF + EPUB)"
    cover: "", // TODO: e.g. "assets/book-cover.jpg" (leave empty for the placeholder)
    // Paste your Stripe Payment Link here (Stripe Dashboard → Payment Links → Create).
    // While empty, the button shows "Coming soon" instead of linking anywhere.
    stripePaymentLink: "",
    highlights: [
      "TODO: what's inside, point one",
      "TODO: point two",
      "TODO: point three",
    ],
  },

  projects: [
    {
      title: "Weekend Events Reels",
      text: "Every week: the best English-friendly and language-neutral events in Warsaw, on Instagram.",
      link: "https://www.instagram.com/explorewarsaw",
      linkLabel: "Follow on Instagram",
    },
    {
      title: "Project two", // TODO
      text: "Another project for expats: a guide, a meetup, a community. Replace this text.",
      link: "",
      linkLabel: "Coming soon",
    },
    {
      title: "Project three", // TODO
      text: "Room for one more. Delete this entry if you don't need it.",
      link: "",
      linkLabel: "Coming soon",
    },
  ],
};
