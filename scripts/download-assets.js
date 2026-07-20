const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const OUT_DIR = path.join(__dirname, "..", "src", "assets", "images");

const ASSETS = [
  ["logo.svg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6716c6f0788fea834465d4bd_logo.svg"],
  ["arrow-down-right.svg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676578af54b0dae3be9f8482_arrow-down-right-mirrored.svg"],
  ["arrow-up-left.svg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676578af4fea0e0cc273666b_arrow-up-left-mirrored.svg"],
  ["hero-sun.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/679d39c6bfb55328a24b40c4_Sun%201-p-500.png"],
  ["hero-moon.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/679d40f304f43a0293bd031e_moon%202%20flipped-p-500.png"],
  ["favicon-32.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6a21f593625f5b9f4a56db3e_hightide_logo_logo.png"],
  ["apple-touch-icon.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6a21f59353c9a8204053eb53_hightide_logo_logo.png"],
  ["og-default.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/68002792e056fd5e9af99e23_Screenshot%202025-04-16%20at%2022.55.37.png"],
  ["store.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6798ca3710d1e7fd17ed2b49_store%203.png"],
  ["calendar.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/678ac01acf03169aeecb5b86_Calander%20styled.png"],
  ["bookings.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/678ac01a9b0db0f70f93c43e_Booking%20list%20styled.png"],
  ["tab-store-1.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67ff69f83b6e7fccf2033402_store.webp"],
  ["tab-store-2.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe31431c9bdb41fca1a253_store-listing-flexi.webp"],
  ["tab-store-3.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe31431811cbe6502c22ac_store-cart.webp"],
  ["tab-calendar-1.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe31439949e755fae2b4a5_calendar.webp"],
  ["tab-calendar-2.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe314361b39022f9330909_calendar-add-flexi.webp"],
  ["tab-bookings-1.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe314334b1a84e555b6fad_booking-list.webp"],
  ["tab-bookings-2.webp", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/67fe314309b78d4e95aec05f_fullbooking.webp"],
  ["feature-flexible.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/686d3524b4e0990279390dd2_NEW%20simple%20flexible.png"],
  ["feature-accom-tours.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/686d3522143f15286e080e72_Nightly%3ADaily%20(ed).png"],
  ["feature-packages.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6798ca3776f8e83043d6a550_Build%3Acustomize%202.png"],
  ["feature-extras.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/6798ca37d82f20bb50648cf6_Extras%20and%20add%20ons.png"],
  ["feature-channels.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/686d3521d94c403488a19614_Sync%20icon%20-%20(ed)%20(bigger).png"],
  ["feature-collaborate.png", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/678ac01b28b7a41b863a5d5a_collaborate%202.png"],
  ["use-surf-camp.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/671fc3633b8de155e8922951_Alentejo%20Surf%20Camp_Group%20surf%20lesson%202020.jpg"],
  ["use-retreat.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/671fc41e131129e9483a9b9d_crafting-the-perfect-retreat-theme.jpg"],
  ["use-accommodation.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/671feec2fbc6fab0145938a0_23432_exterior_north_carolina%20copy.jpg"],
  ["use-tours.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/671ff1a0f106cb8b6f857396_jipe-tour.jpg"],
  ["use-kite.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676d47be32846fc1ae10352a_david-courbit-LRHB0TQiAeM-unsplash.jpg"],
  ["use-boat.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676d492175098f632a572cae_dan-hadar-lXMec-zkCa4-unsplash.jpeg"],
  ["use-rental.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676d49dfed2ae13fa1dfa8bc_urban-sanden-RCF-_l7vITo-unsplash.jpg"],
  ["use-adventure.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676d4a1c744bf2c7bbe613ff_evan-wise-uf4UimTZmKw-unsplash.jpg"],
  ["use-more.jpg", "https://cdn.prod.website-files.com/6716c677dd9898a5cd13326f/676d4a9369d9ce6c85c3c5f9_benjamin-davies-mqN-EV9rNlY-unsplash.jpg"],
  ["blog-calendar.jpg", "https://cdn.prod.website-files.com/6716c678dd9898a5cd133365/68a459094ba68bda1c05740d_Your%20paragraph%20text.jpeg"],
  ["author-jose.jpg", "https://cdn.prod.website-files.com/6716c678dd9898a5cd133365/67f9323432f6a4e88916bff5_IMG_4251.JPG"],
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} => ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, url] of ASSETS) {
    const dest = path.join(OUT_DIR, name);
    process.stdout.write(`Downloading ${name}... `);
    try {
      await download(url, dest);
      console.log("ok");
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }
}

main();
