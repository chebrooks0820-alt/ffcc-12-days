/* ============================================================
   FFCC 12 Days of Giving: the only file you need to edit.
   ============================================================ */
window.FFCC_CONFIG = {
  year: 2026,
  lastDay: 24,                  // Day 12 = December 24 (Day 1 = December 13)
  timezone: "America/Denver",   // each gift unlocks at 12:00 AM Mountain Time

  // Set to false before launch to disable the ?preview=YYYY-MM-DD test mode.
  allowPreview: true,

  siteTitle: "12 Days of Giving",
  orgName: "Foundation for Community Care",
  orgLocation: "Sidney, Montana",
  donateUrl: "#",               // TODO: general "Give to FFCC" link (footer button)
  raffleNote: "One entry per person per day. Winner announced after December 24.", // TODO: confirm rules

  // Cognito Forms embed.
  // In Cognito: Share > Embed > iFrame, then copy the URL inside src="..."
  // It looks like https://www.cognitoforms.com/f/XXXXXXXX/NN
  cognito: {
    embedUrl: "https://www.cognitoforms.com/FoundationForCommunityCare1/FFCCs12DaysOfChristmas",
    height: 720,
    prefillField: ""            // optional: name of a form field (e.g. "Day") to auto-fill with the day number
  },

  /* Each day: icon, title, short teaser (shown on the gift), then the
     content people see after opening it. body = array of paragraphs. */
  days: [
    {
      icon: "🎗️", title: "Cancer Center",
      headline: "Placeholder headline for the Cancer Center",
      body: ["Placeholder: what FFCC recently did for the Cancer Center and who it helps."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "👶", title: "Labor & Delivery",
      headline: "Placeholder headline for Labor & Delivery",
      body: ["Placeholder: what FFCC recently did for Labor & Delivery."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "🧸", title: "Pediatrics",
      headline: "Placeholder headline for Pediatrics",
      body: ["Placeholder: what FFCC recently did for Pediatrics."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "🩺", title: "Specialty Clinics",
      headline: "Placeholder headline for Specialty Clinics",
      body: ["Placeholder: what FFCC recently did for the Specialty Clinics."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "🚁", title: "Care Flight",
      headline: "Placeholder headline for Care Flight",
      body: ["Placeholder: what FFCC recently did for Care Flight."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "🌉", title: "Bridge Fund",
      headline: "Placeholder headline for the Bridge Fund",
      body: ["Placeholder: what the Bridge Fund recently did."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    {
      icon: "💛", title: "Cancer Coalition Fund",
      headline: "Placeholder headline for the Cancer Coalition Fund",
      body: ["Placeholder: what the Cancer Coalition Fund recently did."],
      linkLabel: "Learn more", link: "#", donateUrl: ""
    },
    { icon: "🎁", title: "Project 8 (placeholder)",  headline: "Placeholder headline", body: ["Placeholder content."], linkLabel: "Learn more", link: "#", donateUrl: "" },
    { icon: "🎁", title: "Project 9 (placeholder)",  headline: "Placeholder headline", body: ["Placeholder content."], linkLabel: "Learn more", link: "#", donateUrl: "" },
    { icon: "🎁", title: "Project 10 (placeholder)", headline: "Placeholder headline", body: ["Placeholder content."], linkLabel: "Learn more", link: "#", donateUrl: "" },
    { icon: "🎁", title: "Project 11 (placeholder)", headline: "Placeholder headline", body: ["Placeholder content."], linkLabel: "Learn more", link: "#", donateUrl: "" },
    { icon: "🎄", title: "Project 12 (placeholder)", headline: "Placeholder headline", body: ["Placeholder content."], linkLabel: "Learn more", link: "#", donateUrl: "" }
  ]
};
