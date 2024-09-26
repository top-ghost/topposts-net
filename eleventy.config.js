const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

const embeds = require("eleventy-plugin-embed-everything");
const eleventyAutoCacheBuster = require("eleventy-auto-cache-buster");
const slugify = require("slugify");
const he = require("he");

const SEC_PER_DAY = 24 * 60 * 60;
/**
 * @description returns the current time in swatch beats
 * @returns {string}
 */
function getSwatchBeats(timestamp) {
    const timeCET = convertTZ(new Date(timestamp), "Europe/Berlin");
    let current_seconds = timeCET.getSeconds() + timeCET.getMinutes() * 60 + timeCET.getHours() * 60 * 60;
    let swatch = "@" + ((current_seconds / SEC_PER_DAY) * 1000).toPrecision(5);
	  let fullDateString = `${new Intl.DateTimeFormat("en-us", {weekday: "short", month: "short", day: "numeric", year: "numeric"}).format(timeCET)} ${swatch}`
    return fullDateString;
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}


/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = async function(eleventyConfig) {
  const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");

  // Bundle js snippets
  eleventyConfig.addBundle("js");
  // Bundle js tags
  eleventyConfig.addBundle("jstags");

  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
    "./CNAME": "/CNAME",
    "./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
  });

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch content images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  // App plugins
  eleventyConfig.addPlugin(pluginDrafts);
  eleventyConfig.addPlugin(pluginImages);

  // Official plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(pluginBundle);

  // Third party plugins
  eleventyConfig.addPlugin(embeds, {
    twitter: {
      options: {
        cacheText: true,
      },
    },
  });

  eleventyConfig.addPlugin(eleventyAutoCacheBuster);

  // Collections
  eleventyConfig.addCollection("posts", function (collectionApi) {
	return collectionApi.getFilteredByGlob("content/post/*.md");
  });

  eleventyConfig.addCollection("reverseChron", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/post/*.md").reverse(); // lol sorry
  });

  // Filters
  eleventyConfig.addFilter("slug", (str) => {
    return slugify(he.decode(str), { remove: /[&,+()$~%.'":*?<>{}]/g });
  });

  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "dd LLLL yyyy"
    );
  });

  eleventyConfig.addFilter("beatsDate", (dateObj, format, zone) => {
    return getSwatchBeats(dateObj);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  // Return all the tags used in a collection
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => {
        return tagSet.add(tag);
      });
    }
    return Array.from(tagSet);
  });

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
    );
  });

  eleventyConfig.addFilter("truncate", (text, words, ellipsis) => {
    const wordsArray = text.split(" ").filter((token) => {
      return !(
        token.startsWith("<") ||
        token.startsWith(">") ||
        token.startsWith("http://") ||
        token.startsWith("https://")
      );
    });
    const wordCount = wordsArray.length;
    const ellipsisNeeded = ellipsis && wordCount > words;

    const startingText = wordsArray.slice(0, words).join(" ");
    if (startingText.length == 0) {
      return "(No text)";
    } else {
      return `${startingText}${ellipsisNeeded ? "…" : ""}`;
    }
  });

  // Customize Markdown library tings:
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "header-anchor",
        symbol: "#",
        ariaHidden: false,
      }),
      level: [1, 2, 3, 4],
      slugify: eleventyConfig.getFilter("slugify"),
      breaks: true,
      linkify: true,
      html: true,
    });
  });

  eleventyConfig.addShortcode("currentBuildDate", () => {
    return new Date().toISOString();
  });

  // Features to make your build faster (when you need them)

  // If your passthrough copy gets heavy and cumbersome, add this line
  // to emulate the file copy on the dev server. Learn more:
  // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // These are all optional:
    dir: {
      input: "content", // default: "."
      includes: "../_includes", // default: "_includes"
      data: "../_data", // default: "_data"
      output: "_site",
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.
    pathPrefix: "/",
  };
};
