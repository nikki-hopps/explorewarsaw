// This weekend's events. Replace this whole file each week.
// prompts/website-events-prompt.md asks Claude to output it in exactly this shape.
//
// Fields per event:
//   date     "YYYY-MM-DD"
//   title    event name
//   english  true if the event is in English
//   time     free text, e.g. "3:00PM" or "from 12:00PM (live band from 8PM)"
//   venue    venue name and address
//   price    free text, e.g. "FREE admission" or "from 25 PLN"
//   free     true if entry is free
//   link     booking or info URL ("" if none)

window.EVENTS = {
  weekendLabel: "Mar 14–15, 2026",
  events: [
    {
      date: "2026-03-14",
      title: "Saint Patrick's Long Weekend 🍀",
      english: true,
      time: "from 12:00PM (live band from 8PM)",
      venue: "Elektrownia Powiśle, Food Hall (Dobra 42)",
      price: "FREE admission (pay for food & drinks)",
      free: true,
      link: "",
    },
    {
      date: "2026-03-14",
      title: "Climate Board Games Day – \"Giercowanie\"",
      english: true,
      time: "from 10:00AM, all day (drop in anytime)",
      venue: "Gniazdo – Climate Activism Centre (Krucza 17)",
      price: "FREE (vegan snacks provided)",
      free: true,
      link: "",
    },
    {
      date: "2026-03-14",
      title: "THE WRITE PLACE: Creative Writing Improvisation",
      english: true,
      time: "3:00PM (~3–4 hrs, join/leave anytime)",
      venue: "Karrot – Kawa i Kultura (Częstochowska 20)",
      price: "FREE admission",
      free: true,
      link: "",
    },
    {
      date: "2026-03-14",
      title: "Spring Design Fair WZORY",
      english: false,
      time: "11:00AM–9:00PM (Sun 11:00AM–6:00PM)",
      venue: "Elektrownia Powiśle (Dobra 42)",
      price: "FREE admission",
      free: true,
      link: "",
    },
    {
      date: "2026-03-15",
      title: "Ghosted with Bianca Lala",
      english: true,
      time: "6:00PM",
      venue: "Południk Zero (Wilcza 25)",
      price: "from 25 PLN",
      free: false,
      link: "https://fienta.com/pl/ghosted-with-bianca-lala",
    },
    {
      date: "2026-03-15",
      title: "2.0 Comedy Show",
      english: true,
      time: "8:00PM (meet & greet from 7:00PM)",
      venue: "Południk Zero (Wilcza 25)",
      price: "30 PLN",
      free: false,
      link: "https://fienta.com/pl/2-0-comedy-show2-170249",
    },
    {
      date: "2026-03-15",
      title: "International Passion Concert: \"W AKCJI\" Choir & Scala Sancta",
      english: false,
      time: "5:00PM",
      venue: "Basilica of the Holy Cross (Krakowskie Przedmieście 3)",
      price: "FREE admission",
      free: true,
      link: "",
    },
  ],
};
