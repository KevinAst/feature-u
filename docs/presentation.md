# Playful Features Video

**_Feature-Driven Development that "Plugs and Plays"_**

When grasping a new concept, it is sometimes better to see it in
action!  This section contains a screen cast video of a presentation
that has been given to a number of regional conferences and local
meetup groups.

The presentation closely follows the {{book.guide.basicConcepts}}
section, and demonstrates the newly developed concepts in a real world
app ({{book.ext.eateryNodW}}).


## Presentation Syllabus

**Feature-Driven Development** (**FDD**) has become more prevalent in
today's landscape, and for good reason! **FDD** is a lightweight Agile
technique, manifest in a project structure where your code is
organized by what it accomplishes (i.e. features), rather than lumping
all modules of like types into separate blobs of components, routes,
logic, actions, etc. This technique greatly improves your code
comprehension because there is a direct correlation between the
**problem space** _(the requirements)_ and the **implementation**
_(the code)_!

However, **FDD** involves more than just organizing your project's
directory structure into features. You want to encapsulate your
features into isolated and self-sufficient modules, and yet they must
also be able to collaborate with other features.

Truly isolated **FDD** is something that is **incredibly powerful**!
You can improve the modularity of your system by loosely coupling your
features, making your app easier to understand, develop, test, and
refactor. If done right, your features actually become **"miniature
applications"** that simply **plug-and-play** _(where the mere existence of a
feature dynamically exudes the characteristics it implements)_!

As it turns out there are a number of hurdles to overcome in order to
accomplish this. Rather than being left to fend for yourself, a new
utility called **feature-u** has already tackled these hurdles.

**feature-u** promotes a new and unique approach to **code
**organization** and app orchestration**.

With **feature-u** ...

- your features can be encapsulated and isolated
- they can collaborate with other features in an extendable way
- your components can employ cross-feature composition (even injecting
  their content autonomously)
- your features can initialize themselves
- they can be activated or deactivated at run-time
- and as a bonus, your frameworks will even auto-configure with only
  the active features (via a plugin architecture)

In short, your features **can become more playful** ... they can **plug-and-play**!

**feature-u** opens new doors into the exciting world of **FDD**. It frees you
up to focus your attention on the "business end" of your features!

## Presentation Resources

- **feature-u**:
  - [`slides`](https://speakerdeck.com/kevinast/playful-features-dot-dot-dot-feature-based-development-that-plugs-and-plays): presentation slides (PDF)
  - [`teaser`](http://bit.ly/feature-u-teaser): what is **feature-u**?
  - [`repo`](https://github.com/KevinAst/feature-u): source code
- **plugins** _(extending **feature-u**)_:
  - [`feature-redux`](https://github.com/KevinAst/feature-redux): [`redux`](https://redux.js.org/) plugin _(state management)_
  - [`feature-redux-logic`](https://github.com/KevinAst/feature-redux-logic): [`redux-logic`](https://github.com/jeffbski/redux-logic) plugin _(managing business logic and async processes)_
  - [`feature-router`](https://github.com/KevinAst/feature-router): StateRouter plugin _(feature-driven navigation using redux state)_
- **sample app**:
  - [`eatery-nod-w`](https://github.com/KevinAst/eatery-nod-w): a PWA web app **using feature-u** _(a Date Night Random Restaurant Selector)_


## Presentation

It is recommended that you initially view the video in it's entirety.
For subsequent review, you may directly reference specific sections
through the {{book.guide.playfulFeaturesVideo_TOC}} (just below the
video).

<p align="center">
  <iframe name="featureVideo"
          id="featureVideo"
          width="700"
          height="394"
          src="https://www.youtube.com/embed/VKdAC3-lKjo"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
</p>

## Video Table of Contents

<script>
  function advanceVideo(h, m, s) {
    var featureVideo = window.frames['featureVideo'];
    var startSeconds = h*3600 + m*60 + s;
    featureVideo.location.replace('https://www.youtube.com/embed/VKdAC3-lKjo?start=' + startSeconds + '&autoplay=1');
  }
</script>

<div style="overflow-y: scroll; height:350px; width:60%; border: 2px solid grey; margin-left: 30px; padding: 5px;">

<b>Intro</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,0,1)"  >0:01</span> Welcome
  <li><span class="video-link" onclick="advanceVideo(0,0,15)" >0:15</span> Bio
  <li><span class="video-link" onclick="advanceVideo(0,1,49)" >1:49</span> Playful Features Intro
  <li><span class="video-link" onclick="advanceVideo(0,2,30)" >2:30</span> Resource Review
</ul>

<b>Let's Begin</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0, 4, 37)">4:37</span> Let's Start
  <li><span class="video-link" onclick="advanceVideo(0, 4, 46)">4:46</span> Project Organization
  <li><span class="video-link" onclick="advanceVideo(0, 6, 48)">6:48</span> Goals/Hurdles
  <li><span class="video-link" onclick="advanceVideo(0, 8, 44)">8:44</span> Primary Tenets<br/>
  &nbsp;&nbsp;<span class="video-link" onclick="advanceVideo(0, 9, 13)">9:13</span> &nbsp; 1. Feature Runtime Consolidation<br/>
  &nbsp;&nbsp;<span class="video-link" onclick="advanceVideo(0, 10,03)">10:03</span>       2. Feature Collaboration
</ul>

<b>feature-u setup</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,11,42)">11:42</span> Why feature-u was created
</ul>

<b>Ultimate Goal</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,12, 5)">12:05</span> Plug-and-Play
  <li><span class="video-link" onclick="advanceVideo(0,13,29)">13:29</span> Covered in this Session
</ul>

<b>DEMO App</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,14,4)">14:04</span> eatery-nod uses feature-u
</ul>

<b>Sneak Peek</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,20,45)">20:45</span> Sneak Peek
<ol>
  <li><span class="video-link" onclick="advanceVideo(0,21, 3)">21:03</span> Simplified App Startup
  <li><span class="video-link" onclick="advanceVideo(0,23, 3)">23:03</span> Plug-and-Play
  <li><span class="video-link" onclick="advanceVideo(0,25,15)">25:15</span> A/B Feature Swap
</ol>
</ul>

<b>feature-u Solution</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,27,14)">27:14</span> feature-u basics
  <li><span class="video-link" onclick="advanceVideo(0,27,21)">27:21</span> launchApp()
  <li><span class="video-link" onclick="advanceVideo(0,27,58)">27:58</span> Feature objects
</ul>

<b>1. Feature Runtime Consolidation</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,29,27)">29:27</span> Feature Runtime Consolidation
  <li><span class="video-link" onclick="advanceVideo(0,29,48)">29:48</span> App Initialization
  <li><span class="video-link" onclick="advanceVideo(0,32,53)">32:53</span> Framework Configuration
  <li><span class="video-link" onclick="advanceVideo(0,36, 9)">36:09</span> DEMO (App Startup)
</ul>

<b>Feature Enablement</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,42,34)">42:34</span> Feature Enablement
  <li><span class="video-link" onclick="advanceVideo(0,43,39)">43:39</span> DEMO (Feature Enablement)
</ul>

<b>2. Feature Collaboration</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,45,45)">45:45</span> Feature Collaboration
  <li><span class="video-link" onclick="advanceVideo(0,46, 7)">46:07</span> fassets - Feature Assets
  <li><span class="video-link" onclick="advanceVideo(0,47,26)">47:26</span> fassets diagram
  <li>fassets Code Snippets
  <ul>
    <li><span class="video-link" onclick="advanceVideo(0,49,46)">49:46</span> PUSH: fassets define
    <li><span class="video-link" onclick="advanceVideo(0,50,58)">50:58</span> UI Composition
    <li><span class="video-link" onclick="advanceVideo(0,53,16)">53:16</span> PULL: Usage Contract (EXCITING)
  </ul>
  <li><span class="video-link" onclick="advanceVideo(0,57, 3)">57:03</span> DEMO (Feature Collaboration)
</ul>

<b>A/B Feature Swap</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(0,59,25)">59:25</span>   A/B Feature Swap
  <li><span class="video-link" onclick="advanceVideo(1, 2,15)">1:02:15</span> DEMO (A/B Feature Swap)
</ul>

<b>Final Thoughts</b><br/>
<ul>
  <li><span class="video-link" onclick="advanceVideo(1, 6,25)">1:06:25</span> feature-u Context Diagram
  <li><span class="video-link" onclick="advanceVideo(1, 7, 8)">1:07:08</span> Higher Level Abstraction
  <li><span class="video-link" onclick="advanceVideo(1, 8, 9)">1:08:09</span> feature-u is NON Intrusive!
  <li><span class="video-link" onclick="advanceVideo(1, 8,54)">1:08:54</span> feature-u frees you up!!
  <li><span class="video-link" onclick="advanceVideo(1, 9,31)">1:09:31</span> feature-u Benefits
  <li><span class="video-link" onclick="advanceVideo(1,10, 2)">1:10:02</span> That's all Folks
</ul>

</div>
