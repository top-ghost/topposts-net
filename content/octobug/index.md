---
  eleventyExcludeFromCollections: true
  layout: "layouts/home.njk"
  title: "Octobug: Post"
---

<div class="post">
    <h1 class="title">
        <input type="text" id="postTitleInput" placeholder="headline" />
    </h1>
    <div class="postbody">
      <textarea rows="10" id="postBodyTextarea" placeholder="post body (accepts markdown!)"></textarea>
    </div>
    <div class="tags">
      <input type="text" id="postTagsInput" placeholder="#add tags" list="all-tags"/>
      <div id="taggedList"></div>
      <input
        type="hidden"
        id="postTagsHiddenInput"
        name="tags"
        value=""
      />
    </div>
    <div class="controls">
      <form id="submitForm">
        <button id="postButton" type="submit">post now</button>
      </form>
    </div>
</div>

<datalist id="all-tags">
</datalist>

{% jstags %}

  <script type="module" src="/octobug/main.mjs"></script>
  <script type="module" src="/octobug/tag-autocomplete.mjs"></script>

{% endjstags %}
