# deeplhover

Deepl Hover is a chrome extension that uses DeepL to translate the text a user hovers over. 

I will put the extension store link once it passes through inspection
Update 9/19/21: Here is the link! https://chrome.google.com/webstore/detail/deepl-hover/pjebemlaembdkbgoldjpjdckbmggoclf?hl=en&authuser=0

# Pre-Development
## Idea

I am currently learning Japanese, and whenever I come across Japanese text on the internet (usually Youtube thumbnail titles) I copy and paste the text to DeepL, which is the most reliable online translator that I know of. However, constantly going back and forth between DeepL and Youtube is really tedious. 

At the same time, I was using https://github.com/melink14/rikaikun, which is a tooltip kanji dictionary. This is when I initially came up with the idea to make a tooltip translator using DeepL.

## Research

I saw 3 main challenges to this idea. 
1 - Saving the text the user hovers over in a variable
2 - Sending the text to DeepL's API
3 - Displaying text in a tooltip

I started scouring the internet for a mouseover text function, but to no avail. Most solutions recommending adding a div or span around the text you wanted hovered over, but this is not possible with a chrome extension and the solutions for a chrome extension only worked with text not surrounded by other containers, which is not what I was looking for as I wanted it to work in Youtube thumbnails.

Then I started to look at the source code of https://github.com/melink14/rikaikun. I thought I could find the mouseover text function here, however it was written in Typescript and the code was specialized for kanji so I didn't have any luck here.

I then started to search for tooltip translators in the chrome extension store and looked at the source code of a couple extensions. Luckily, https://github.com/ttop32/MouseTooltipTranslator was exactly the kind of source code I was looking for. Very well written and commented with very similar functionality to my idea.

# Development

I used https://github.com/ttop32/MouseTooltipTranslator as a base for this project. I copied over core parts of the code (getting mouseover text, tooltip html css) to my own directory, and added my own touches on top. However, learning manifest, Webpack and Vue was difficult and I ran into a lot of bugs and errors that really slowed down production. 

The DeepL API only allows 500K characters to be translated a month, so I added features that aim to make less API calls over all. Moreover since there are only 500K characters, I decided to publish the extension as unlisted instead of public so I don't run out of characters. 

Basically the core algorithm is:
- Get mouseover text (from Mouse Tooltip Translator)
- Check using free google translate API if the text is the language the user wants translated
- If yes, translate using DeepL API
- Display in tooltip (from Mouse Tooltip Translator)

When making the options page, I also realized I needed to have two very long lists of language options. I didn't wanna make a huge html div with lots of redundant code so I looked for a solution that looked nice. Mouse Tooltip Translator tackled this problem using Vue, so I thought it'd be nice to use Vue. Trying to use Vue came with its own set of problems but in the end I got that working as well.

And that's all for this extension!
